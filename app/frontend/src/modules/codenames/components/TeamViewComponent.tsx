import React from "react";
import {Team} from "../types/Team";
import "./TeamViewComponent.scss"

interface Props {
    even: boolean
    wordsLeft: number
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
            <div className={"teamView"} style={{background: this.props.team.teamColor}}>
                <div className={"header"}>
                    <div className={"spymaster"}>
                        <div id={"spymaster"+this.props.team.name} className={"roleList spymaster textCenter"}>
                            <span>{this.props.team.spymaster}</span>
                        </div>
                    </div>
                    <div className={"wordsLeft"}>
                        <div className={"textCenter right"}>
                            {this.props.wordsLeft}
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

    renderOddSpymasterHeader() {
        return (
            <div className={"teamView"} style={{background: this.props.team.teamColor}}>
                <div className={"header"}>
                    <div className={"wordsLeft"}>
                        <div className={"textCenter left"}>
                            {this.props.wordsLeft}
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