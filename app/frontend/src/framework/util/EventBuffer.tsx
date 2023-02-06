import {EventDataObject} from "@edelgames/types/src/app/ApiTypes";
import {clientLogger} from "./Logger";

type BufferedEvent = {
    eventName: string;
    eventData: EventDataObject;
    createdAt: number;
};


export default class EventBuffer {

    buffer: BufferedEvent[] = [];
    maxBufferSize: number;
    bufferTimeToLive: number; // in ms : 15s

    constructor(bufferTimeToLive: number = 15000, maxBufferSize: number = 49) {
        this.bufferTimeToLive = bufferTimeToLive;
        this.maxBufferSize = maxBufferSize;
    }

    getBufferedEvents(eventName: string): EventDataObject[] {
        let newBuffer: BufferedEvent[] = [];
        let pickedEvents: EventDataObject[] = [];

        const now = Date.now();
        for(let event of this.buffer) {
            if(event.eventName === eventName) {
                pickedEvents.push(event.eventData);
            }
            else if((now - event.createdAt) < this.bufferTimeToLive) {
                newBuffer.push(event);
            }
        }

        this.buffer = newBuffer;
        if(pickedEvents.length) {
            clientLogger.debug(`output ${pickedEvents.length} buffered events of type ${eventName}`);
        }
        return pickedEvents;
    }

    addBufferedEvent(eventName: string, eventData: EventDataObject): void {
        if(this.buffer.length > this.maxBufferSize) {
            // dump old events
            clientLogger.warning(`Removing ${this.buffer.length - this.maxBufferSize} unused event(s) from filled buffer`);
            this.buffer = this.buffer.slice(-this.maxBufferSize);
        }

        this.buffer.push({
            eventName: eventName,
            eventData: eventData,
            createdAt: Date.now()
        });
    }

}