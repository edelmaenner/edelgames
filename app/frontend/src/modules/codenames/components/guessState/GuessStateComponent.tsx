import React from "react";
import {Team} from "../../types/Team";
import ModuleGameApi from "../../../../framework/modules/ModuleGameApi";
import TeamViewComponent from "../TeamViewComponent";
import BoardComponent from "../BoardComponent";
import "./GuessStateComponent.scss"
import {BoardElement} from "../../types/BoardElement";

interface Props {
    gameApi: ModuleGameApi
    teams: Team[]
    board: BoardElement[][]
}

export default class GuessStateComponent extends React.Component<Props,{}> {
    renderTeamView(team: Team, even: boolean) {
        return (<TeamViewComponent team={team} even={even} wordsLeft={4}/>)
    }

    render() {
        return (<div id={"codenames"}>
            <div id={"leftPanel"}>
                { this.props.teams.filter(team => team.id % 2 === 0).map(team => this.renderTeamView(team, true)) }
            </div>
            <div id={"centerPanel"}>
                <BoardComponent gameApi={this.props.gameApi} board={this.props.board} hintButton={true} />
            </div>
            <div id={"rightPanel"}>
                { this.props.teams.filter(team => team.id % 2 === 1).map(team => this.renderTeamView(team, false)) }
            </div>
        </div>)
    }
}