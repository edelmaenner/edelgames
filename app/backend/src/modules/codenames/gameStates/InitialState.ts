import AbstractState from "./AbstractState";
import HintState from "./HintState";
import debug from "../../../framework/util/debug";
import {Team} from "../Team";
import Room from "../../../framework/Room";
import {BoardElement, Category} from "../BoardElement";
import {Words} from "../WordList";

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
                        this.shuffleBoard(board)
                        return new HintState(0)
                    } else {
                        debug(2, `User ID ${eventData.senderId} send in invalid action: `
                            + eventData.action + " due to missing rights")
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
           // && gameMembers.find(
           //     team => team.spymaster === undefined || team.investigators === undefined
           //         || team.investigators.length === 0
           // ) === undefined
    }

    private setBoard(board: BoardElement[]) {
        const cardCount = 25;

        for (let i = 0; i < cardCount; i++) {
            let randomWord = Words[Math.floor(Math.random() * Words.length)]

            while (board.findIndex(element =>
                element.word === randomWord
            ) !== -1) {
                randomWord = Words[Math.floor(Math.random() * Words.length)]
            }

            let randomCategory, randomTeam;

            switch (true) {
                case (i >= 0 && i <= 9):
                    randomCategory = Category.team
                    break;
                case (i == 10):
                    randomCategory = Category.bomb
                    break;
                default:
                    randomCategory = Category.neutral
                    break;
            }

            switch (true) {
                case (i >= 0 && i <= 4):
                    randomTeam = "A"
                    break;
                case (i >= 5 && i <= 9):
                    randomTeam = "B"
                    break;
                default:
                    randomTeam = ""
                    break;
            }

            board.push(new BoardElement(randomWord, randomCategory, randomTeam));
        }
    }

    private shuffleBoard(board: BoardElement[]) {
        let currentIndex = board.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [board[currentIndex], board[randomIndex]] = [
                board[randomIndex], board[currentIndex]];
        }
    }
}