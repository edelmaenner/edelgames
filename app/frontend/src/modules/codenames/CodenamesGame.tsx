import React from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import codenames from "./Codenames";
import {Team} from "./types/Team";
import InitialStateComponent from "./components/initialState/InitialStateComponent";
import HintStateComponent from "./components/hintState/HintStateComponent";

interface IState {
    teams : Team[]
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
        stateName: "initial"
    }

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(codenames, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount() {
        this.gameApi.addEventHandler('serverMessageSend', this.onReceiveMessage.bind(this));
    }

    onReceiveMessage(eventData: {[key: string]: any}) {
        this.setState({
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

    render() {
        switch (this.state.stateName){
            case "initial":
                // TODO: grep new state
                return(<div>Waiting</div>);
            case "start":
                return (<InitialStateComponent gameApi={this.gameApi} teams={this.state.teams} />);
            case "hint":
                return (<HintStateComponent gameApi={this.gameApi} teams={this.state.teams} />);
            default:
                return(<div>Error</div>);
        }
    }

    // TODO 1: rendering für spielfeld

    // TODO 1: worteingabemaske

    // TODO 1: gewinner/verlierer dings

    // TODO 2: history
}