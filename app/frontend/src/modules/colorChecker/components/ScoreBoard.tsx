import React, { Component } from 'react';
import { SelectableColors } from './ColorGridBox';
import {
	ColorGrid,
	GameStates,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import User from '../../../framework/util/User';
import ProfileImage from '../../../framework/components/ProfileImage/ProfileImage';
import ModuleApi from '../../../framework/modules/ModuleApi';

interface IProps {
	reservedBonusPoints: boolean[];
	finishedColors: boolean[];
	grid: ColorGrid;
	gameState: GameStates;
	finishedPlayers: string[];
	activePlayerId: string | undefined;
	api: ModuleApi;
	observedOpponentChanged: { (observedOpponent: string | null): void };
}

export default class ScoreBoard extends Component<IProps, {}> {
	render() {
		return (
			<div className={'scoreboard'}>
				<div className={'bonus-panel'}>
					{SelectableColors.map(this.renderBonusPanelRow.bind(this))}
				</div>

				<div className={'point-hints'}>
					<div className={'bold'}>Gesamtpunktzahl =</div>
					<div className={'indent'}>+ Vollständige Spalten</div>
					<div className={'indent'}>+ Vollständig ausgefüllte Farben</div>
					<div className={'indent'}>+ Übrige Joker</div>
					<div className={'indent'}>- Offene Sterne x2</div>
				</div>

				<div className={'status-board'}>
					<div className={'bold'}>Aktiver Spieler:</div>
					{this.props.activePlayerId &&
						this.renderPlayerIcon(
							true,
							this.props.api
								.getPlayerApi()
								.getPlayerById(this.props.activePlayerId)
						)}
					<br />

					<div className={'bold'}>Passive Spieler:</div>
					<div className={'passive-player-list'}>
						{this.props.api
							.getPlayerApi()
							.getPlayers()
							.map(this.renderPlayerIcon.bind(this, false))}
					</div>
					<br />

					<div className={'bold'}>Status:</div>
					{this.getGameStateMessage()}
				</div>
			</div>
		);
	}

	renderPlayerIcon(
		isActivePlayer: boolean,
		member: User | undefined
	): JSX.Element | null {
		if (
			!member ||
			(!isActivePlayer && member.getId() === this.props.activePlayerId)
		) {
			return null;
		}

		const isWaitingForOtherPlayers =
			(isActivePlayer &&
				this.props.gameState !== GameStates.ACTIVE_PLAYER_SELECTS) ||
			(!isActivePlayer &&
				(this.props.gameState === GameStates.ACTIVE_PLAYER_SELECTS ||
					this.props.finishedPlayers.includes(member.getId())));

		return (
			<ProfileImage
				picture={member.getPicture()}
				username={member.getUsername()}
				id={member.getId()}
				className={isWaitingForOtherPlayers ? 'is-waiting' : undefined}
				onHover={this.onViewedPlayerChanged.bind(this, member.getId(), true)}
				onHoverEnd={this.onViewedPlayerChanged.bind(
					this,
					member.getId(),
					false
				)}
			/>
		);
	}

	onViewedPlayerChanged(playerId: string, isStartViewing: boolean): void {
		if (playerId === this.props.api.getPlayerApi().getLocalePlayer().getId()) {
			return; // a player cannot view its own board this way
		}

		this.props.observedOpponentChanged(isStartViewing ? playerId : null);
	}

	getGameStateMessage(): string {
		switch (this.props.gameState) {
			case GameStates.ACTIVE_PLAYER_SELECTS:
				return 'Der aktive Spieler darf zuerst seinen Zug machen';
			case GameStates.PASSIVE_PLAYERS_SELECTS:
				return `Alle passiven Spieler dürfen ihren Zug mit den übrigen Würfeln machen`;
		}
		return '';
	}

	renderBonusPanelRow(color: string, index: number): JSX.Element {
		const isReserved = this.props.reservedBonusPoints[index];
		const isReached = this.props.finishedColors[index];

		return (
			<div className={'color-bonus-row'} key={'color-bonus-' + color}>
				<div
					className={'color-bonus-cell color-bonus-preview'}
					style={{
						backgroundColor: color,
					}}
				></div>
				<div className={'color-bonus-cell'}>
					<span className={!isReserved && isReached ? 'circled' : ''}>5</span>
					{isReserved ? (
						<FontAwesomeIcon
							icon={['fad', 'xmark']}
							size="1x"
							className={'striked'}
						/>
					) : null}
				</div>
				<div className={'color-bonus-cell'}>
					<span className={isReserved && isReached ? 'circled' : ''}>3</span>
				</div>
			</div>
		);
	}
}
