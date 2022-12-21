import React from "react";
import {Team} from "../../types/Team";
import ModuleGameApi from "../../../../framework/modules/ModuleGameApi";
import TeamViewComponent from "../TeamViewComponent";
import BoardComponent from "../BoardComponent";
import "./HintStateComponent.scss"

interface Props {
    gameApi: ModuleGameApi
    teams: Team[]
}

export default class HintStateComponent extends React.Component<Props,{}> {
    renderTeamView(team: Team, even: boolean) {
        return (<TeamViewComponent team={team} even={even} wordsLeft={4}/>)
    }

    render() {
        return (<div id={"codenames"}>
            <div id={"leftPanel"}>
                { this.props.teams.filter(team => team.id % 2 === 0).map(team => this.renderTeamView(team, true)) }
            </div>
            <div id={"centerPanel"}>
                <BoardComponent hintButtonHidden={false} />
            </div>
            <div id={"rightPanel"}>
                { this.props.teams.filter(team => team.id % 2 === 1).map(team => this.renderTeamView(team, false)) }
            </div>
        </div>)
    }
}