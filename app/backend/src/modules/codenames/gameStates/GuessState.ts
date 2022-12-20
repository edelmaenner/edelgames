import AbstractState from "./AbstractState";
import HintState from "./HintState";
import EndState from "./EndState";
import {Team} from "../Team";
import Room from "../../../framework/Room";
import debug from "../../../framework/util/debug";
import {BoardElement, Category} from "../BoardElement";

export default class GuessState extends AbstractState {
    wordsLeft: Boolean
    currentTeamIndex: number
    guessesLeft: number

    onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[])
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
                                && board[board.indexOf(guessedCard)].teamName === gameMembers[this.currentTeamIndex].name)
                            {
                                return new GuessState(this.currentTeamIndex, this.guessesLeft-1)
                            }else{
                                return new HintState((this.currentTeamIndex+1)%gameMembers.length)
                            }
                        }
                        return new EndState(this.currentTeamIndex)
                    }
                    // TODO 2: evtl error mitteilen?
                    return this
                case "mark":
                    if(this.isMarkValid(eventData, board, gameMembers)){
                        var markedCard = board.find((e:BoardElement) => e.word === eventData.mark)
                        board[board.indexOf(markedCard)].marked = true
                    }
                    debug(2, "Invalid action mark was made: "+eventData)
                    return this
                case "done":
                    if(this.isDoneValid(eventData, gameMembers)){
                        return new HintState((this.currentTeamIndex+1)%gameMembers.length)
                    }
                    debug(2, "Invalid action done was made")
                    return this
                default:
                    debug(2,`User ID ${eventData.senderId} send in invalid action: `, eventData.action);
            }
        } else {
            debug(2,`User ID ${eventData.senderId} made illegal request, property action missing`);
        }
        return this;
    }

    constructor(currentTeamIndex: number, guessesLeft: number) {
        super()
        this.currentTeamIndex = currentTeamIndex
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
        return !!(eventData.guess && board.find(e => e.word === eventData.guess)
            && gameMembers[this.currentTeamIndex].investigators.find(eventData.senderId));
    }

    private isMarkValid(eventData: { [p: string]: any }, board: BoardElement[], gameMembers: Team[]):Boolean{
        return !!(eventData.mark && board.find(e => e.word === eventData.mark)
            && gameMembers[this.currentTeamIndex].investigators.find(eventData.senderId));
    }

    private isDoneValid(eventData: { [p: string]: any }, gameMembers: Team[]):Boolean{
        return !!gameMembers[this.currentTeamIndex].investigators.find(eventData.senderId);
    }
}