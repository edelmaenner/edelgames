import AbstractState from "./AbstractState";
import GuessState from "./GuessState";
import {Team} from "../Team";
import Room from "../../../framework/Room";
import {BoardElement} from "../BoardElement";
import {Hint} from "../Hint";
import ModuleApi from "../../../framework/modules/ModuleApi";

export default class HintState extends AbstractState {
    constructor(gameApi: ModuleApi) {
        super(gameApi)
    }

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[], hint: Hint[])
        : AbstractState {
        if (eventData.action) {
            switch (eventData.action) {
                case "publishHint":
                    if(this.isPublishHintAllowed(eventData.senderId, eventData.hint, board, gameMembers)) {
                        // FIXME: Hier wird der Hint nicht zurück an das "CodenamesGame" gegeben
                        hint.push(eventData.hint)
                        // remove all marks for next guess round
                        board.forEach(e => e.marks = [])
                        return new GuessState(eventData.hint.amnt+1, this.gameApi)
                    }
                    break
                default:
                    this.gameApi.getLogger().warning(`User ID ${eventData.senderId} send in invalid action: `, eventData.action);
            }
        } else {
            this.gameApi.getLogger().warning(`User ID ${eventData.senderId} made illegal request, property action missing`);
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
        if(hint && hint.word && hint.amnt && !!teams.find(team => team.spymaster === userId)?.active && !hint.word.includes(" ")){
            if(board.find(e => e.word === hint.word) === undefined && hint.amnt > 0){
                return true
            }
        }else{
            this.gameApi.getLogger().warning("Invalid action due to missing property or invalid rights")
        }
        return false
    }
}