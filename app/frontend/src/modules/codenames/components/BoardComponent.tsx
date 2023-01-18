import React from "react";
import "./BoardComponent.scss"
import {BoardElement} from "../types/BoardElement";
import ModuleApi from "../../../framework/modules/ModuleApi";
import {Team} from "../types/Team";
import {PlayerUtils} from "../utils/PlayerUtils";

interface Props {
    guessState: boolean
    endState: boolean
    teams: Team[]
    board: BoardElement[][]
    gameApi: ModuleApi
    hint: string
    amount: number
}

export default class BoardComponent extends React.Component<Props,{}> {
    sendHint() {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "publishHint",
            hint: {
                word: (document.getElementById("hintInput") as HTMLInputElement)?.value ?? "",
                amnt: (document.getElementById("hintNumber") as HTMLInputElement)?.value ?? 0
            }
        });
    }

    stopGuessing() {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "done"
        });
    }

    markGuess(boardElement: BoardElement) {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "mark",
            mark: boardElement.word
        });
    }

    makeGuess(boardElement: BoardElement) {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "makeGuess",
            guess: boardElement.word
        });
    }

    restartGame() {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "restartGame"
        });
    }

    renderMarks(boardElement: BoardElement) {
        const marks = []

        for (const mark of boardElement.marks) {
            marks.push(<span className={"mark"} style={{backgroundColor: this.props.teams.find(team => team.investigators.includes(mark))?.teamColor ?? "#967c4b"}}>{mark}</span>)
        }

        return <>{marks}</>
    }

    renderBoard() {
        return this.props.board.map(boardRow => boardRow.map(boardElement => (
            <div key={boardElement.word} className={"boardElement"}
                 style={{backgroundColor: boardElement.category === 0 ? "#161616" : this.props.teams[boardElement.teamId]?.teamColor ?? "#967c4b"}}>
                <button className={"guessButton"} onClick={this.makeGuess.bind(this, boardElement)}
                        style={this.props.guessState && this.areGuessingButtonShown() && !boardElement.categoryVisibleForEveryone ? {} : {display: "none"}}/>
                <div className={"marks"} style={this.props.guessState ? {} : {display: "none"}}>
                    {this.renderMarks(boardElement)}
                </div>
                <div className={boardElement.word.length > 9 ? "boardElementContent longWord"+boardElement.word.length : "boardElementContent"}
                     onClick={this.props.guessState ? this.markGuess.bind(this, boardElement) : () => {}}>
                    {(boardElement.categoryVisibleForEveryone && !this.props.endState) ? <s>{boardElement.word}</s> : boardElement.word}
                </div>
            </div>
        )))
    }

    isInputBarShown(): boolean {
        // Anzeigen wenn:
        // - HintState + Spymaster + im Team "Dran"
        // - GuessState
        return (!this.props.guessState && PlayerUtils.isSpymaster(this.props.gameApi.getPlayerApi().getLocalePlayer().getUsername(), this.props.teams)
            && PlayerUtils.isInActiveTeam(this.props.gameApi.getPlayerApi().getLocalePlayer().getUsername(), this.props.teams) && !this.props.endState)
            || (this.props.guessState && !this.props.endState);
    }

    areGuessingButtonShown(): boolean {
        // Anzeigen wenn:
        // - Investigator + im Team "Dran"
        return !PlayerUtils.isSpymaster(this.props.gameApi.getPlayerApi().getLocalePlayer().getUsername(), this.props.teams)
            && PlayerUtils.isInActiveTeam(this.props.gameApi.getPlayerApi().getLocalePlayer().getUsername(), this.props.teams);
    }

    render() {
        return (<div className={"board"}>
            {this.renderBoard()}
            <div className={"inputBar"} hidden={!this.isInputBarShown()}>
                <input id={"hintNumber"} type={"number"} className={"hintNumber"} min={1} max={9} defaultValue={this.props.amount} disabled={this.props.guessState}/>
                <input id={"hintInput"} type={"text"} className={"hintInput"} placeholder={this.props.hint} disabled={this.props.guessState}/>
                <button className={this.props.guessState ? (this.props.guessState && !this.areGuessingButtonShown() ? "stopGuessingButton buttonDisabled" : "stopGuessingButton") : "hintButton"}
                        id={"stopGuessingButton"}
                        onClick={this.props.guessState ? this.stopGuessing.bind(this) : this.sendHint.bind(this)}>
                    {this.props.guessState ? "Raten beenden" : "Gebe Hinweis"}
                </button>
            </div>
            <div className={"endBar"} hidden={!this.props.endState || !this.props.gameApi.getPlayerApi().getLocalePlayer().isRoomMaster()}>
                <button className={"restartButton"}
                        id={"restartButton"}
                        onClick={this.restartGame.bind(this)}>
                    {"Neustarten"}
                </button>
            </div>
        </div>)
    }
}