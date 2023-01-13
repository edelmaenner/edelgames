import { io, Socket } from 'socket.io-client';
import eventManager from './EventManager';
import { clientLogger } from './Logger';
import ProfileManager from './ProfileManager';
import { ListenerFunction } from '@edelgames/types/src/app/ApiTypes';
import env from "react-dotenv";

// helper constants don`t need a type, as it is recognized by the value
export const SocketEventNames = {
	connectionStatusChanged: 'connectionStatusChanged',
};

const PORT =
	(Number.parseInt(env.API_HTTP_PORT ?? '') || undefined) ?? 5000;
const DOMAIN = env.API_APP_DOMAIN ?? 'http://localhost';

class SocketManager {
	protected readonly socket: Socket;

	constructor() {
		clientLogger.debug(
			'Starting connection using environment variables ',
			env,
			`Resulting in ${DOMAIN}:${PORT}`
		);

		this.socket = io(DOMAIN + ':' + PORT);
		this.socket.on('connect', this.onConnectionStatusChanged.bind(this, true));
		this.socket.on(
			'disconnect',
			this.onConnectionStatusChanged.bind(this, false)
		);
		this.socket.on(
			'connect_error',
			this.onConnectionStatusChanged.bind(this, false)
		);
		this.socket.io.on('reconnect', this.onReconnected.bind(this));
	}

	protected onConnectionStatusChanged(status: boolean): void {
		eventManager.publish(SocketEventNames.connectionStatusChanged, {
			connected: status,
		});
	}

	protected onReconnected(): void {
		this.onConnectionStatusChanged(true);
		if (!ProfileManager.isVerified()) {
			ProfileManager.attemptAutomaticAuthLogin();
		}
	}

	public isConnected(): boolean {
		return !!this.socket?.connected;
	}

	public getSocket(): Socket {
		return this.socket;
	}

	public sendEvent(eventName: string, data: object): void {
		clientLogger.debug(
			`Sending event ${eventName} with `,
			data.hasOwnProperty('password') ? 'data' : data
		);
		this.socket.emit(eventName, data);
	}

	public subscribeEvent(eventName: string, listener: ListenerFunction): void {
		clientLogger.debug(`Subscribing event ${eventName} with `, listener);
		this.socket.on(eventName, listener);
	}
}

const socketManager = new SocketManager();
export default socketManager;
