import AbstractState from "./AbstractState";
import GuessState from "./GuessState";
import {Team} from "../Team";
import debug from "../../../framework/util/debug";
import Room from "../../../framework/Room";
import {BoardElement} from "../BoardElement";
import {Hint} from "../Hint";

export default class HintState extends AbstractState {
    currentTeamIndex = 0

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[])
        : AbstractState {
        if (eventData.action) {
            switch (eventData.action) {
                case "publishHint":
                    if(this.isPublishHintAllowed(eventData.senderId, eventData.hint, board, gameMembers))
                        return new GuessState(this.currentTeamIndex)
                    break;
                default:
                    debug(2,`User ID ${eventData.senderId} send in invalid action: `, eventData.action);
            }
        } else {
            debug(2,`User ID ${eventData.senderId} made illegal request, property action missing`);
        }
        return this;
    }

    getName(): string {
        return "hint";
    }

    // TODO 2: handle if spymaster of a team leaves
    handleUserLeave(gameMembers: Team[], userid: string): void {
        gameMembers.forEach(team => team.removePlayer(userid))
    }

    protected isPublishHintAllowed(userId: string, hint: Hint, board: BoardElement[], teams:Team[]):Boolean{
        if(hint && hint.word && hint.amnt && (teams[this.currentTeamIndex].spymaster === userId)){
            if(board.find(e => e.word === hint.word) === undefined && hint.amnt > 0){
                return true
            }
        }else{
            debug(2, "Invalid action due to missing property or invalid rights")
        }
        return false
    }
}