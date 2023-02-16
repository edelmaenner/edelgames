import {
	possibleGameStates,
	ScoreCellIDs,
	YahtzeeScoreboardType,
} from './YTypes';

export enum YahtzeeServerToClientEventNames {
	DICES_CHANGED = 'dicesChanged',
	SCORES_CHANGED = 'scoresChanged',
	GAME_STATE_CHANGED = 'gameStateChanged',
}

export type DiceChangedEventData = {
	diceMask: boolean[];
	diceValues: number[];
	remainingRolls: number;
	hasRolledDice: boolean;
};

export type ScoresChangedEventData = {
	scoreboard: YahtzeeScoreboardType;
};

export type GameStateChangedEventData = {
	gameState: possibleGameStates;
	activePlayerId: string | null;
};

export enum YahtzeeClientToServerEventNames {
	ROLL_REQUESTED = 'rollRequested',
	CELL_SELECTED = 'cellSelected',
	DICE_SELECTION_CHANGED = 'diceSelectionChanged',
}

export type RollRequestedEventData = {
	selectedDice: boolean[];
};

export type CellSelectedEventData = {
	selectedCellId: ScoreCellIDs;
};

export type DiceSelectionChangedEventData = {
	selectedDice: boolean[];
};
