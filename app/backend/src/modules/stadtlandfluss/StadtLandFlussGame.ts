import ModuleGame from '../../framework/modules/ModuleGame';
import User from '../../framework/User';
import {
	GameState,
	Guesses,
	Players,
} from '@edelgames/types/src/modules/stadtLandFluss/SLFTypes';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

export const defaultSLFCategories = ['Stadt', 'Land', 'Fluss'];

/**
 * Main class for the Stadt Land Fluss game.
 */
export default class StadtLandFlussGame extends ModuleGame {
	gameState: GameState | null = null;

	/**
	 * Available / unused letters for this game.
	 */
	private availableLetters: string[] = Array.from({ length: 26 }, (v, k) =>
		String.fromCharCode(k + 65)
	);

	/**
	 * The possible game phases.
	 */
	private readonly gamePhases = {
		GUESSING: 'guessing',
		ROUND_RESULTS: 'round_results',
		END_SCREEN: 'end_screen',
	};

	/**
	 * Point values for invalid, duplicate and unique guesses.
	 */
	private readonly guessPoints = {
		INVALID: 0,
		MULTIPLE: 10,
		UNIQUE: 20,
	};

	/**
	 * Register the relevant event handlers and set up the initial player list.
	 */
	onGameInitialize(): void {
		const eventApi = this.api.getEventApi();
		eventApi.addEventHandler('nextRound', this.onNextRound.bind(this));
		eventApi.addEventHandler('updateGuesses', this.onUpdateGuesses.bind(this));
		eventApi.addEventHandler(
			'requestGameState',
			this.onRequestGameState.bind(this)
		);
		eventApi.addEventHandler('unready', this.onUnready.bind(this));
		eventApi.addEventHandler('playAgain', this.onPlayAgain.bind(this));
		eventApi.addEventHandler('setDownvote', this.onToggleDownvote.bind(this));

		this.gameState = this.createInitialGameState();

		// start game
		this.onNextRound({
			senderId: this.api.getPlayerApi().getRoomMaster().getId(),
		});
	}

	private createInitialGameState(): GameState {
		const players: Players = {};
		for (const roomMember of this.api.getPlayerApi().getRoomMembers()) {
			players[roomMember.getId()] = roomMember.getUsername();
		}

		return {
			active: true,
			config: {
				categories: this.api
					.getConfigApi()
					.getMultipleStringConfigValue(
						'slf_categories',
						defaultSLFCategories
					) as string[],
				rounds: this.api
					.getConfigApi()
					.getSingleNumberConfigValue('slf_num_rounds', 10),
			},
			guesses: {},
			players: players,
			round: 0,
			gamePhase: this.gamePhases.GUESSING,
			letter: '',
			ready_users: [],
			points: {},
			point_overrides: {},
		};
	}

	/**
	 * Send the current game state to all users or a specific one, if specified via the `user` parameter.
	 *
	 * @param {string} user
	 */
	private publishGameState(user: string | null = null) {
		const state = this.gameState;
		const toPublish = {
			active: state.active,
			players: state.players,
			config: state.config,
			round: state.round,
			guesses: state.guesses,
			gamePhase: state.gamePhase,
			letter: state.letter,
			ready_users: state.ready_users.length,
			points: state.points,
			point_overrides: state.point_overrides,
		};

		this.api.getLogger().debug('sending new game state:', toPublish);
		if (user !== null) {
			this.api
				.getPlayerApi()
				.sendPlayerMessage(user, 'updateGameState', toPublish);
		} else {
			this.api.getPlayerApi().sendRoomMessage('updateGameState', toPublish);
		}
	}

	/**
	 * Calculate the points for the current round.
	 */
	private calculatePointsForRound(): {
		[category: number]: { [userId: string]: number };
	} {
		const pointsForRound: { [category: string]: { [userId: string]: number } } =
			{};
		const letter = this.gameState.letter;
		const guesses = this.gameState.guesses;
		let guessForUser: { [category: string]: string };
		const guessesByCategory = new Map<string, { [guess: string]: string[] }>();
		let usersForGuess: string[];
		let guessesForSingleCategory: { [guess: string]: string[] } = {};

		for (const userId in guesses) {
			if (Object.prototype.hasOwnProperty.call(guesses, userId)) {
				guessForUser = guesses[userId][letter];
				if (guessForUser) {
					for (const category in guessForUser) {
						if (!guessesByCategory.has(category)) {
							guessesByCategory.set(category, {});
						}
						guessesForSingleCategory = guessesByCategory.get(category);
						usersForGuess = Object.prototype.hasOwnProperty.call(
							guessesForSingleCategory,
							guessForUser[category]
						)
							? guessesForSingleCategory[guessForUser[category]]
							: [];
						usersForGuess.push(userId);
						guessesForSingleCategory[guessForUser[category]] = usersForGuess;
						guessesByCategory.set(category, guessesForSingleCategory);
					}
				}
			}
		}

		guessesByCategory.forEach((entries, category) => {
			pointsForRound[category] = {};
			for (const currentGuess in entries) {
				if (Object.prototype.hasOwnProperty.call(entries, currentGuess)) {
					const usersForCurrentGuess = entries[currentGuess];
					let pointsForGuess: number;
					if (
						!currentGuess
							.toLowerCase()
							.startsWith(this.gameState.letter.toLowerCase())
					) {
						pointsForGuess = this.guessPoints.INVALID;
					}
					// Only one player has made this guess
					else if (usersForCurrentGuess.length === 1) {
						pointsForGuess = this.guessPoints.UNIQUE;
						// Two or more players have made this guess
					} else if (usersForCurrentGuess.length > 1) {
						pointsForGuess = this.guessPoints.MULTIPLE;
					}
					const playerCount = Object.keys(this.gameState.players).length;
					usersForCurrentGuess.forEach((u) => {
						if (
							playerCount > 1 &&
							this.gameState.point_overrides &&
							this.gameState.point_overrides[u] &&
							this.gameState.point_overrides[u][category] &&
							(Object.keys(this.gameState.point_overrides[u][category])
								?.length ??
								0 === playerCount - 1)
						) {
							pointsForRound[category][u] = 0;
						} else {
							pointsForRound[category][u] = pointsForGuess;
						}
					});
				}
			}
		});

		return pointsForRound;
	}

	/**
	 * Send the current game state to the user who requested it.
	 *
	 * @param {{ senderId: string, messageTypeId: string }} eventData
	 */
	private onRequestGameState(eventData: {
		senderId: string;
		messageTypeId: string;
	}): void {
		this.publishGameState(eventData.senderId);
	}

	/**
	 * Perform required tasks when a user joins.
	 *
	 * @param {{ newUser: User, userList: Array<{ username: string, id: string, picture: string | null, isRoomMaster: boolean }> }} eventData
	 */
	public onPlayerJoin(eventData: {
		newUser: User;
		userList: Array<{
			username: string;
			id: string;
			picture: string | null;
			isRoomMaster: boolean;
		}>;
	}): void {
		const user = eventData.newUser;
		this.api
			.getLogger()
			.debug(
				`User ${user.getId()} joined Stadt Land Fluss in room ${this.api.getGameId()}.`
			);
		if (!this.gameState.active && !(user.getId() in this.gameState.players)) {
			this.gameState.players[user.getId()] = user.getUsername();
			this.publishGameState();
			this.api
				.getLogger()
				.debug(
					`Added user ${user.getId()} (${user.getUsername()}) to the player list since the game is not active.`
				);
		}
	}

	/**
	 * Perform required tasks when a user leaves.
	 *
	 * @param {{ removedUser: User, userList: object[] }} eventData
	 */
	public onPlayerLeave(eventData: {
		removedUser: User;
		userList: object[];
	}): void {
		const user = eventData.removedUser;
		this.api
			.getLogger()
			.debug(
				`User ${user.getId()} left the Stadt Land Fluss room ${user
					.getCurrentRoom()
					.getRoomId()}.`
			);
		if (user.getId() in this.gameState.players) {
			delete this.gameState.players[user.getId()];
			this.gameState.ready_users = this.gameState.ready_users.filter(
				(id) => id !== user.getId()
			);
			if (
				Object.prototype.hasOwnProperty.call(
					this.gameState.guesses,
					user.getId()
				)
			) {
				delete this.gameState.guesses[user.getId()];
			}
			this.gameState.points[this.gameState.letter] =
				this.calculatePointsForRound();

			this.publishGameState();
			this.api
				.getLogger()
				.debug(
					`Removed ${user.getId()} (${user.getUsername()}) from the player list since they were in it.`
				);
		}
	}

	/**
	 * Start the next round.
	 *
	 * @param {{ senderId: string }} eventData
	 */
	private onNextRound(eventData: { senderId: string }): void {
		if (
			this.api.getPlayerApi().getRoomMaster().getId() === eventData.senderId
		) {
			if (this.gameState.round < this.gameState.config.rounds) {
				this.gameState.round += 1;
				this.gameState.letter = this.getRandomLetter();
				this.gameState.gamePhase = this.gamePhases.GUESSING;

				for (const roomMember of this.api.getPlayerApi().getRoomMembers()) {
					this.gameState.players[roomMember.getId()] = roomMember.getUsername();
				}
			} else {
				this.gameState.gamePhase = this.gamePhases.END_SCREEN;
			}

			this.gameState.point_overrides = {};

			this.publishGameState();
		}
	}

	/**
	 * Update the guesses for one user for the current categories.
	 *
	 * @param {{ senderId: string, guesses: string[], ready: boolean }} eventData
	 */
	private onUpdateGuesses(eventData: {
		senderId: string;
		guesses: Guesses;
		ready: boolean;
	}): void {
		if (
			!Object.prototype.hasOwnProperty.call(
				this.gameState.guesses,
				eventData.senderId
			)
		) {
			this.gameState.guesses[eventData.senderId] = {};
		}

		this.gameState.guesses[eventData.senderId][this.gameState.letter] =
			eventData.guesses[eventData.senderId][this.gameState.letter];

		if (
			eventData.ready &&
			!(eventData.senderId in this.gameState.ready_users)
		) {
			this.gameState.ready_users.push(eventData.senderId);
		}

		// All users finished guessing for the round
		if (
			this.gameState.ready_users.length ===
			Object.keys(this.gameState.players).length
		) {
			this.gameState.gamePhase = this.gamePhases.ROUND_RESULTS;
			this.gameState.ready_users = [];
			this.gameState.points[this.gameState.letter] =
				this.calculatePointsForRound();
			this.api.getLogger().debug('Switching to round results.');
		}

		this.publishGameState();
	}

	/**
	 * Set a player as "unready" for the current guessing phase.
	 *
	 * @param {{ senderId: string }} eventData
	 */
	private onUnready(eventData: { senderId: string }): void {
		this.gameState.ready_users = this.gameState.ready_users.filter(
			(id) => id !== eventData.senderId
		);
		this.publishGameState();
	}

	/**
	 * Reset the game and return to the initial config screen.
	 * @param {{ senderId: string }} eventData
	 */
	private onPlayAgain(eventData: { senderId: string }): void {
		if (
			this.api.getPlayerApi().getRoomMaster().getId() === eventData.senderId
		) {
			this.gameState = this.createInitialGameState();
			this.onNextRound({
				senderId: this.api.getPlayerApi().getRoomMaster().getId(),
			});
			this.publishGameState();
		}
	}

	/**
	 * Toggle a downvote for one guess by one player.
	 *
	 * @param {{ senderId: string, userId: string, category: string, isActive: boolean }} eventData
	 */
	private onToggleDownvote(eventData: {
		senderId: string;
		userId: string;
		category: string;
		isActive: boolean;
	}): void {
		const userId = eventData.userId;
		const category = eventData.category;
		const senderId = eventData.senderId;

		if (
			!Object.prototype.hasOwnProperty.call(
				this.gameState.point_overrides,
				userId
			)
		) {
			this.gameState.point_overrides[userId] = {};
		}

		if (!eventData.isActive) {
			//FIXME
			const voterIndex =
				this.gameState.point_overrides[userId][category]?.indexOf(senderId);
			if (voterIndex > -1) {
				//FIXME
				this.gameState.point_overrides[userId][category]?.splice(voterIndex, 1);
			}
		} else {
			if (
				!this.gameState.point_overrides[userId][category]?.includes(senderId)
			) {
				if (!this.gameState.point_overrides[userId]) {
					this.gameState.point_overrides[userId] = {};
				}
				if (!this.gameState.point_overrides[userId][category]) {
					this.gameState.point_overrides[userId][category] = [];
				}

				//FIXME
				this.gameState.point_overrides[userId][category]?.push(senderId);
			}
		}

		this.gameState.points[this.gameState.letter] =
			this.calculatePointsForRound();

		this.publishGameState();
	}

	/**
	 * Generate a random letter to use next.
	 */
	private getRandomLetter(): string {
		const letterIndex = Math.floor(
			Math.random() * this.availableLetters.length
		);
		if (this.availableLetters.length > 0) {
			const letter = this.availableLetters[letterIndex];
			this.availableLetters.splice(letterIndex, 1);
			return letter;
		}

		throw new Error(
			'For some reason more than 26 round were played. There are no more letters to use.'
		);
	}

	public onPlayerReconnect(eventData: EventDataObject | null) {
		const user = eventData.user as User;
		this.publishGameState(user.getId());
	}
}
