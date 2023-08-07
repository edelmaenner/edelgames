import ModuleGame from '../../framework/modules/ModuleGame';
import ModuleApi from '../../framework/modules/ModuleApi';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

/*
 * The actual game instance, that controls and manages the game
 */
export default class ExampleChatGame extends ModuleGame {
	onGameInitialize(): void {
		this.api
			.getEventApi()
			.addEventHandler(
				'userMessageSend',
				this.onUserMessageReceived.bind(this)
			);
	}

	onUserMessageReceived(eventData: EventDataObject) {
		this.api
			.getLogger()
			.debug(
				`User ID ${eventData.senderId} send in message: `,
				eventData.message
			);
		this.api.getPlayerApi().sendRoomMessage('serverMessageSend', {
			user: eventData.senderId,
			message:
				eventData.message +
				this.api.getConfigApi().getSingleStringConfigValue('example_config'),
		});
	}
}
