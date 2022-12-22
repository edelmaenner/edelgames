import AbstractState from "./AbstractState";
import HintState from "./HintState";
import debug from "../../../framework/util/debug";
import {Team} from "../Team";
import Room from "../../../framework/Room";
import {BoardElement, Category} from "../BoardElement";

export default class InitialState extends AbstractState {

    handleUserLeave(gameMembers: Team[], userid: string): void {
        gameMembers.forEach(team => team.removePlayer(userid))
    }
    getName(): string {
        return "start"
    }

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[]): AbstractState {
        if (eventData.action) {
            switch (eventData.action) {
                case "joinInvestigator":
                    this.joinInvestigator(eventData, gameMembers);
                    break;
                case "setSpymaster":
                    this.setSpymaster(eventData, gameMembers);
                    break;
                case "startGame":
                    if(this.isStartGameValid(eventData.senderId, room, gameMembers)){
                        // generate cards on board
                        this.setBoard(board)
                        return new HintState(0)
                    } else {
                        debug(2, `User ID ${eventData.senderId} send in invalid action: `
                            + eventData.action + "due to missing rights")
                    }
                    break;
                default:
                    debug(2,`User ID ${eventData.senderId} send in invalid action: `, eventData.action);
            }
        } else {
            debug(2,`User ID ${eventData.senderId} made illegal request, property action missing`);
        }
        return this;
    }

    private joinInvestigator(eventData: { [p: string]: any }, gameMembers: Team[]) {
        if(this.doesEventPropertyExist(eventData, "target")){
            let team = gameMembers.find(team => team.name === eventData.target)
            if(team){
                // leave all teams
                gameMembers.forEach(team => team.removePlayer(eventData.senderId))
                // join investigators
                team.addInvestigators(eventData.senderId)
            }else{
                this.debugIllegalPropertyValue(eventData.senderId, "target", eventData.target)
            }
        }
    }

    private setSpymaster(eventData: { [p: string]: any }, gameMembers: Team[]){
        if(this.doesEventPropertyExist(eventData, "target")){
            let team = gameMembers.find(team => team.name === eventData.target)
            if(team){
                // leave all teams
                gameMembers.forEach(team => team.removePlayer(eventData.senderId))
                // set spymaster
                gameMembers.find(team => team.name === eventData.target).setSpymaster(eventData.senderId)
            }else{
                this.debugIllegalPropertyValue(eventData.senderId, "target", eventData.target)
            }
        }
    }

    private isStartGameValid(senderId: string, room: Room, gameMembers: Team[]):Boolean{
        return senderId === room.getRoomMaster().getId()
            && gameMembers.find(
                team => team.spymaster === undefined || team.investigators === undefined
                    || team.investigators.length > 0
            ) === undefined
    }

    private setBoard(board: BoardElement[]){
        // TODO: add real data
        for (let i = 0; i < 5; i++) {
            board.push(new BoardElement("teamA", Category.team, "A"))
        }
        for (let i = 0; i < 5; i++) {
            board.push(new BoardElement("teamB", Category.team, "B"))
        }
        board.push(new BoardElement("bomb", Category.bomb, ""))
        for (let i = 0; i < 14; i++) {
            board.push(new BoardElement("neutral", Category.neutral, ""))
        }
    }
}