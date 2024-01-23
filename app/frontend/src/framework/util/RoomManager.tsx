/**
 * Stores and manages all data of the current room
 */
import User from './User';
import eventManager from './EventManager';
import {
	EventDataObject,
	ServerRoomObject,
} from '@edelgames/types/src/app/ApiTypes';
import { NativeConfiguration } from '@edelgames/types/src/app/ConfigurationTypes';

export const RoomEventNames = {
	roomChangedEventNotified: 'roomChangedEventNotified',
	lobbyRoomsChangedEventNotified: 'lobbyRoomsChangedEventNotified',
	roomUpdated: 'roomUpdated',
	returnToLobby: 'returnToLobby',
	createNewRoom: 'createNewRoom',
	joinRoom: 'joinRoom',
	returnToGameSelection: 'returnToGameSelection',
	changeRoomName: 'changeRoomName',
	changeRoomPass: 'changeRoomPass',
	changeRoomHost: 'changeRoomHost',
};

class RoomManager {
	private roomId: string = 'lobby';
	private roomName: string = 'Lobby';
	private roomPassword: string | undefined = undefined;
	private roomMembers: User[] = [];
	private roomMaster: User | null = null;
	private currentGameId: string = '';
	private currentGameConfig: NativeConfiguration | null = null;
	private isInGameEditingMode: boolean = false;

	constructor() {
		eventManager.subscribe(
			RoomEventNames.roomChangedEventNotified,
			this.onRoomChangedChannelNotified.bind(this)
		);
	}

	onRoomChangedChannelNotified(data?: EventDataObject): void {
		if (!data) {
			return;
		}

		data = data as ServerRoomObject;

		this.roomId = data.roomId;
		this.roomName = data.roomName;
		this.currentGameId = data.currentGameId;
		this.currentGameConfig = data.currentGameConfig;
		this.isInGameEditingMode = data.isEditingGameConfig;
		if (!data.requirePassphrase) this.roomPassword = undefined;

		// calculate new room members
		let roomMemberList: User[] = [];
		for (let member of data.roomMembers) {
			let user = new User(
				member.id,
				member.username,
				member.picture,
				member.isRoomMaster
			);

			if (member.isRoomMaster) {
				this.roomMaster = user;
			}

			roomMemberList.push(user);
		}
		this.roomMembers = roomMemberList;

		eventManager.publish(RoomEventNames.roomUpdated);
	}

	public getRoomId(): string {
		return this.roomId;
	}

	public getRoomName(): string {
		return this.roomName;
	}

	public setRoomName(name: string): void {
		this.roomName = name;
	}

	public getRoomPassword(): string | undefined {
		return this.roomPassword;
	}

	public setRoomPassword(password: string | undefined): void {
		this.roomPassword = password;
	}

	public getRoomMembers(): User[] {
		return this.roomMembers;
	}

	public getRoomMaster(): User | null {
		return this.roomMaster;
	}

	public getCurrentGameId(): string {
		return this.currentGameId;
	}

	public getCurrentGameConfig(): NativeConfiguration | null {
		return this.currentGameConfig;
	}

	public isInConfigEditingMode(): boolean {
		return this.isInGameEditingMode;
	}

	public setConfigEditingMode(active: boolean): void {
		this.isInGameEditingMode = active;
	}
}

const roomManager = new RoomManager();
export default roomManager;