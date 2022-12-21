import React from "react";
import profileManager from "../../../../framework/util/ProfileManager";
import {Team} from "../../types/Team";
import TeamSelectionComponent from "./TeamSelectionComponent";
import ModuleGameApi from "../../../../framework/modules/ModuleGameApi";
import "./InitialStateComponent.scss"

interface Props {
    gameApi: ModuleGameApi
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
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "startGame"
        });
    }

    render() {
        return (<div id={"codenames"}>
            {this.props.teams.map(team => this.renderTeamSelectionComponent(team))}
            {this.renderStartButton(this.props.gameApi.getUserDataById(profileManager.getId())?.isRoomMaster())}
        </div>)
    }
}