import SocketManagerSingleton from './SocketManager';
import { clientLogger } from './Logger';
import {
	EventDataObject,
	ListenerFunction,
} from '@edelgames/types/src/app/ApiTypes';

// a list of functions for a specified event
interface ListenerFunctionList {
	[key: string]: ListenerFunction[];
}

// a special event object, that is explicitly used for direct "message" event communication
interface MessageEventObject extends EventDataObject {
	eventName: string;
	eventData: EventDataObject;
}

class EventManager {
	private eventListeners: ListenerFunctionList = {};

	constructor() {
		SocketManagerSingleton.subscribeEvent(
			'message',
			this.onSocketMessage.bind(this)
		);
	}

	public onSocketMessage(messageData?: EventDataObject): void {
		if (!messageData) {
			return;
		}

		let { eventName, eventData } = messageData as MessageEventObject;
		this.publish(eventName + 'EventNotified', eventData);
	}

	public subscribe(event: string, listener: ListenerFunction): void {
		if (!this.eventListeners[event]) {
			this.eventListeners[event] = [];
		}

		this.eventListeners[event].push(listener);
		clientLogger.debug('registered event subscription: ' + event);
	}

	public unsubscribe(event: string, listener: ListenerFunction): void {
		if (!this.eventListeners[event]) {
			return;
		}

		this.eventListeners[event] = this.eventListeners[event].filter(
			(el) => el !== listener
		);
		clientLogger.debug('unregistered event subscription: ' + event);
	}

	public publish(event: string, eventData: EventDataObject = {}): void {
		clientLogger.debug('publishing event: ' + event, eventData);
		if (this.eventListeners[event]) {
			for (let listener of this.eventListeners[event]) {
				listener(eventData);
			}
		}
	}
}

const eventManager = new EventManager();
export default eventManager;
