import React from "react";
import {Team} from "../types/Team";
import "./TeamViewComponent.scss"

interface Props {
    even: boolean
    team: Team
}

export default class TeamViewComponent extends React.Component<Props,{}> {
    getInvestigatorBubble(investigator: string){
        return(
            <span>{investigator}</span>
        );
    }

    renderEvenSpymasterHeader() {
        return (
            <div className={this.props.team.wordsLeft !== null ? "teamView" : "teamView teamLoser"} style={{background: this.props.team.teamColor}}>
                <div className={"header"}>
                    <div className={"spymaster"}>
                        <div id={"spymaster"+this.props.team.name} className={this.props.team.wordsLeft !== null ? "roleList spymaster textCenter" : "roleList spymaster textCenter roleLoser"}>
                            <span>{this.props.team.spymaster}</span>
                        </div>
                    </div>
                    {this.props.team.wordsLeft !== null && <div className={"wordsLeft"}>
                        <div className={"textCenter right"}>
                            {this.props.team.wordsLeft}
                        </div>
                    </div>}
                </div>

                { /* Investigators */ }
                <div id={"investigatorList"+this.props.team.name} className={"roleList investigators textCenter"}>
                    {this.props.team.investigators.filter(inv => inv).map(inv => this.getInvestigatorBubble(inv))}
                </div>
            </div>
        )
    }

    renderOddSpymasterHeader() {
        return (
            <div className={"teamView"} style={{background: this.props.team.teamColor}}>
                <div className={"header"}>
                    <div className={"wordsLeft"}>
                        <div className={"textCenter left"}>
                            {this.props.team.wordsLeft}
                        </div>
                    </div>
                    <div className={"spymaster"}>
                        <div id={"spymaster"+this.props.team.name} className={"roleList spymaster textCenter"}>
                            <span>{this.props.team.spymaster}</span>
                        </div>
                    </div>
                </div>

                { /* Investigators */ }
                <div id={"investigatorList"+this.props.team.name} className={"roleList investigators textCenter"}>
                    {this.props.team.investigators.filter(inv => inv).map(inv => this.getInvestigatorBubble(inv))}
                </div>
            </div>
        )
    }

    render() {
        return this.props.even ? this.renderEvenSpymasterHeader() : this.renderOddSpymasterHeader()
    }
}