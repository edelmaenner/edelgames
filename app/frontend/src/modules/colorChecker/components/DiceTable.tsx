import React, { ReactNode } from 'react';
import DiceBox from '../../../framework/components/DiceBox/DiceBox';
import ColorCheckerNumberDice from './ColorCheckerNumberDice';
import ColorCheckerColorDice from './ColorCheckerColorDice';

interface IProps {
	lastRollTimeStamp: number | string;
	diceValues: number[];
	diceSelections: boolean[];
}

export default class DiceTable extends React.Component<IProps, {}> {
	rollIndex: number = 0;
	lastRollTimeStamp: number | string = -1;

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
					highlightColors={this.props.diceSelections.map((el) =>
						el ? '#dc0727' : undefined
					)}
					diceToRollMask={[true, true, true, true, true, true]}
					onDicesClicked={() => undefined}
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
