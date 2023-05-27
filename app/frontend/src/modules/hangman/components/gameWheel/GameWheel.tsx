import React, { Component } from 'react';
import WoodenImage from '../../imgs/wood-591631_960_720.jpg';
import User from '../../../../framework/util/User';
import ProfileImage from '../../../../framework/components/ProfileImage/ProfileImage';
import { LetterHint } from '@edelgames/types/src/modules/hangman/HMTypes';
import ModulePlayerApi from '../../../../framework/modules/api/ModulePlayerApi';

interface IProps {
	letters: LetterHint[];
	activePlayerId: string | undefined;
	playerApi: ModulePlayerApi;
}
interface IState {
	currentWheelRotation: number;
}

const PI = 3.14159265359;
const TWO_PI = PI * 2;

export default class GameWheel extends Component<IProps, IState> {
	state = {
		currentWheelRotation: 0,
	};

	desiredWheelRotation: number = 0;
	wheelRotationInterval: NodeJS.Timer | number | undefined = undefined;
	wheelRotationIntervalSpeed: number = 20;
	wheelRotationStep = 2;

	componentDidUpdate(
		prevProps: Readonly<IProps>,
		prevState: Readonly<IState>,
		snapshot?: any
	) {
		const roomMembers = this.props.playerApi.getPlayers();

		const activePlayerIndex = roomMembers.findIndex(
			(user) => user.getId() === this.props.activePlayerId
		);
		this.changeWheelDirection((360 / roomMembers.length) * activePlayerIndex);
	}

	onWheelRotationIntervalTicked(): void {
		const requiredRotation = Math.abs(
			(this.state.currentWheelRotation % 360) -
				(this.desiredWheelRotation % 360)
		);

		if (requiredRotation < this.wheelRotationStep) {
			clearInterval(this.wheelRotationInterval);
			this.wheelRotationInterval = undefined;
			this.setState({
				currentWheelRotation: this.desiredWheelRotation,
			});
			return;
		}

		this.setState({
			currentWheelRotation:
				this.state.currentWheelRotation + this.wheelRotationStep,
		});
	}

	changeWheelDirection(newOffset: number, isRelative: boolean = false): void {
		this.desiredWheelRotation =
			newOffset + (isRelative ? this.desiredWheelRotation : 0);
		if (!this.wheelRotationInterval) {
			this.wheelRotationInterval = setInterval(
				this.onWheelRotationIntervalTicked.bind(this),
				this.wheelRotationIntervalSpeed
			);
		}
	}

	render() {
		const roomMembers = this.props.playerApi.getPlayers();

		return (
			<div className={'game-wheel'}>
				<div
					className={'wheel-background'}
					style={{
						backgroundImage: `url('${WoodenImage}')`,
						transform: `rotate(${-this.state.currentWheelRotation}deg)`,
						transitionDuration: this.wheelRotationIntervalSpeed + 'ms',
					}}
				></div>

				<div
					className={'wheel-content'}
					style={
						{
							// backgroundImage: `url('${PaperImage}')`
						}
					}
				>
					<div className={'letter-container'}>
						{this.props.letters.map((letter, index) => {
							return (
								<div
									key={index}
									className={`hangman-letter ${
										letter !== null ? 'solved' : ''
									}`}
								>
									{letter || <>&nbsp;</>}
								</div>
							);
						})}
					</div>
				</div>

				{roomMembers.map(
					this.renderPlayerWheelIcon.bind(this, roomMembers.length)
				)}
			</div>
		);
	}

	renderPlayerWheelIcon(
		playerCount: number,
		player: User,
		index: number
	): JSX.Element {
		const rotDivisions = TWO_PI / playerCount;
		const rot =
			rotDivisions * index +
			PI +
			(TWO_PI / 360) * this.state.currentWheelRotation;

		// calculate position on circle
		let xPos = 50 + Math.sin(rot) * 50;
		let yPos = 50 + Math.cos(rot) * 50;

		// remove 5% on each side to make the circle smaller
		xPos = 5 + xPos * 0.9;
		yPos = 5 + yPos * 0.9;

		// console.log(`${index}/${playerCount} at ${(360/playerCount) * index}deg on (${xPos}|${yPos})`);

		return (
			<div
				className={'game-wheel-player'}
				key={player.getId()}
				style={{
					left: xPos + '%',
					top: yPos + '%',
					transitionDuration: this.wheelRotationIntervalSpeed + 'ms',
				}}
			>
				<ProfileImage
					picture={player.getPicture()}
					username={player.getUsername()}
					id={player.getId()}
					sizeMultiplier={1.5}
				/>
			</div>
		);
	}
}
