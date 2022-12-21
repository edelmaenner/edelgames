import React from "react";
import "./BoardComponent.scss"
import {BoardElement} from "../types/BoardElement";
import ModuleGameApi from "../../../framework/modules/ModuleGameApi";

interface Props {
    hintButton: boolean
    board: BoardElement[][]
    gameApi: ModuleGameApi
}

export default class BoardComponent extends React.Component<Props,{}> {
    sendHint() {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "publishHint",
            hint: {
                word: "test",
                amnt: 2
            }
        });
    }

    stopGuessing() {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "done"
        });
    }

    renderBoard() {
        return this.props.board.map(boardRow => boardRow.map(boardElement => (
            <div className={"boardElement"}>
                <div className={"boardElementContent"}>{boardElement.word}</div>
            </div>)))
    }

    render() {
        return (<div className={"board"}>
            {this.renderBoard()}
            <div  className={"inputBar"}>
                <input type={"number"} className={"hintNumber"} min={1} max={9} defaultValue={2}></input>
                <input type={"text"} className={"hintInput"} placeholder={"Gib hier deinen Hinweis ein..."}/>
                <button className={this.props.hintButton ? "stopGuessingButton" : "hintButton"} onClick={this.props.hintButton ? this.stopGuessing.bind(this) : this.sendHint.bind(this)}>{this.props.hintButton ? "Raten beenden" : "Gebe Hinweis"}</button>
            </div>
        </div>)
    }
}