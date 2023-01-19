import AbstractState from "./AbstractState";
import {Team} from "../Team";
import InitialState from "./InitialState";
import Room from "../../../framework/Room";
import {BoardElement} from "../BoardElement";
import {Hint} from "../Hint";
import ModuleApi from "../../../framework/modules/ModuleApi";

export default class EndState extends AbstractState {
    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[], hint: Hint[]): AbstractState {
        if (eventData.action && eventData.action === "restartGame" && eventData.senderId === room.getRoomMaster().getId()) {
            return new InitialState(this.gameApi)
        }else{
            this.gameApi.getLogger().warning("illegal restart of game tryed")
        }
        return this
    }

    getName(): string {
        return "end";
    }

    constructor(gameApi: ModuleApi) {
        super(gameApi);
    }

    handleUserLeave(gameMembers: Team[], userid: string): void {
        gameMembers.forEach(team => team.removePlayer(userid))
    }
}