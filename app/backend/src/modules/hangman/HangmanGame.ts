import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import {
	GameState,
	PlayerGuessedEventData,
	PlayerSubmittedWordEventData,
} from '@edelgames/types/src/modules/hangman/HMTypes';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import DrawAndGuess from '../drawAndGuess/DrawAndGuess';

export enum HangmanClientToServerEventNames {
	PLAYER_GUESSED = 'playerGuessed',
	PLAYERS_SUBMITTED_WORD = 'playerSubmittedWord',
}

/*
 * The actual game instance, that controls and manages the game
 */
export default class HangmanGame implements ModuleGameInterface {
	// technical properties
	api: ModuleApi = null;

	// configuration
	generateWordsAutomatically: boolean;
	minWordLength: number;
	maxWordLength: number;

	// game values
	round = 0;
	currentHostIndex = -1;
	activeGuesserIndex = -1;
	currentWord: string = undefined;
	guessedChars: string[] = [];

	// generated values
	activeGuesserId: string;
	currentHostId: string = undefined;

	onGameInitialize(api: ModuleApi): void {
		this.api = api;
		this.generateWordsAutomatically = api
			.getConfigApi()
			.getBooleanConfigValue('automated_words', false);
		this.minWordLength = api
			.getConfigApi()
			.getSingleNumberConfigValue('min_word_length', 5);
		this.maxWordLength = api
			.getConfigApi()
			.getSingleNumberConfigValue('max_word_length', 15);

		if (this.minWordLength > this.maxWordLength) {
			this.maxWordLength = this.minWordLength + 1;
			this.api
				.getPlayerApi()
				.sendRoomBubble(
					'Maximale Wortlänge geändert auf ' + this.maxWordLength,
					'warning'
				);
		}

		this.api
			.getEventApi()
			.addEventHandler(
				HangmanClientToServerEventNames.PLAYER_GUESSED,
				this.onPlayerGuessed.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				HangmanClientToServerEventNames.PLAYERS_SUBMITTED_WORD,
				this.onPlayerSubmittedWord.bind(this)
			);

		this.startNewRound();
	}

	/**
	 * Starts a new round by resetting data and requesting or generating a new word
	 */
	startNewRound(): void {
		this.round++;

		// reset old data
		this.guessedChars = [];

		if (this.generateWordsAutomatically) {
			// generate the next word
			this.currentWord = this.generateNewWord();
		} else {
			// cycle to next word host
			const roomMembers = this.api.getPlayerApi().getRoomMembers();
			this.currentHostIndex = (this.currentHostIndex + 1) % roomMembers.length;
			this.currentHostId = roomMembers[this.currentHostIndex].getId();

			// unset the old word
			this.currentWord = undefined;
		}

		this.continueGuessingWithNextPlayer(true);
		this.updateClients();
	}

	/**
	 * Rotates the guessing player while skipping the current host
	 * @param preventUpdatingClients
	 */
	continueGuessingWithNextPlayer(preventUpdatingClients = false): void {
		const roomMembers = this.api.getPlayerApi().getRoomMembers();
		this.activeGuesserIndex =
			(this.activeGuesserIndex + 1) % roomMembers.length;
		this.activeGuesserId = roomMembers[this.activeGuesserIndex].getId();

		if (this.activeGuesserId === this.currentHostId && roomMembers.length > 1) {
			this.continueGuessingWithNextPlayer();
		}

		if (preventUpdatingClients) {
			this.updateClients();
		}
	}

	/**
	 * Is called as soon as the active guesser sends a char.
	 * If it is valid, but not correct, the next user may guess.
	 * If it is valid and correct, the player can continue to guess (except if the word is complete)
	 * @param eventData
	 */
	onPlayerGuessed(eventData: EventDataObject): void {
		const { senderId } = eventData;
		const { char } = eventData as PlayerGuessedEventData;

		if (senderId !== this.activeGuesserId) {
			return;
		}

		if (this.guessedChars.includes(char)) {
			this.api
				.getPlayerApi()
				.sendPlayerBubble(
					senderId,
					`Das Symbol "${char}" wurde bereits geraten!`,
					'error'
				);
			return;
		}

		this.guessedChars.push(char);

		const isCorrectGuess = this.currentWord.includes(char);
		if (!isCorrectGuess) {
			this.continueGuessingWithNextPlayer();
			return;
		}

		// check winning condition
		const isWordGuessedCorrectly = this.currentWord
			.split('')
			.every((char) => this.guessedChars.includes(char));
		if (isWordGuessedCorrectly) {
			this.startNewRound();
		}
	}

	/**
	 * Is called as soon as the current host sends a word. If it is valid, the other players are allowed to guess now
	 * @param eventData
	 */
	onPlayerSubmittedWord(eventData: EventDataObject): void {
		const { senderId } = eventData;
		const { word } = eventData as PlayerSubmittedWordEventData;

		if (senderId !== this.currentHostId || typeof word !== 'string') {
			return;
		}

		if (word.length < this.minWordLength || word.length > this.maxWordLength) {
			this.api
				.getPlayerApi()
				.sendPlayerBubble(
					senderId,
					`Das Wort muss zwischen ${this.minWordLength} und ${this.maxWordLength} Zeichen lang sein!`
				);
			return;
		}

		this.currentWord = word;
		this.updateClients();
	}

	/**
	 * Sends an update event to all connected clients, containing the current game data
	 */
	updateClients(): void {
		const solutionChars = (this.currentWord || '').split('');
		const letters = solutionChars.map((char) => {
			return this.guessedChars.includes(char) ? char : undefined;
		});
		const wrongChars = this.guessedChars.filter(
			(char) => !solutionChars.includes(char)
		);

		this.api.getPlayerApi().sendRoomMessage('gameStateUpdated', {
			phase: this.currentWord === undefined ? 'spelling' : 'guessing',
			round: this.round,
			currentHostId: this.currentHostId,
			activeGuesserId: this.activeGuesserId,
			wrongChars: wrongChars,
			letters: letters,
			configuration: {
				autoGeneratedWords: this.generateWordsAutomatically,
				maxWordLength: this.maxWordLength,
				minWordLength: this.minWordLength,
			},
		} as GameState);
	}

	/**
	 * Returns a new word from the DrawAndGuess Wordlist, trying to follow the configured word length (but not forcing)
	 */
	generateNewWord(): string {
		const wordList = DrawAndGuess.getWordList();
		const validWordList = wordList.filter((word) => {
			return (
				word.length >= this.minWordLength && word.length <= this.maxWordLength
			);
		});

		return validWordList.length
			? validWordList[Math.floor(Math.random() * validWordList.length)]
			: wordList[Math.floor(Math.random() * wordList.length)];
	}
}
