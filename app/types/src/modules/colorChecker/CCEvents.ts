import { ColorGrid, Coordinate, GameStates, GridColorOptions } from './CCTypes';

export const enum C2SEvents {
	ON_SELECTION_MADE = 'onSelectionMade',
	ON_JOKER_REQUESTED = 'onJokerRequested',
}

export type OnSelectionMadeEventData = {
	cells: Coordinate[];
};

export type OnJokerRequestedEventData = {
	type: 'number' | 'color';
};

export const enum S2CEvents {
	ON_GAME_STATE_UPDATE = 'onGameStateUpdate',
	ON_GRID_CHANGED = 'onGridChanged',
}

export type OnGameStateUpdateEventData = {
	gameState: GameStates;
	activePlayerId?: string;
	currentDiceValues: number[];
	reservedDiceIndices: number[];
	reservedBonusPoints: boolean[];
	reservedColumnPoints: boolean[];
	usingColorJoker: boolean;
	usingNumberJoker: boolean;
	remainingJokers: number;
};

export type OnGridChangedEventData = {
	newGrid: ColorGrid;
};
