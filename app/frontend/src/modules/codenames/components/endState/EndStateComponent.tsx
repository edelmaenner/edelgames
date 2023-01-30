import React from 'react';
import ModuleApi from '../../../../framework/modules/ModuleApi';
import TeamViewComponent from '../TeamViewComponent';
import BoardComponent from '../BoardComponent';
import {
	IBoardElement,
	ITeam,
} from '@edelgames/types/src/modules/codenames/CNTypes';

interface Props {
	gameApi: ModuleApi;
	teams: ITeam[];
	board: IBoardElement[][];
	amount: number;
	hint: string;
}

export default class EndStateComponent extends React.Component<Props, {}> {
	renderTeamView(team: ITeam, even: boolean) {
		return (
			<TeamViewComponent key={'teamView' + team.id} team={team} even={even} />
		);
	}

	render() {
		return (
			<div id={'codenames'}>
				<div id={'leftPanel'}>
					{this.props.teams
						.filter((team) => (team.id ?? -1) % 2 === 0)
						.map((team) => this.renderTeamView(team, true))}
				</div>
				<div id={'centerPanel'}>
					<BoardComponent
						gameApi={this.props.gameApi}
						board={this.props.board}
						teams={this.props.teams}
						guessState={false}
						endState={true}
						amount={this.props.amount}
						hint={this.props.hint}
					/>
				</div>
				<div id={'rightPanel'}>
					{this.props.teams
						.filter((team) => (team.id ?? -1) % 2 === 1)
						.map((team) => this.renderTeamView(team, false))}
				</div>
			</div>
		);
	}
}
