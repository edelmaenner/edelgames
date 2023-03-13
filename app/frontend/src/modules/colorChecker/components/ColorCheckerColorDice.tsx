import React from 'react';
import Dice from '../../../framework/components/DiceBox/Dice';
import { SelectableColors } from './ColorGridBox';

const ColoredDiceMap = [...SelectableColors, '#000000'];

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
