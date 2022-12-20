import AbstractState from "./AbstractState";
import HintState from "./HintState";
import EndState from "./EndState";
import {Team} from "../Team";
import Room from "../../../framework/Room";
import debug from "../../../framework/util/debug";
import {BoardElement} from "../BoardElement";

// TODO 1: funktion guess markieren, funktion guess abschicken, intern abbruchbedingung checken
// TODO 1: Außerdem: rechteprüfung
export default class GuessState extends AbstractState {
    wordsLeft: Boolean
    currentTeamIndex: number

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[]): AbstractState {
        if (eventData.action) {
            switch (eventData.action) {
                case "makeGuess":
                    if(this.makeGuess())
                        if(this.wordsLeft)
                            return new HintState()

                        return new EndState()
                default:
                    debug(2,`User ID ${eventData.senderId} send in invalid action: `, eventData.action);
            }
        } else {
            debug(2,`User ID ${eventData.senderId} made illegal request, property action missing`);
        }
        return this;
    }

    constructor(currentTeamIndex: number) {
        super()
        this.currentTeamIndex = currentTeamIndex
    }


    getName(): string {
        return "guess";
    }

    handleUserLeave(gameMembers: Team[], userid: string): void {
    }

    private makeGuess():Boolean{
        //TODO 1: implement
        return false
    }
}