import React from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import codenames from "./Codenames";
import {Team} from "./types/Team";
import InitialStateComponent from "./components/initialState/InitialStateComponent";
import HintStateComponent from "./components/hintState/HintStateComponent";
import {BoardElement} from "./types/BoardElement";
import GuessStateComponent from "./components/guessState/GuessStateComponent";
import {Hint} from "./types/Hint";

interface IState {
    teams : Team[]
    board: BoardElement[][]
    hint: Hint
    stateName: string
}

let teamColors: string[] = [
    "#8f2b1c",
    "#3284a3",
    "#1e6f24",
    "#5f2dad",
    "#b0aa18",
    "#ab4909"
]

export default class CodenamesGame extends React.Component<{},IState> implements ModuleGameInterface {
    private readonly gameApi: ModuleGameApi;

    // state is an inherited property from React.Component
    state = {
        teams: [] as Team[],
        board: [] as BoardElement[][],
        hint: {} as Hint,
        stateName: "initial"
    }

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(codenames, this);
    }

    mapToBoardElement(boardElement: any): BoardElement {
        return {
            word: boardElement.word,
            category: boardElement.category,
            teamId: this.state.teams.find(team => team.name === boardElement.teamName)?.id ?? -1,
            categoryVisibleForEveryone: boardElement.categoryVisibleForEveryone,
            marked: boardElement.marked,
        } as BoardElement
    }

    // TODO: Method name fixen
    mapBoardArrayToBoard(board: any[], rowCount: number, columnCount: number): BoardElement[][] {
        let newBoard: BoardElement[][] = []

        if(board && board.length > 0) {
            for (let i = 0; i < rowCount; i++) {
                newBoard[i] = []
                for (let j = 0; j < columnCount; j++) {
                    newBoard[i].push(this.mapToBoardElement(board[i*columnCount+j]))
                }
            }
        }

        return newBoard
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount() {
        this.gameApi.addEventHandler('serverMessageSend', this.onReceiveMessage.bind(this));
        this.gameApi.addEventHandler('userSpecificBoardViewSent', this.onReceiveBoard.bind(this));
        this.gameApi.sendMessageToServer("requestGameState", {})
    }

    onReceiveBoard(eventData: {[key: string]: any}) {
        this.setState({
            board: this.mapBoardArrayToBoard(eventData.board, 5, 5),
        })
    }

    onReceiveMessage(eventData: {[key: string]: any}) {
        this.setState({
            teams: eventData.teams.map((team: any, index: number) => ({
                id: index,
                name: team.name,
                investigators: team.investigators,
                wordsLeft: team.wordsLeft,
                spymaster: team.spymaster,
                teamColor: teamColors[index]
            }) as Team),
            stateName: eventData.state,
            hint: eventData.hint ?? {word: "?", amnt: 0}
        })
    }

    render() {
        switch (this.state.stateName){
            case "initial":
                return(<div>Waiting</div>);
            case "start":
                return (<InitialStateComponent gameApi={this.gameApi} teams={this.state.teams} />);
            case "hint":
                return (<HintStateComponent gameApi={this.gameApi} teams={this.state.teams} board={this.state.board} />);
            case "guess":
                return (<GuessStateComponent gameApi={this.gameApi} teams={this.state.teams} board={this.state.board} amount={this.state.hint.amnt} hint={this.state.hint.word} />);
            default:
                return(<div>Error</div>);
        }
    }

    // TODO 2: history
}