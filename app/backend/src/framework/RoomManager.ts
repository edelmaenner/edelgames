import Room from './Room';
import User from './User';
import SocketManager from './util/SocketManager';
import Lobby from './Lobby';

class RoomManager {
	private readonly lobby: Lobby;
	private rooms: Room[] = [];

	constructor() {
		// create lobby room
		this.lobby = new Lobby();
	}

	// rooms require a user as the admin
	public createRoom(firstUser: User): void {
		const newRoom = new Room(firstUser);
		this.rooms.push(newRoom);
		firstUser
			.switchRoom(newRoom)
			.then(newRoom.sendRoomChangedBroadcast.bind(newRoom));
	}

	// rooms will be automatically removed, when the last user leaves
	public removeRoom(room: Room): void {
		if (room.getMemberCount() === 0) {
			this.rooms = this.rooms.filter((r) => r !== room);
		}
	}

	public getRoomById(roomId: string): Room {
		return this.rooms.find((room) => room.getRoomId() === roomId) || null;
	}

	public getLobbyRoom(): Lobby {
		return this.lobby;
	}

	public getRoomList(): Room[] {
		return this.rooms;
	}

	public updateLobbyMembersRoomData(): void {
		SocketManager.broadcast(
			this.getLobbyRoom().getRoomId(),
			'lobbyRoomsChanged',
			this.getLobbyMemberRoomData()
		);
	}

	public getLobbyMemberRoomData(): { rooms: object[] } {
		const roomData: { rooms: object[] } = {
			rooms: [],
		};

		for (const room of [...this.rooms, this.lobby]) {
			roomData.rooms.push({
				roomId: room.getRoomId(),
				roomName: room.getRoomName(),
				allowJoin: room.isPlayerJoinAllowed(),
				requirePassphrase: !!room.getRoomPassword(),
				roomMembers: room.getPublicRoomMemberList(),
			});
		}
		return roomData;
	}

	/**
	 * Searches for an existing user with the given authSessionId and returns is or null otherwise
	 */
	public isAuthenticatedUserAlreadyConnected(
		authSessionId: string
	): User | null {
		for (const room of [...this.rooms, this.lobby]) {
			for (const user of room.getRoomMembers()) {
				if (user.matchAuthenticationId(authSessionId)) {
					return user;
				}
			}
		}

		return null;
	}

	public getUserBySocketId(socketId: string): User | null {
		for (const room of [...this.rooms, this.lobby]) {
			for (const user of room.getRoomMembers()) {
				const socket = user.getSocket();
				if (socket && socket.id === socketId) {
					return user;
				}
			}
		}
		return null;
	}
}

const roomManager = new RoomManager();
export default roomManager;
