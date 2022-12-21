import React from "react";
import "./BoardComponent.scss"

let board: string[][] = [
    ["Apfel", "Baum", "Fluss", "Orang-Utan", "Stift"],
    ["Kohlemine", "Orange", "Haus", "Fahrzeug", "Jura"],
    ["Gischt", "Koralle", "Himmel", "Klammer", "Telefon"],
    ["Testosteron", "Qualle", "Jäger", "Messer", "Tier"],
    ["Märchen", "Thunfisch", "Autoreifen", "Haar", "Keller"]
]

interface Props {
    hintButtonHidden: boolean
}

export default class BoardComponent extends React.Component<Props,{}> {
    renderBoard() {
        return board.map(boardRow => boardRow.map(boardElement => (
            <div className={"boardElement"}>
                <div className={"boardElementContent"}>{boardElement}</div>
            </div>)))
    }

    render() {
        return (<div className={"board"}>
            {this.renderBoard()}
            <div  className={"inputBar"}>
                <input type={"number"} className={"hintNumber"} min={1} max={9} defaultValue={2}></input>
                <input type={"text"} className={"hintInput"} placeholder={"Gib hier deinen Hinweis ein..."}/>
                <button className={this.props.hintButtonHidden ? "hintButton hidden" : "hintButton"}>Gebe Hinweis</button>
            </div>
        </div>)
    }
}