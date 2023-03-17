import React, { Component } from 'react';
import {
	GridPlayerScore,
	GridScoreboard,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import ProfileImage from '../../../framework/components/ProfileImage/ProfileImage';
import ModulePlayerApi from '../../../framework/modules/api/ModulePlayerApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ColorGridBoxAnimation from "./ColorGridBoxAnimation";

interface IProps {
	scoreboard: GridScoreboard;
	playerApi: ModulePlayerApi;
}

interface IState {
	currentGridOwner: string | undefined;
}

export default class WinningScreen extends Component<IProps, IState> {
	state = {
		currentGridOwner: undefined,
	};

	render() {
		return (
			<div className={'winning-screen'}>
				<div
					className={
						'scoreboard ' + (this.state.currentGridOwner ? 'grid-visible' : '')
					}
				>
					<div className={'scoreboard-column'}>
						<div className={'scoreboard-cell'}>
							Spieler <span className={'spacer-v'}></span>
						</div>
						<div className={'scoreboard-cell'}>Farb-Bonus:</div>
						<div className={'scoreboard-cell'}>Spalten A-O:</div>
						<div className={'scoreboard-cell'}>Joker:</div>
						<div className={'scoreboard-cell'}>Sterne:</div>
						<div className={'scoreboard-cell'}>Gesamt:</div>
					</div>

					{this.props.scoreboard.map(this.renderColumn.bind(this))}
				</div>

				<div>
					{this.state.currentGridOwner
						? this.renderGrid(
								this.props.scoreboard.find((score) => {
									return score.player === this.state.currentGridOwner;
								})
						  )
						: null}
				</div>
			</div>
		);
	}

	onClickPlayersHead(playerId: string): void {
		this.setState({
			currentGridOwner:
				playerId === this.state.currentGridOwner ? undefined : playerId,
		});
	}

	renderColumn(score: GridPlayerScore, index: number): JSX.Element {
		return (
			<div className={'scoreboard-column'}>
				<div
					className={'scoreboard-cell'}
					onClick={this.onClickPlayersHead.bind(this, score.player)}
				>
					{this.renderProfileImage(score.player)}
					{index === 0 ? (
						<FontAwesomeIcon
							icon={['fad', 'crown']}
							className={'crown'}
							size="2x"
						/>
					) : null}
				</div>
				<div className={'scoreboard-cell'}>{score.score.bonus}</div>
				<div className={'scoreboard-cell'}>{score.score.columns}</div>
				<div className={'scoreboard-cell'}>{score.score.jokers}</div>
				<div className={'scoreboard-cell'}>{score.score.stars}</div>
				<div className={'scoreboard-cell'}>{score.score.total}</div>
			</div>
		);
	}

	renderProfileImage(playerId: string): JSX.Element {
		const user = this.props.playerApi.getPlayerById(playerId);
		if (!user) {
			return <ProfileImage picture={null} id={''} username={'missingno'} />;
		}

		return (
			<ProfileImage
				picture={user.getPicture()}
				id={user.getId()}
				username={user.getUsername()}
			/>
		);
	}

	renderGrid(score: GridPlayerScore | undefined): JSX.Element {
		if (score === undefined) {
			return <></>;
		}

		const user = this.props.playerApi.getPlayerById(score.player);

		return (
			<div className={'grid-image-container'}>
				<div className={'grid-title'}>{user ? user.getUsername() : '???'}</div>

				<ColorGridBoxAnimation
					grid={score.grid}
					animationSteps={score.history}
					animationSpeed={500}
					key={score.player}
				/>

			</div>
		);
	}
}
