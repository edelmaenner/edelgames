import React, { ReactNode } from 'react';
import ModuleApi from '../../../framework/modules/ModuleApi';
import DiceBox from '../../../framework/components/DiceBox/DiceBox';

interface IProps {
	api: ModuleApi;
	isLocalPlayerActive: boolean;
	diceValues: number[];
	lastRollTimeStamp: number | string;
	remoteSelectedDice: boolean[];
	remainingRolls: number;
	onDiceRollClicked: { (diceSelection: boolean[]): void };
	onSelectedDiceChanged: { (newDiceSelection: boolean[]): void };
}

export default class DiceTable extends React.Component<IProps, {}> {
	rollIndex: number = 0;
	lastRollTimeStamp: number | string = -1;

	spaceDownListener: {(event: KeyboardEvent): void};

	constructor(props: IProps) {
		super(props);
		this.spaceDownListener = this.onSpaceDownPressed.bind(this);
	}

	componentDidMount(): void {
		window.addEventListener('keypress', this.spaceDownListener);
	}

	componentWillUnmount(): void {
		window.removeEventListener('keypress', this.spaceDownListener);
	}

	/**
	 * attempt to trigger a dice roll, if the active player presses spacebar
	 * @param event
	 */
	onSpaceDownPressed(event: KeyboardEvent): void {
		console.log(event.key);
		if (event.key === ' ') {
			this.onRollRequested();
		}
	};


	/* Locale Events */
	onDiceClicked(diceId: number): void {
		if (!this.props.isLocalPlayerActive) {
			return;
		}

		let diceSelectionTemp = [...this.props.remoteSelectedDice];
		diceSelectionTemp[diceId] = !diceSelectionTemp[diceId];
		if (diceSelectionTemp.every((mask) => mask)) {
			return;
		}

		this.props.onSelectedDiceChanged(diceSelectionTemp);
		this.setState({});
	}

	onRollRequested(): void {
		if (!this.props.isLocalPlayerActive) {
			return;
		}

		this.props.onDiceRollClicked(this.props.remoteSelectedDice);
	}

	/* Rendering */
	render(): ReactNode {
		if (this.props.lastRollTimeStamp !== this.lastRollTimeStamp) {
			this.lastRollTimeStamp = this.props.lastRollTimeStamp;
			this.rollIndex++;
		}

		return (
			<div className={'yahtzee-dice-table'}>
				<DiceBox
					rollIndex={this.rollIndex}
					nextRollResults={this.props.diceValues}
					highlightColors={this.props.remoteSelectedDice.map((el) =>
						el ? '#f80000' : undefined
					)}
					diceToRollMask={this.props.remoteSelectedDice.map((el) => !el)}
					onDicesClicked={this.onDiceClicked.bind(this)}
				/>
				<button
					disabled={
						!this.props.isLocalPlayerActive || this.props.remainingRolls <= 0
					}
					onClick={this.onRollRequested.bind(this)}
				>
					Würfeln (noch {this.props.remainingRolls} mal)
				</button>
			</div>
		);
	}
}
