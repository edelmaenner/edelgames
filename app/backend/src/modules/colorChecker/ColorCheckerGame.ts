import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import User from '../../framework/User';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

/*
 * The actual game instance, that controls and manages the game
 */
export default class ColorCheckerGame implements ModuleGameInterface {
	// technical properties
	api: ModuleApi = null;
	playerIndex = 0;

	onGameInitialize(api: ModuleApi): void {
		this.api = api;
	}

	/*
        Locale (Server) Events
     */

	onPlayerLeft(eventData: EventDataObject): void {
		const removedUser = eventData.removedUser as User;

		this.api
			.getPlayerApi()
			.sendRoomBubble(removedUser.getUsername() + ' left the game', 'error');
	}

	getRandomDiceValue(min = 1, max = 6) {
		const range = max - min;
		return min + Math.floor(Math.random() * (range + 1));
	}
}
