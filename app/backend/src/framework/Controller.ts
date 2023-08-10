import { Server, Socket } from 'socket.io';
import User from './User';
import roomManager from './RoomManager';
import { systemLogger } from './util/Logger';

export default class Controller {
	public static io: Server;
	public static connectedUsers = 0;

	constructor(io: Server) {
		if (Controller.io) {
			throw 'Cannot create multiple socket controllers!';
		}
		Controller.io = io;
	}

	onConnect(socket: Socket): void {
		// create user and register disconnect listener
		const user: User = new User(socket);
		socket.on('disconnect', this.onDisconnect.bind(this, socket));

		// debug output
		Controller.connectedUsers++;
		systemLogger.debug(
			`user ${user.getId()} (socket ${socket.id}) connected! (${
				Controller.connectedUsers
			} users in total)`
		);

		// switch user into lobby
		roomManager.getLobbyRoom().joinRoom(user);
	}

	onDisconnect(socket: Socket): void {
		const user = roomManager.getUserBySocketId(socket.id);
		if (!user) {
			systemLogger.warning(`Unregistered socket ${socket.id} disconnected!`);
			return;
		}

		Controller.connectedUsers--;
		systemLogger.debug(
			`user ${user.getId()} (socket ${socket.id}) disconnected! (${
				Controller.connectedUsers
			} users remaining)`
		);

		if (
			!user.isVerified() ||
			(user.getCurrentRoom() && user.getCurrentRoom().getRoomId() === 'lobby')
		) {
			// users in the lobby or guest users can simply be disconnected entirely
			user.destroyUser();
		} else {
			// users not in the lobby will leave their user object behind to allow reconnecting
			user.setSocket(null);
		}
	}
}
