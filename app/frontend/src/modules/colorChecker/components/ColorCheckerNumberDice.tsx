import React from 'react';
import Dice from '../../../framework/components/DiceBox/Dice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class ColorCheckerNumberDice extends Dice {
	diceType: string = 'colorCheckerNumber';

	renderSide(dotCount: number): JSX.Element {
		if (dotCount === 6) {
			return (
				<li
					className={'die-item joker'}
					data-side={dotCount}
					key={'dice_side_' + dotCount}
				>
					<FontAwesomeIcon icon={['fad', 'question']} size="2x" />
				</li>
			);
		}

		return super.renderSide(dotCount);
	}
}
