import { Component } from 'react';
import ModulePlayerApi from "../../../../framework/modules/api/ModulePlayerApi";
import {
	HangmanConfiguration,
	HangmanScoreboard,
	HangmanScoreboardItem
} from "@edelgames/types/src/modules/hangman/HMTypes";
import {UserProfileImage} from "../../../../framework/components/ProfileImage/ProfileImage";

interface IProps {
	playerApi: ModulePlayerApi,
	scoreboard: HangmanScoreboard
}

export default class FinishScreen extends Component<IProps, {}> {

	render() {

		const sortedScores = this.props.scoreboard.sort((a, b) => a.points > b.points ? -1 : 1);

		return (
			<div className={'hangman-finish-screen'}>

				<div className={'final-scoreboard'}>
					{sortedScores.map(this.renderScoreboardRow.bind(this))}
				</div>

			</div>
		);
	}

	renderScoreboardRow(score: HangmanScoreboardItem): JSX.Element {
		const player = this.props.playerApi.getPlayerById(score.playerId);
		if(!player) {
			return <></>;
		}

		return (
			<div key={'score_'+player.getId()} className={'scoreboard-row'}>

				<div className={'scoreboard-col-player'}>
					<UserProfileImage user={player} />
					{player.getUsername()}
				</div>

				<div className={'scoreboard-col-points'}>
					{score.points}
				</div>

			</div>
		);
	}
}
