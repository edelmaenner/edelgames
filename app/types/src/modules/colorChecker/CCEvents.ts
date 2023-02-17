import { Coordinate } from './CCTypes';

export const enum C2SEvents {
	ON_ACTIVE_SELECT_DICE = 'onActiveSelectDice',
	ON_PLAYER_CHECKED = 'onActiveChecked',
}

export type OnActiveSelectDiceEventData = {
	color: number;
	count: number;
};

export type OnPlayerCheckedEventData = {
	checkedSquares: Coordinate[];
};
