import React, { ReactNode } from 'react';
import ProfileImage from '../../../framework/components/ProfileImage/ProfileImage';
import {
	ScoreCellIDs,
	YahtzeeScoreboardType,
	YahtzeeScoreObject,
} from '@edelgames/types/src/modules/yahtzee/YTypes';
import ModulePlayerApi from '../../../framework/modules/api/ModulePlayerApi';
import {
	getPointsFromDices,
	getTotalFirstPartPoints,
} from './YahtzeeFunctions';

interface IProps {
	playerApi: ModulePlayerApi;
	scoreboard: YahtzeeScoreboardType;
	onCellClicked: { (cellType: ScoreCellIDs): void };
	currentDiceValues: number[];
	remainingRolls: number;
	activePlayerId?: string | null;
}

export default class Scoreboard extends React.Component<IProps, {}> {
	render(): ReactNode {
		return (
			<div className={'yahtzee-scoreboard'}>
				{this.renderIndex()}
				{this.props.scoreboard.map(this.renderColumn.bind(this))}
			</div>
		);
	}

	renderIndex(): JSX.Element {
		return (
			<div className={'yahtzee-scoreboard-index-column'}>
				<div className={'yahtzee-tcell'}>{/* Playername*/}</div>
				<div className={'yahtzee-tcell'} title={'Nur Einser zählen'}>
					1er
				</div>
				<div className={'yahtzee-tcell'} title={'Nur Zweier zählen'}>
					2er
				</div>
				<div className={'yahtzee-tcell'} title={'Nur Dreier zählen'}>
					3er
				</div>
				<div className={'yahtzee-tcell'} title={'Nur Vierer zählen'}>
					4er
				</div>
				<div className={'yahtzee-tcell'} title={'Nur Fünfer zählen'}>
					5er
				</div>
				<div className={'yahtzee-tcell'} title={'Nur Sechser zählen'}>
					6er
				</div>
				<div className={'yahtzee-tcell'} title={'+35'}>
					Bonus bei &gt;= 63
				</div>
				<div className={'yahtzee-tcell'} title={'Alle Augen Zählen'}>
					Dreierpasch
				</div>
				<div className={'yahtzee-tcell'} title={'Alle Augen Zählen'}>
					Viererpasch
				</div>
				<div className={'yahtzee-tcell'} title={'+25'}>
					Full House
				</div>
				<div className={'yahtzee-tcell'} title={'+30'}>
					Kleine Straße
				</div>
				<div className={'yahtzee-tcell'} title={'+40'}>
					Große Straße
				</div>
				<div className={'yahtzee-tcell'} title={'+50'}>
					Kniffel
				</div>
				<div className={'yahtzee-tcell'} title={'alle '}>
					Chance
				</div>
				<div className={'yahtzee-tcell'}>{/* placeholder */}</div>
				<div className={'yahtzee-tcell'}>Gesamt</div>
			</div>
		);
	}

	renderColumn(playerScore: YahtzeeScoreObject): JSX.Element {
		const { playerId } = playerScore;

		let isLocalePlayer = false;
		let isActivePlayer = false;
		let allowSelection = false;

		let player = this.props.playerApi.getPlayerById(playerId);
		if (player) {
			isLocalePlayer =
				this.props.playerApi.getLocalePlayer().getId() === player.getId();
			isActivePlayer = this.props.activePlayerId === player.getId();
			allowSelection =
				isLocalePlayer && isActivePlayer && this.props.remainingRolls <= 2;
		}

		let totalFirstPart = getTotalFirstPartPoints(playerScore);

		let className =
			'yahtzee-scoreboard-column' +
			(isLocalePlayer ? ' yahtzee-local-col' : '') +
			(isActivePlayer ? ' yahtzee-active-col' : '');

		return (
			<div className={className} key={playerId}>
				<div className={'yahtzee-tcell'}>
					<ProfileImage
						picture={player?.getPicture() || null}
						username={player?.getUsername() || playerScore.playerName}
						id={player?.getId() || playerScore.playerId || '0'}
					/>
				</div>

				{this.renderScoreCell(playerScore, ScoreCellIDs.ONE, allowSelection)}
				{this.renderScoreCell(playerScore, ScoreCellIDs.TWO, allowSelection)}
				{this.renderScoreCell(playerScore, ScoreCellIDs.THREE, allowSelection)}
				{this.renderScoreCell(playerScore, ScoreCellIDs.FOUR, allowSelection)}
				{this.renderScoreCell(playerScore, ScoreCellIDs.FIVE, allowSelection)}
				{this.renderScoreCell(playerScore, ScoreCellIDs.SIX, allowSelection)}

				<div className={'yahtzee-tcell'}
					 title={totalFirstPart < 63 ? `noch ${63-totalFirstPart}` : undefined}
				>
					{totalFirstPart >= 63 ? 35 : 0}
				</div>

				{this.renderScoreCell(
					playerScore,
					ScoreCellIDs.THREE_OF_A_KIND,
					allowSelection
				)}
				{this.renderScoreCell(
					playerScore,
					ScoreCellIDs.FOUR_OF_A_KIND,
					allowSelection
				)}
				{this.renderScoreCell(
					playerScore,
					ScoreCellIDs.FULL_HOUSE,
					allowSelection
				)}
				{this.renderScoreCell(
					playerScore,
					ScoreCellIDs.SMALL_STRAIGHT,
					allowSelection
				)}
				{this.renderScoreCell(
					playerScore,
					ScoreCellIDs.LARGE_STRAIGHT,
					allowSelection
				)}
				{this.renderScoreCell(
					playerScore,
					ScoreCellIDs.FIVE_OF_A_KIND,
					allowSelection
				)}
				{this.renderScoreCell(playerScore, ScoreCellIDs.CHANCE, allowSelection)}

				<div className={'yahtzee-tcell'}>{/* Placeholder */}</div>
				<div className={'yahtzee-tcell'}>{playerScore.total}</div>
			</div>
		);
	}

	renderScoreCell(
		playerScore: YahtzeeScoreObject,
		cellIdentifier: ScoreCellIDs,
		allowSelection: boolean
	): JSX.Element {
		let value = playerScore[cellIdentifier];
		let isSelectable = value === null && allowSelection;

		return (
			<div
				className={
					'yahtzee-tcell ' + (isSelectable ? ' is-available-cell' : '')
				}
				onClick={
					isSelectable
						? () => this.props.onCellClicked(cellIdentifier)
						: undefined
				}
				data-value={value}
				onMouseEnter={(event) => {
					if (isSelectable) {
						event.currentTarget.innerText =
							'' +
							getPointsFromDices(cellIdentifier, this.props.currentDiceValues);
					}
				}}
				onMouseLeave={(event) => {
					event.currentTarget.innerText =
						event.currentTarget.dataset.value || '';
				}}
			>
				{value}
			</div>
		);
	}
}
