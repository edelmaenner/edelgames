import AbstractState from "./AbstractState";
import GuessState from "./GuessState";
import {Team} from "../Team";
import debug from "../../../framework/util/debug";
import Room from "../../../framework/Room";
import {BoardElement} from "../BoardElement";
import {Hint} from "../Hint";

// TODO 1: done()-funktion -> checkt ob, guess == wörter oder contained & nur alphabetisch & anzahl sinnvoll
// TODO 1: rechteprüfung
export default class HintState extends AbstractState {

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[])
        : AbstractState {
        if (eventData.action) {
            switch (eventData.action) {
                case "publishHint":
                    this.publishHint(eventData.senderId, eventData.hint, room, board)
                    break;
                default:
                    debug(2,`User ID ${eventData.senderId} send in invalid action: `, eventData.action);
            }
        } else {
            debug(2,`User ID ${eventData.senderId} made illegal request, property action missing`);
        }
        return this;
    }

    onStateLeave(): AbstractState {
        return new GuessState()
    }

    getName(): string {
        return "hint";
    }

    // TODO 2: handle if spymaster of a team leaves
    handleUserLeave(gameMembers: Team[], userid: string): void {
        gameMembers.forEach(team => team.removePlayer(userid))
    }

    // TODO 1:
    protected publishHint(userId: string, hint: Hint, room: Room, board: BoardElement[]):Boolean{
        if(hint){
            // if userId == spymaster of current team (which turn it is)
            // check if hint is valid
            return true;
        }else{
            debug(2, "Invalid action due to missing hint property")
            return false;
        }
    }
}