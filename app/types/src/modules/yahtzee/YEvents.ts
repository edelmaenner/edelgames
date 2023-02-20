import {
	possibleGameStates,
	ScoreCellIDs,
	YahtzeeScoreboardType,
} from './YTypes';

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

export type RollRequestedEventData = {
	selectedDice: boolean[];
};

export type CellSelectedEventData = {
	selectedCellId: ScoreCellIDs;
};

export type DiceSelectionChangedEventData = {
	selectedDice: boolean[];
};
