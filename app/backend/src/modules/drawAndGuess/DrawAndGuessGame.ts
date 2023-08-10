import ModuleGame from '../../framework/modules/ModuleGame';
import User from '../../framework/User';
import drawAndGuess from './DrawAndGuess';
import { clearTimeout } from 'timers';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import { GameConfigObject } from '@edelgames/types/src/modules/drawAndGuess/DAGTypes';

enum gameStates {
	CONFIGURATION = 'configuration',
	WORD_SELECTION = 'selecting',
	DRAWING = 'drawing',
	PREPARING_TURN = 'preparing_turn',
	CLOSING = 'closing',
}

export default class DrawAndGuessGame extends ModuleGame {
	// misc variables
	activePlayerIndex = 0;
	activePlayer: User = undefined; //
	activeGameState: gameStates = gameStates.CONFIGURATION; // what the server is currently doing
	round = 0;
	scoreboard: { [key: string]: number } = {};

	// configuration
	msUntilWordSelectionTimeout: number = 1000 * 10; // 10 sec -> the time for the active player to choose a word
	msUntilDrawingTimeout: number = 1000 * 60; // 60 sec -> the time for the players to draw and guess
	msUntilNextWordSelectionTimeout: number = 1000 * 5; // 5 sec -> the time for the players to see the solution
	maxHintsThreshold = 0.75; // the maximum percentage of hints, that will be given
	roundsToPlay = 10;

	// dynamic variables for active use -> do not change default value
	msToNextHint = 0;
	hintsTimer: NodeJS.Timeout = null;
	wordSelectionTimer: NodeJS.Timeout = null;
	wordDrawingTimer: NodeJS.Timeout = null;
	drawingTimerTimestamp = 0;
	activeWord: string = undefined; // the current word, that has to be guessed
	activeWordMask: string = undefined; // defines, what the players are allowed to see
	availableWords: string[] = ['you should', 'not see', 'this list'];
	playersWithCorrectGuess: { playerId: string; timing: number }[] = [];

	onGameInitialize(): void {
		this.api
			.getEventApi()
			.addEventHandler(
				'activeCanvasChanged',
				this.onActiveCanvasChanged.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler('activeWordChosen', this.onActiveWordChosen.bind(this));
		this.api
			.getEventApi()
			.addEventHandler('attemptGuess', this.onAttemptGuess.bind(this));
		this.api
			.getEventApi()
			.addEventHandler(
				'submitConfigAndStart',
				this.onSubmitConfigAndStart.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				'configChangedPreview',
				this.onConfigChangedPreview.bind(this)
			);
	}

	updateActivePlayer(stepToNextPlayer = false): void {
		const roomMembers = this.api.getPlayerApi().getRoomMembers();
		if (roomMembers.length === 0) {
			// no one left
			this.setGameState(gameStates.CLOSING);
			this.api.cancelGame();
			return;
		}

		if (stepToNextPlayer) {
			this.activePlayerIndex++;
		}

		this.activePlayerIndex %= roomMembers.length;
		if (stepToNextPlayer && this.activePlayerIndex === 0) {
			this.round++;

			if (this.round > this.roundsToPlay) {
				this.setGameState(gameStates.CONFIGURATION);
				return;
			} else {
				this.sendRoomChatMessage(
					null,
					'Runde ' + (this.round + 1),
					'next-round'
				);
			}
		}

		const previousActivePlayer = this.activePlayer;
		this.activePlayer = roomMembers[this.activePlayerIndex];

		if (previousActivePlayer !== this.activePlayer) {
			if (this.hintsTimer) {
				clearTimeout(this.hintsTimer);
			}

			// active player has changed -> notify players
			this.api.getPlayerApi().sendRoomMessage('activePlayerChanged', {
				activePlayer: this.activePlayer.getId(),
			});

			this.selectNewWordOptions();
			this.api
				.getPlayerApi()
				.sendPlayerMessage(this.activePlayer.getId(), 'wordSelectionOptions', {
					options: this.availableWords,
				});
			this.setGameState(gameStates.WORD_SELECTION);

			// start the timer for the word selection
			if (this.wordSelectionTimer) {
				clearTimeout(this.wordSelectionTimer);
			}
			this.wordSelectionTimer = setTimeout(
				this.onWordSelectionTimeout.bind(this),
				this.msUntilWordSelectionTimeout
			);
		}
	}

	selectNewWordOptions(): void {
		const wordList = drawAndGuess.getWordList();
		this.availableWords = [];
		for (let i = 0; i < 3; i++) {
			this.availableWords.push(
				wordList[Math.floor(Math.random() * wordList.length)]
			);
		}
	}

	createWordMask(
		resetWordMask = true,
		addVisibleCharacters = 0
	): { total: number; masked: number } {
		if (
			resetWordMask ||
			!this.activeWordMask ||
			this.activeWordMask.length !== this.activeWord.length
		) {
			this.activeWordMask = '_'.repeat(this.activeWord.length);
		}

		let newWordMask = '';
		let hiddenCharacterIndices = [];
		let totalCharacters = 0;
		const ignoredChars = [' ', '-', ',', '!'];

		for (let i = 0; i < this.activeWord.length; i++) {
			const char = this.activeWord.charAt(i);

			if (ignoredChars.indexOf(char) !== -1) {
				// ignored chars are always visible
				newWordMask += char;
			} else if (!resetWordMask && this.activeWordMask.charAt(i) !== '_') {
				// if the previous mask had this character already visible, let it stay visible
				newWordMask += char;
				totalCharacters++;
			} else {
				// every hidden character gets replaced by an underscore
				newWordMask += '_';
				totalCharacters++;
				hiddenCharacterIndices.push(i);
			}
		}

		hiddenCharacterIndices = hiddenCharacterIndices.sort(
			(/*a,b*/) => 0.5 - Math.random()
		);
		// show new characters
		for (let c = 0; c < addVisibleCharacters; c++) {
			if (hiddenCharacterIndices.length) {
				const rI = hiddenCharacterIndices.shift();
				newWordMask =
					newWordMask.substring(0, rI) +
					this.activeWord.charAt(rI) +
					newWordMask.substring(rI + 1);
			}
		}

		this.activeWordMask = newWordMask;
		return {
			total: totalCharacters,
			masked: hiddenCharacterIndices.length,
		};
	}

	onActiveCanvasChanged(eventData: EventDataObject) {
		if (this.activePlayer && this.activePlayer.getId() === eventData.senderId) {
			// only the active player can draw and send
			this.api
				.getPlayerApi()
				.sendRoomMessage('passiveCanvasChanged', eventData.canvasChangedEvent);
		}
	}

	// automatically decide for one of the available words, if the player does not answer fast enough
	onWordSelectionTimeout(): void {
		this.onActiveWordChosen({
			senderId: this.activePlayer.getId(),
			selection:
				this.availableWords[
					Math.floor(Math.random() * this.availableWords.length)
				],
		});
		this.wordSelectionTimer = null;
	}

	onActiveWordChosen(eventData: EventDataObject): void {
		if (this.activeGameState === gameStates.CLOSING) {
			return; // dont bother doing anything now
		}

		if (
			this.activeGameState === gameStates.WORD_SELECTION &&
			this.activePlayer &&
			this.activePlayer.getId() === eventData.senderId
		) {
			const selectedWord = eventData.selection;
			if (this.availableWords.indexOf(selectedWord) !== -1) {
				// success
				this.activeWord = selectedWord;
				const maskData = this.createWordMask(true);
				this.setGameState(gameStates.DRAWING);

				this.drawingTimerTimestamp = Date.now();

				// tell all players the wordmask
				this.api.getPlayerApi().sendRoomMessage('wordToGuessChanged', {
					mask: this.activeWordMask,
					timeUntil: this.drawingTimerTimestamp + this.msUntilDrawingTimeout,
				});

				// tell the painter the selected word
				this.api
					.getPlayerApi()
					.sendPlayerMessage(this.activePlayer.getId(), 'wordToDrawChanged', {
						word: this.activeWord,
					});

				if (this.wordDrawingTimer) {
					clearTimeout(this.wordDrawingTimer);
				}
				this.wordDrawingTimer = setTimeout(
					this.onDrawingTimeout.bind(this),
					this.msUntilDrawingTimeout
				);

				// set timeout for showing hints to the players
				if (maskData.total && this.maxHintsThreshold) {
					const timePerLetter = this.msUntilDrawingTimeout / maskData.total;
					this.msToNextHint = timePerLetter / this.maxHintsThreshold;

					if (this.hintsTimer) {
						clearTimeout(this.hintsTimer);
					}
					this.hintsTimer = setTimeout(
						this.onHintInterval.bind(this),
						this.msToNextHint
					);
				}
			} else {
				this.api
					.getPlayerApi()
					.sendPlayerBubble(eventData.senderId, 'Invalid selection!', 'error');
			}
		}
	}

	// when the drawing time is up
	onDrawingTimeout(): void {
		if (this.activeGameState === gameStates.CLOSING) {
			return; // dont bother doing anything now
		}

		this.setGameState(gameStates.PREPARING_TURN);

		const drawnMs = Date.now() - this.drawingTimerTimestamp;
		const drawnPct = drawnMs / this.msUntilDrawingTimeout;
		const guessPct =
			this.playersWithCorrectGuess.length /
			(this.api.getPlayerApi().getRoomMembers().length - 1);

		let avgTiming = 0;
		for (const data of this.playersWithCorrectGuess) {
			const { playerId, timing } = data;

			// the earlier the guess, the more points, but the earlier the round ended, the fewer points
			//  -> a guesser wants to guess a hard word early
			const timingPct = timing / drawnMs;
			const points = Math.floor(50 * (1 / timingPct));
			this.scoreboard[playerId] = (this.scoreboard[playerId] || 0) + points;
			avgTiming += timing;
		}

		// the longer the game, the more points. But the less correct guesses, the fewer points
		//  -> a painter wants the players to guess as late and as much as possible

		avgTiming /= this.playersWithCorrectGuess.length || 1;
		avgTiming /= drawnMs; // low value => easy drawing
		const painterPoints = 100 * drawnPct * (2 * guessPct) * avgTiming;

		this.scoreboard[this.activePlayer.getId()] =
			(this.scoreboard[this.activePlayer.getId()] || 0) +
			Math.floor(painterPoints);

		this.api.getPlayerApi().sendRoomMessage('drawingSolution', {
			solution: this.activeWord,
			scoreboard: this.scoreboard,
		});

		if (this.hintsTimer) {
			clearTimeout(this.hintsTimer);
		}

		this.setGameState(gameStates.PREPARING_TURN);
		this.activeWord = '';
		this.playersWithCorrectGuess = [];
		setTimeout(
			this.updateActivePlayer.bind(this, true),
			this.msUntilNextWordSelectionTimeout
		);
	}

	onHintInterval(): void {
		const maskData = this.createWordMask(false, 1);

		if (
			this.activeGameState === gameStates.DRAWING &&
			maskData.masked / maskData.total > 1 - this.maxHintsThreshold
		) {
			this.api.getPlayerApi().sendRoomMessage('wordToGuessChanged', {
				mask: this.activeWordMask,
			});

			if (maskData.total >= 0 && this.maxHintsThreshold >= 0) {
				this.hintsTimer = setTimeout(
					this.onHintInterval.bind(this),
					this.msToNextHint
				);
			}
		}
	}

	onPlayerLeave(eventData: EventDataObject): void {
		const removedUser = eventData.removedUser as User;

		this.sendRoomChatMessage(removedUser.getId(), 'left the game', 'error');
		// if this user was active, skip to the next one
		if (removedUser === this.activePlayer) {
			this.updateActivePlayer(false);
		}
	}

	onAttemptGuess(eventData: EventDataObject): void {
		const { senderId, guess } = eventData;

		if (
			this.activeGameState === gameStates.DRAWING &&
			senderId !== this.activePlayer.getId() &&
			!this.playersWithCorrectGuess.find((el) => el.playerId === senderId)
		) {
			const roomMembers = this.api.getPlayerApi().getRoomMembers();

			if (guess.trim().toLowerCase() === this.activeWord) {
				const now = Date.now();
				this.playersWithCorrectGuess.push({
					playerId: senderId,
					timing: now - this.drawingTimerTimestamp,
				});
				this.sendRoomChatMessage(
					senderId,
					'hat das Wort erraten',
					'success',
					now
				);

				if (this.playersWithCorrectGuess.length >= roomMembers.length - 1) {
					// all players guessed correctly! end the drawing phase!
					if (this.wordDrawingTimer) {
						clearTimeout(this.wordDrawingTimer);
					}
					this.onDrawingTimeout();
				}
			} else {
				this.sendRoomChatMessage(senderId, guess.trim().toLowerCase(), null);
			}
		}
	}

	sendRoomChatMessage(
		senderId: string | null,
		message: string,
		coloring: string | null = null,
		timestamp: number | null = null
	): void {
		this.api.getPlayerApi().sendRoomMessage('newGuessChatMessage', {
			sender: senderId,
			text: message,
			color: coloring,
			timestamp: timestamp ?? Date.now(),
		});
	}

	setGameState(state: gameStates): void {
		this.activeGameState = state;
		this.api.getPlayerApi().sendRoomMessage('gameStateChanged', {
			gameState: state,
		});
	}

	onConfigChangedPreview(eventData: EventDataObject): void {
		const drawAndGuessEvent = eventData;

		if (
			this.activeGameState !== gameStates.CONFIGURATION ||
			drawAndGuessEvent.senderId !==
				this.api.getPlayerApi().getRoomMaster().getId()
		) {
			return;
		}

		// configuration has changed -> notify players
		this.api.getPlayerApi().sendRoomMessage('configurationChanged', {
			configuration: drawAndGuessEvent.configuration,
		});
	}

	onSubmitConfigAndStart(eventData: EventDataObject): void {
		const { configuration, senderId } = eventData;

		if (
			this.activeGameState !== gameStates.CONFIGURATION ||
			senderId !== this.api.getPlayerApi().getRoomMaster().getId()
		) {
			return;
		}

		this.onConfigChangedPreview(eventData);

		// fix possible unallowed settings
		const limitedConfiguration = this.limitConfigurations(configuration);

		// save configuration
		this.msUntilDrawingTimeout = limitedConfiguration.drawingTime;
		this.msUntilWordSelectionTimeout = limitedConfiguration.choosingTime;
		this.maxHintsThreshold = limitedConfiguration.maxHints;
		this.roundsToPlay = limitedConfiguration.rounds;

		this.sendRoomChatMessage(null, 'Runde ' + (this.round + 1), 'next-round');
		this.setGameState(gameStates.PREPARING_TURN);
		this.updateActivePlayer();
	}

	private limitConfigurations(oldConfig: GameConfigObject): GameConfigObject {
		const clamp = (min: number, val: number, max: number): number => {
			return Math.min(max, Math.max(min, val));
		};

		// fix possible unallowed settings
		return {
			drawingTime: clamp(15000, oldConfig.drawingTime * 1000, 300000),
			choosingTime: clamp(5000, oldConfig.choosingTime * 1000, 60000),
			maxHints: clamp(0, oldConfig.maxHints / 100, 1),
			rounds: clamp(1, oldConfig.rounds, 10),
		};
	}

	public onPlayerReconnect(eventData: EventDataObject | null) {
		const user = eventData.user as User;
		const playerId = user.getId();

		this.api.getPlayerApi().sendPlayerMessage(playerId, 'activePlayerChanged', {
			activePlayer: this.activePlayer.getId(),
		});

		// tell all players the wordmask
		this.api.getPlayerApi().sendRoomMessage('wordToGuessChanged', {
			mask: this.activeWordMask,
			timeUntil: this.drawingTimerTimestamp + this.msUntilDrawingTimeout,
		});

		if (this.activePlayer.getId() === playerId) {
			this.api
				.getPlayerApi()
				.sendPlayerMessage(playerId, 'wordSelectionOptions', {
					options: this.availableWords,
				});

			// tell the painter the selected word
			this.api
				.getPlayerApi()
				.sendPlayerMessage(this.activePlayer.getId(), 'wordToDrawChanged', {
					word: this.activeWord,
				});
		}
		this.setGameState(this.activeGameState);
	}
}
