import React from "react";
import "./BoardComponent.scss"
import {BoardElement} from "../types/BoardElement";
import ModuleGameApi from "../../../framework/modules/ModuleGameApi";
import {Team} from "../types/Team";

interface Props {
    hintState: boolean
    teams: Team[]
    board: BoardElement[][]
    gameApi: ModuleGameApi
    hint: string
    amount: number
}

export default class BoardComponent extends React.Component<Props,{}> {
    sendHint() {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "publishHint",
            hint: {
                word: (document.getElementById("hintInput") as HTMLInputElement)?.value ?? "",
                amnt: (document.getElementById("hintNumber") as HTMLInputElement)?.value ?? 0
            }
        });
    }

    stopGuessing() {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "done"
        });
    }

    markGuess(boardElement: BoardElement) {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "mark",
            mark: boardElement.word
        });
    }

    makeGuess(boardElement: BoardElement) {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "makeGuess",
            guess: boardElement.word
        });
    }

    renderBoard() {
        return this.props.board.map(boardRow => boardRow.map(boardElement => (
            <div key={boardElement.word} className={"boardElement"}
                 style={{backgroundColor: boardElement.category === 0 ? "#161616" : this.props.teams[boardElement.teamId]?.teamColor ?? "#967c4b"}}
                 onClick={this.props.hintState ? this.markGuess.bind(this, boardElement) : () => {}}>
                <button className={"guessButton"} onClick={this.makeGuess.bind(this, boardElement)} style={this.props.hintState ? {} : {display: "none"}}/>
                <div className={boardElement.word.length > 9 ? "boardElementContent longWord"+boardElement.word.length : "boardElementContent"}>
                    {boardElement.word}
                </div>
            </div>
        )))
    }

    render() {
        return (<div className={"board"}>
            {this.renderBoard()}
            <div className={"inputBar"}>
                <input id={"hintNumber"} type={"number"} className={"hintNumber"} min={1} max={9} defaultValue={this.props.amount} disabled={this.props.hintState}/>
                <input id={"hintInput"} type={"text"} className={"hintInput"} placeholder={this.props.hint} disabled={this.props.hintState}/>
                <button className={this.props.hintState ? "stopGuessingButton" : "hintButton"}
                        onClick={this.props.hintState ? this.stopGuessing.bind(this) : this.sendHint.bind(this)}>
                    {this.props.hintState ? "Raten beenden" : "Gebe Hinweis"}
                </button>
            </div>
        </div>)
    }
}