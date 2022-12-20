import AbstractState from "./AbstractState";
import InitialState from "./InitialState";
import {Team} from "../Team";

// TODO: restart funktion, (nur spielmaster kann das)
export default class EndState extends AbstractState {

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[]): AbstractState {
        return this
    }

    onStateLeave(): AbstractState {
        return new InitialState()
    }

    getName(): string {
        return "end";
    }

    handleUserLeave(gameMembers: Team[], userid: string): void {
    }
}