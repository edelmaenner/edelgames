import AbstractState from "./AbstractState";
import HintState from "./HintState";
import EndState from "./EndState";
import {Team} from "../Team";
import Room from "../../../framework/Room";
import {BoardElement, Category} from "../BoardElement";
import {Hint} from "../Hint";
import ModuleApi from "../../../framework/modules/ModuleApi";

export default class GuessState extends AbstractState {
    wordsLeft: Boolean
    guessesLeft: number

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[], hint: Hint)
        : AbstractState {
        if (eventData.action) {
            switch (eventData.action) {
                case "makeGuess":
                    if(this.isMakeGuessValid(eventData, board, gameMembers)){
                        var guessedCard = board.find((e:BoardElement) => e.word === eventData.guess)
                        // show guessed card
                        board[board.indexOf(guessedCard)].categoryVisibleForEveryone = true
                        // if teamcard was found -> update counter for according team
                        if(board[board.indexOf(guessedCard)].category === Category.team){
                            var teamOfCard = gameMembers.find(team => team.name == guessedCard.teamName)
                            gameMembers[gameMembers.indexOf(teamOfCard)].wordsLeft -= 1
                        }
                        // there are wordsleft if each team still has words to guess
                        this.wordsLeft = gameMembers.find(team => team.wordsLeft === 0) === undefined
                        if(this.wordsLeft){
                            // check if more guesses for team left and guess was correct
                            if(this.guessesLeft > 0
                                && board[board.indexOf(guessedCard)].category === Category.team
                                && board[board.indexOf(guessedCard)].teamName === gameMembers.find(team => team.active).name)
                            {
                                return new GuessState(this.guessesLeft-1, this.gameApi)
                            }else{
                                const currentActiveTeam = gameMembers.findIndex(team => team.active);
                                gameMembers[currentActiveTeam].active = false;
                                gameMembers[(currentActiveTeam+1)%gameMembers.length].active = true;
                                return new HintState(this.gameApi)
                            }
                        }
                        // make all cards visible
                        board.forEach(e => e.categoryVisibleForEveryone = true)
                        return new EndState(this.gameApi)
                    }
                    // TODO 2: evtl error mitteilen?
                    return this
                case "mark":
                    if(this.isMarkValid(eventData, board, gameMembers)){
                        const markedCard = board.find((e:BoardElement) => e.word === eventData.mark)
                        const username = this.gameApi.getPlayerApi().getPlayerById(eventData.senderId).getUsername()
                        if(markedCard.marks.includes(username)) {
                            markedCard.marks = markedCard.marks.filter(mark => mark !== username)
                        } else {
                            markedCard.marks.push(username)
                        }
                    }
                    this.gameApi.getLogger().warning("Invalid action mark was made: "+eventData)
                    return this
                case "done":
                    if(this.isDoneValid(eventData, gameMembers)){
                        const currentActiveTeam = gameMembers.findIndex(team => team.active);
                        gameMembers[currentActiveTeam].active = false;
                        gameMembers[(currentActiveTeam+1)%gameMembers.length].active = true;
                        return new HintState(this.gameApi)
                    }
                    this.gameApi.getLogger().warning("Invalid action done was made")
                    return this
                default:
                    this.gameApi.getLogger().warning(`User ID ${eventData.senderId} send in invalid action: `, eventData.action);
            }
        } else {
            this.gameApi.getLogger().warning(`User ID ${eventData.senderId} made illegal request, property action missing`);
        }
        return this;
    }

    constructor(guessesLeft: number, gameApi: ModuleApi) {
        super(gameApi)
        this.guessesLeft = guessesLeft
    }


    getName(): string {
        return "guess";
    }

    // TODO 2: handle if spymaster leaves the game
    handleUserLeave(gameMembers: Team[], userid: string): void {
        gameMembers.forEach(team => team.removePlayer(userid))
    }

    private isMakeGuessValid(eventData: { [p: string]: any }, board: BoardElement[], gameMembers: Team[]):Boolean{
        // Check if has guess and guess in words on board and if guesser has the needed rights
        return eventData.guess && !!board.find(e => e.word === eventData.guess)
            && !!gameMembers.find(team => !!team.investigators.find(inv => inv === eventData.senderId))?.active;
    }

    private isMarkValid(eventData: { [p: string]: any }, board: BoardElement[], gameMembers: Team[]):Boolean{
        return eventData.mark && !!board.find(e => e.word === eventData.mark)
            && !!gameMembers.find(team => !!team.investigators.find(inv => inv === eventData.senderId))?.active;
    }

    private isDoneValid(eventData: { [p: string]: any }, gameMembers: Team[]):Boolean{
        return !!gameMembers.find(team => !!team.investigators.find(inv => inv === eventData.senderId))?.active;
    }
}