export const enum GameStates {
	INIT = 'init',
	ACTIVE_PLAYER_SELECTS = 'activePlayerSelects',
	PASSIVE_PLAYERS_SELECTS = 'passivePlayersSelects',
	ENDING_SCREEN = 'endingScreen',
}

export const enum GridColorOptions {
	RED = '#ee3b69',
	YELLOW = '#ff0',
	ORANGE = '#fc8712',
	GREEN = '#6dc535',
	BLUE = '#4993a8',
}

export type ColorGridCell = {
	color: GridColorOptions | '#fff';
	isSpecial: boolean;
	checked: boolean;
};
export type ColorGridColumn = ColorGridCell[];
export type ColorGrid = ColorGridColumn[];
export type ColorGridDefinition = {
	playerId: string;
	playerName: string;
	grid: ColorGrid;
	remainingJokers: number;
	isUsingNumberJoker: boolean;
	isUsingColorJoker: boolean;
	finishedColors: boolean[];
	finishedColumns: boolean[];
};
export type ColorGridCollection = ColorGridDefinition[];

export type Coordinate = {
	x: number;
	y: number;
};
