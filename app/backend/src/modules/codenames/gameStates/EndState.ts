import AbstractState from "./AbstractState";
import {Team} from "../Team";

// TODO 1: restart funktion, (nur spielmaster kann das)
export default class EndState extends AbstractState {

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[]): AbstractState {
        return this
    }

    getName(): string {
        return "end";
    }

    handleUserLeave(gameMembers: Team[], userid: string): void {
    }
}