import React, { ReactNode } from 'react';
import DiceBox from '../../../framework/components/DiceBox/DiceBox';
import ColorCheckerNumberDice from './ColorCheckerNumberDice';
import ColorCheckerColorDice from './ColorCheckerColorDice';

interface IProps {
	lastRollTimeStamp: number | string;
	diceValues: number[];
	diceSelections: string[];
}

export default class DiceTable extends React.Component<IProps, {}> {
	rollIndex: number = 0;
	lastRollTimeStamp: number | string = -1;

	/* Locale Events */
	onDiceClicked(diceId: number): void {}

	/* Rendering */
	render(): ReactNode {
		if (this.props.lastRollTimeStamp !== this.lastRollTimeStamp) {
			this.lastRollTimeStamp = this.props.lastRollTimeStamp;
			this.rollIndex++;
		}

		return (
			<div className={'color-checker-dice-table'}>
				<DiceBox
					rollIndex={this.rollIndex}
					nextRollResults={this.props.diceValues}
					highlightColors={this.props.diceSelections.map((el) => {
						switch (el) {
							case 'own':
								return '#0edc07';
							case 'blocked':
								return '#dc0727';
						}
						return undefined;
					})}
					diceToRollMask={[true, true, true, true, true]}
					onDicesClicked={this.onDiceClicked.bind(this)}
					diceComponent={[
						ColorCheckerNumberDice,
						ColorCheckerNumberDice,
						ColorCheckerNumberDice,
						ColorCheckerColorDice,
						ColorCheckerColorDice,
						ColorCheckerColorDice,
					]}
				/>
			</div>
		);
	}
}
