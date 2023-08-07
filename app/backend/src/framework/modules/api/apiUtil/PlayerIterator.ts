import ModuleApi from '../../ModuleApi';
import User from '../../../User';

/**
 * @description Provides improved usability for nodeJS Timeout and Interval, such as custom strings as identifiers or a maximum number of interval call
 */
export default class PlayerIterator {
	private readonly api: ModuleApi;

	private currentPlayer: User;

	constructor(api: ModuleApi) {
		this.api = api;
		this.currentPlayer = api.getPlayerApi().getRoomMembers()[0];
	}

	public getCurrentPlayer(): User {
		return this.currentPlayer;
	}

	/**
	 * @description Returns the current player
	 */
	public getCurrentPlayerIndex(): number {
		return this.api.getPlayerApi().getRoomMembers().indexOf(this.currentPlayer);
	}

	/**
	 * @description Advances the player (overflowing if necessary) and returns the new current player
	 */
	public getNextPlayer(): User {
		let setNextPlayer = false;
		const roomMembers = this.api.getPlayerApi().getRoomMembers();

		for (const player of roomMembers) {
			if (player === this.currentPlayer) {
				setNextPlayer = true;
			} else if (setNextPlayer) {
				this.currentPlayer = player;
				return player;
			}
		}

		// overflow
		this.currentPlayer = roomMembers[0];
		return this.currentPlayer;
	}

	/**
	 * @description Advances the current player by n steps and returns the new player
	 * @param n
	 */
	public advancePlayers(n: number): User {
		if (n <= 0) {
			return this.currentPlayer;
		}

		const availablePlayers = this.api.getPlayerApi().getRoomMembers().length;
		for (n %= availablePlayers; n > 0; n--) {
			this.getNextPlayer();
		}

		return this.currentPlayer;
	}
}
