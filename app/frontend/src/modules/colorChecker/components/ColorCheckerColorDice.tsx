import React from 'react';
import Dice from '../../../framework/components/DiceBox/Dice';

const ColoredDiceMap = [
	'#c9437a',
	'#2cc52c',
	'#3f63b9',
	'#f9f917',
	'#ee7500',
	'#000000',
];

export default class ColorCheckerColorDice extends Dice {
	diceType: string = 'colorCheckerColor';

	renderSide(dotCount: number): JSX.Element {
		return (
			<li
				className={'die-item'}
				data-side={dotCount}
				key={'dice_side_' + dotCount}
			>
				<span
					className="dot"
					style={{
						backgroundColor: ColoredDiceMap[dotCount - 1],
					}}
				></span>
			</li>
		);
	}
}
