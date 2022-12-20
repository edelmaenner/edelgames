import React from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import codenames from "./Codenames";
import TeamSelectionComponent from "./component/TeamSelectionComponent";
import {Team} from "./Team";

interface IState {
    teams : Team[]
    stateName: string
}

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
            teams: eventData.teams,
            stateName: eventData.state
        })
    }

    render() {
        switch (this.state.stateName){
            case "initial":
                // TODO: grep new state
                return(<div>Waiting</div>);
            case "start":
                return this.showStartScreen();
            default:
                return(<div>Error</div>);
        }
    }

    showStartScreen(){
        return (
            <div id={"codenames"}>
                {this.state.teams.map(team => this.renderTeamSelectionComponent(team))}
            </div>
            // TODO: show roommaster the start button
        );
    }

    renderTeamSelectionComponent(team: Team){
        if(team){
            return (
                <TeamSelectionComponent gameApi={this.gameApi} team={team} teamColor={'#ff0000'}/>
            );
        } else {
            return(<div></div>);
        }
    }

    // TODO 1: rendering für spielfeld

    // TODO 1: worteingabemaske

    // TODO 1: gewinner/verlierer dings

    // TODO 2: history
}