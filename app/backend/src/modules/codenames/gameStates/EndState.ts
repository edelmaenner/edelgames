import AbstractState from "./AbstractState";
import {Team} from "../Team";
import InitialState from "./InitialState";
import Room from "../../../framework/Room";
import {BoardElement} from "../BoardElement";
import debug from "../../../framework/util/debug";
import {Hint} from "../Hint";

export default class EndState extends AbstractState {

    idOfWinner: number

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[], hint: Hint): AbstractState {
        if (eventData.action && eventData.action === "restartGame" && eventData.senderId === room.getRoomMaster().getId()) {
            return new InitialState()
        }else{
            debug(2,"illegal restart of game tryed")
        }
        return this
    }

    getName(): string {
        return "end";
    }

    constructor(winnderId : number) {
        super();
        this.idOfWinner = winnderId
    }

    handleUserLeave(gameMembers: Team[], userid: string): void {
        gameMembers.forEach(team => team.removePlayer(userid))
    }
}