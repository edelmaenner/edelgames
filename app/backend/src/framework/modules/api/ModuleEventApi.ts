import ModuleApi from '../ModuleApi';
import SocketManager from '../../util/SocketManager';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

type internalEventHandlerFunction = (eventData: EventDataObject | null) => void;
type internalEventList = {
	[key: string]: internalEventHandlerFunction[];
};

export default class ModuleEventApi {
	private readonly moduleApi: ModuleApi;
	private eventListeners: internalEventList = {};

	constructor(moduleApi: ModuleApi) {
		this.moduleApi = moduleApi;
	}

	/*
	 * This method will be called automatically, every time an event is triggered.
	 * It can also be used to manage internal events for the current game
	 */
	public alertEvent(
		eventName: string,
		eventData: EventDataObject = null,
		skipPrefix = false
	): void {
		const event = skipPrefix
			? eventName
			: this.moduleApi.getGameId() + '_' + eventName;
		if (this.eventListeners[event]) {
			for (const listener of this.eventListeners[event]) {
				listener(eventData);
			}
		}
	}

	public addEventHandler(
		eventName: string,
		handler: internalEventHandlerFunction
	): void {
		const event = this.moduleApi.getGameId() + '_' + eventName;
		if (!this.eventListeners[event]) {
			this.eventListeners[event] = [];
		}
		this.eventListeners[event].push(handler);

		this.moduleApi.getLogger().info('registering event listener for ' + event);
	}

	// just an alias for addEventHandler('userJoined', handler) for better usability
	public addUserJoinedHandler(handler: internalEventHandlerFunction): void {
		this.addEventHandler('userJoined', handler);
	}

	// just an alias for addEventHandler('userReconnected', handler) for better usability
	public addUserReconnectedHandler(
		handler: internalEventHandlerFunction
	): void {
		this.addEventHandler('userReconnected', handler);
	}

	// just an alias for addEventHandler('userLeft', handler) for better usability
	public addUserLeaveHandler(handler: internalEventHandlerFunction): void {
		this.addEventHandler('userLeft', handler);
	}

	// just an alias for addEventHandler('gameStopped', handler) for better usability
	public addGameStoppedHandler(handler: internalEventHandlerFunction): void {
		this.addEventHandler('gameStopped', handler);
	}

	public sendRoomMessage(eventName: string, eventData: EventDataObject): void {
		const event = this.moduleApi.getGameId() + '_' + eventName;
		SocketManager.broadcast(
			this.moduleApi.getPlayerApi().getRoom().getRoomId(),
			'ServerToClientGameMessage',
			{
				messageTypeId: event,
				...eventData,
			}
		);
	}

	public sendPlayerMessage(
		playerId: string,
		eventName: string,
		eventData: EventDataObject
	): void {
		const event = this.moduleApi.getGameId() + '_' + eventName;
		const user = this.moduleApi
			.getPlayerApi()
			.getRoomMembers()
			.find((user) => user.getId() === playerId);
		SocketManager.directMessageToSocket(
			user.getSocket(),
			'ServerToClientGameMessage',
			{
				messageTypeId: event,
				...eventData,
			}
		);
	}

	public sendPlayerBubble(
		playerId: string,
		message: string,
		type: 'info' | 'error' | 'success' | 'warning' = 'info'
	): void {
		const user = this.moduleApi
			.getPlayerApi()
			.getRoomMembers()
			.find((user) => user.getId() === playerId);
		SocketManager.sendNotificationBubbleToSocket(
			user.getSocket(),
			message,
			type
		);
	}
}
