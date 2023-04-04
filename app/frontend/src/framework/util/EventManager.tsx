import SocketManagerSingleton from './SocketManager';
import { clientLogger } from './Logger';
import {
	EventDataObject,
	ListenerFunction,
} from '@edelgames/types/src/app/ApiTypes';
import EventBuffer from './EventBuffer';

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
	private eventBuffer: EventBuffer = new EventBuffer(5000, 10);

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

		// call buffered events
		const bufferedEvents = this.eventBuffer.getBufferedEvents(event);
		for (let bufferedEvent of bufferedEvents) {
			listener(bufferedEvent);
		}

		clientLogger.debug(
			`registered event subscription: ${event} and applied ${bufferedEvents.length} buffered events`
		);
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

	public publish(event: string, eventData: EventDataObject = {}, preventBuffer: boolean = false): void {
		clientLogger.debug('publishing event: ' + event, eventData);

		let foundListener = false;
		if (this.eventListeners[event]) {
			for (let listener of this.eventListeners[event]) {
				listener(eventData);
				foundListener = true;
			}
		}

		if (!foundListener && !preventBuffer) {
			this.eventBuffer.addBufferedEvent(event, eventData);
		}
	}
}

const eventManager = new EventManager();
export default eventManager;
