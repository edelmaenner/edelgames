import React from "react";
import "./TeamSelectionComponent.scss"
import ModuleApi from "../../../../framework/modules/ModuleApi";
import {Team} from "../../types/Team";

interface Props{
    gameApi: ModuleApi
    team: Team
    teamCount: number
}

export default class TeamSelectionComponent extends React.Component<Props, {}> {
    private setSpymaster() {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "setSpymaster",
            target: this.props.team.name
        });
    }

    private joinInvestigator() {
        this.props.gameApi.getEventApi().sendMessageToServer('userMessageSend', {
            action: "joinInvestigator",
            target: this.props.team.name
        });
    }

    getInvestigatorBubble(investigator: string){
        return(
            <span>{investigator}</span>
        );
    }

    render() {
        return (
            <div id={"teamSelection"+this.props.team.name} className={"teamSelection teams"+this.props.teamCount}
                 style={{background: this.props.team.teamColor}}>
                <div>{"Team "+this.props.team.name}</div>
                { /* Spymaster */ }
                <div className={"roleChoice"}>
                    <div id={"spymaster"+this.props.team.name} className={"roleList spymaster"}>
                        <span>{this.props.team.spymaster}</span>
                    </div>
                    <button id={"beSpymaster"+this.props.team.name} onClick={this.setSpymaster.bind(this)} className={"joinButton"}>
                        Geheimdienstchef sein
                    </button>
                </div>

                { /* Investigators */ }
                <div className={"roleChoice"}>
                    <div id={"investigatorList"+this.props.team.name} className={"roleList investigators"}>
                        {this.props.team.investigators.filter(inv => inv).map(inv => this.getInvestigatorBubble(inv))}
                    </div>
                    <button id={"joinInvestigator"+this.props.team.name} onClick={this.joinInvestigator.bind(this)} className={"joinButton"}>
                        Als Ermittler beitreten
                    </button>
                </div>
            </div>
        );
    }
}