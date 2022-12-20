import AbstractState from "./AbstractState";
import {Team} from "../Team";

// TODO 1: restart funktion, (nur spielmaster kann das)
export default class EndState extends AbstractState {

    idOfWinner: number

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[]): AbstractState {
        return this
    }

    getName(): string {
        return "end";
    }

    constructor(winnderId : number) {
        super();
        this.idOfWinner = winnderId
    }

    // TODO 1: implement
    handleUserLeave(gameMembers: Team[], userid: string): void {
    }
}