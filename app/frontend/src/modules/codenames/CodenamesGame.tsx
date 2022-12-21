import React from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import codenames from "./Codenames";
import {Team} from "./types/Team";
import InitialStateComponent from "./components/initialState/InitialStateComponent";
import HintStateComponent from "./components/hintState/HintStateComponent";
import {BoardElement} from "./types/BoardElement";
import GuessStateComponent from "./components/guessState/GuessStateComponent";

interface IState {
    teams : Team[]
    board: BoardElement[][]
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
        teams: [],
        board: [],
        stateName: "initial"
    }

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(codenames, this);
    }

    // TODO: Method name fixen
    mapBoardArrayToArrayArray(board: BoardElement[], rowCount: number, columnCount: number): BoardElement[][] {
        let newBoard: BoardElement[][] = []

        if(board && board.length > 0) {
            for (let i = 0; i < rowCount; i++) {
                newBoard[i] = []
                for (let j = 0; j < columnCount; j++) {
                    newBoard[i].push(board[i*columnCount+j])
                }
            }
        }

        return newBoard
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount() {
        // this.gameApi.addEventHandler('serverMessageSend', this.onReceiveMessage.bind(this));
        this.gameApi.addEventHandler('userSpecificBoardViewSent', this.onReceiveBoard.bind(this));
    }

    // FIXME: 2 Events direkt nacheinander hebeln die setState-Methoden aus, da asynchron -> Die Änderungen überschreiben sich gegenseitig
    onReceiveBoard(eventData: {[key: string]: any}) {
        this.setState({
            ...this.state,
            board: this.mapBoardArrayToArrayArray(eventData.board, 5, 5),
            teams: eventData.teams.map((team: any, index: number) => ({
                id: index,
                name: team.name,
                investigators: team.investigators,
                spymaster: team.spymaster,
                teamColor: teamColors[index]
            }) as Team),
            stateName: eventData.state
        })
    }

    // onReceiveMessage(eventData: {[key: string]: any}) {
    //     this.setState({
    //         ...this.state,
    //         teams: eventData.teams.map((team: any, index: number) => ({
    //             id: index,
    //             name: team.name,
    //             investigators: team.investigators,
    //             spymaster: team.spymaster,
    //             teamColor: teamColors[index]
    //         }) as Team),
    //         stateName: eventData.state
    //     })
    // }

    render() {
        switch (this.state.stateName){
            case "initial":
                // TODO: grep new state
                return(<div>Waiting</div>);
            case "start":
                return (<InitialStateComponent gameApi={this.gameApi} teams={this.state.teams} />);
            case "hint":
                return (<HintStateComponent gameApi={this.gameApi} teams={this.state.teams} board={this.state.board} />);
            case "guess":
                return (<GuessStateComponent gameApi={this.gameApi} teams={this.state.teams} board={this.state.board} />);
            default:
                return(<div>Error</div>);
        }
    }

    // TODO 1: rendering für spielfeld

    // TODO 1: worteingabemaske

    // TODO 1: gewinner/verlierer dings

    // TODO 2: history
}