import React from "react";
import {Team} from "../../types/Team";
import TeamSelectionComponent from "./TeamSelectionComponent";
import ModuleApi from "../../../../framework/modules/ModuleApi";
import "./InitialStateComponent.scss"

interface Props {
    gameApi: ModuleApi
    teams: Team[]
}

export default class InitialStateComponent extends React.Component<Props,{}> {
    renderTeamSelectionComponent(team: Team) {
        if(team){
            return (
                <TeamSelectionComponent key={"teamSelectionComponent" + team.id} gameApi={this.props.gameApi} team={team} teamCount={this.props.teams.length}/>
            );
        } else {
            return(<div></div>);
        }
    }

    renderStartButton(isRoomMaster: boolean | undefined) {
        if(isRoomMaster) {
            return (
                <button id={"startButton"} className={"startButton"} onClick={this.startGame.bind(this)}>
                    Spiel starten
                </button>
            );
        }
    }

    startGame() {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "startGame"
        });
    }

    render() {
        return (<div id={"codenames"}>
            {this.props.teams.map(team => this.renderTeamSelectionComponent(team))}
            {this.renderStartButton(this.props.gameApi.getPlayerApi().getLocalePlayer().isRoomMaster())}
        </div>)
    }
}