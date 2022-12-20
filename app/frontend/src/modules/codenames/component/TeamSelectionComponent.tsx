import React from "react";
import "./TeamSelectionComponent.scss"
import ModuleGameApi from "../../../framework/modules/ModuleGameApi";
import {Team} from "../Team";

interface Props{
    gameApi: ModuleGameApi
    team: Team
    teamColor: string
}

export default class TeamSelectionComponent extends React.Component<Props, {}> {
    render() {
        return (
            <div id={"teamSelection"+this.props.team.name} className={"teamSelection"}>
                <div>{"Team "+this.props.team.name}</div>
                { /* Investigators */ }
                <div className={"roleChoice"}>
                    <div id={"investigatorList"+this.props.team.name} className={"roleList"}>
                        {this.props.team.investigators.map(inv => this.getInvestigatorBubble(inv))}
                    </div>
                    <button id={"joinInvestigator"+this.props.team.name} onClick={this.joinInvestigator.bind(this)}>
                        Als Ermittler beitreten
                    </button>
                </div>

                { /* Spymaster */ }
                <div className={"roleChoice"}>
                    <div id={"spymaster"+this.props.team.name} className={"roleList"}>
                        <span>{this.props.team.spymaster}</span>
                    </div>
                    <button id={"beSpymaster"+this.props.team.name} onClick={this.setSpymaster.bind(this)}>
                        Geheimdienstchef sein
                    </button>
                </div>
            </div>
        );
    }

    private setSpymaster() {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "setSpymaster",
            target: this.props.team.name
        });
    }

    private joinInvestigator() {
        this.props.gameApi.sendMessageToServer('userMessageSend', {
            action: "joinInvestigator",
            target: this.props.team.name
        });
    }

    getInvestigatorBubble(investigator: string){
       return(
           <span>{investigator}</span>
       );
    }
}