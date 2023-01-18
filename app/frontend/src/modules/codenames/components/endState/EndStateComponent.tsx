import React from "react";
import {Team} from "../../types/Team";
import ModuleApi from "../../../../framework/modules/ModuleApi";
import TeamViewComponent from "../TeamViewComponent";
import BoardComponent from "../BoardComponent";
import {BoardElement} from "../../types/BoardElement";

interface Props {
    gameApi: ModuleApi
    teams: Team[]
    board: BoardElement[][]
    amount: number
    hint: string
}

export default class EndStateComponent extends React.Component<Props,{}> {
    renderTeamView(team: Team, even: boolean) {
        return (<TeamViewComponent key={"teamView" + team.id} team={team} even={even}/>)
    }

    render() {
        return (<div id={"codenames"}>
            <div id={"leftPanel"}>
                { this.props.teams.filter(team => team.id % 2 === 0).map(team => this.renderTeamView(team, true)) }
            </div>
            <div id={"centerPanel"}>
                <BoardComponent gameApi={this.props.gameApi} board={this.props.board} teams={this.props.teams} guessState={false} endState={true} amount={this.props.amount} hint={this.props.hint}/>
            </div>
            <div id={"rightPanel"}>
                { this.props.teams.filter(team => team.id % 2 === 1).map(team => this.renderTeamView(team, false)) }
            </div>
        </div>)
    }
}