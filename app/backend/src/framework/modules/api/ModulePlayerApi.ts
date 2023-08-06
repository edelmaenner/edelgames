import ModuleApi from '../ModuleApi';
import Room from '../../Room';
import SocketManager from '../../util/SocketManager';
import User from '../../User';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

/*
 * This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModulePlayerApi {
	private readonly room: Room;
	private readonly moduleApi: ModuleApi;

	constructor(room: Room, moduleApi: ModuleApi) {
		this.room = room;
		this.moduleApi = moduleApi;
	}

	public sendRoomMessage(eventName: string, eventData: EventDataObject): void {
		const event = this.moduleApi.getGameId() + '_' + eventName;
		SocketManager.broadcast(
			this.room.getRoomId(),
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
		const user = this.getRoomMembers().find(
			(user) => user.getId() === playerId
		);
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
		const user = this.getRoomMembers().find(
			(user) => user.getId() === playerId
		);
		SocketManager.sendNotificationBubbleToSocket(
			user.getSocket(),
			message,
			type
		);
	}

	public sendRoomBubble(
		message: string,
		type: 'info' | 'error' | 'success' | 'warning' = 'info'
	): void {
		this.getRoomMembers().forEach((user) => {
			this.sendPlayerBubble(user.getId(), message, type);
		});
	}

	public getRoom(): Room {
		return this.room;
	}

	public getRoomMembers(onlyConnected = false): User[] {
		let members = this.room.getRoomMembers();
		if (onlyConnected) {
			members = members.filter((member) => member.isConnected());
		}
		return members;
	}

	public getRoomMaster(): User {
		return this.room.getRoomMaster();
	}

	public getPlayerById(id: string): User | undefined {
		return this.getRoomMembers().find((user) => user.getId() === id);
	}
}
