import { Component } from 'react';
import ModulePlayerApi from '../../../../framework/modules/api/ModulePlayerApi';
import {
	HangmanConfiguration,
	HangmanScoreboard,
	HangmanScoreboardItem,
} from '@edelgames/types/src/modules/hangman/HMTypes';
import { UserProfileImage } from '../../../../framework/components/ProfileImage/ProfileImage';

interface IProps {
	playerApi: ModulePlayerApi;
	scoreboard: HangmanScoreboard;
	config: HangmanConfiguration;
	round: number;
}

export default class Scoreboard extends Component<IProps, {}> {
	getWinningCondition(): string {
		const config = this.props.config;
		const hasTurnCondition = config.turnWinningThreshold > 0;
		const hasScoreCondition = config.scoreWinningThreshold > 0;

		if (hasTurnCondition && hasScoreCondition) {
			return `Ein Spieler erreicht ${config.scoreWinningThreshold} Punkte oder Runde ${config.turnWinningThreshold} wird beendet`;
		}

		if (hasTurnCondition) {
			return `Runde ${config.turnWinningThreshold} wird beendet`;
		}

		if (hasScoreCondition) {
			return `Ein Spieler erreicht ${config.scoreWinningThreshold} Punkte`;
		}

		return `Endlosspiel`;
	}

	render() {
		return (
			<div className={'hangman-scoreboard'}>
				<div className={'scoreboard-header'}>Runde {this.props.round}</div>

				<div className={'scoreboard-winning-condition'}>
					Siegbedingung:
					<br />
					{this.getWinningCondition()}
				</div>

				{this.props.scoreboard.map(this.renderScoreboardRow.bind(this))}
			</div>
		);
	}

	renderScoreboardRow(score: HangmanScoreboardItem): JSX.Element {
		const player = this.props.playerApi.getPlayerById(score.playerId);
		if (!player) {
			return <></>;
		}

		return (
			<div key={'score_' + player.getId()} className={'scoreboard-row'}>
				<div className={'scoreboard-col-player'}>
					<UserProfileImage user={player} />
					{player.getUsername()}
				</div>

				<div className={'scoreboard-col-points'}>{score.points}</div>
			</div>
		);
	}
}
