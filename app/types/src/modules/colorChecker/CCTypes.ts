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

export type GridScore = {
	bonus: number;
	columns: number;
	stars: number;
	jokers: number;
	total: number;
};

export type GridPlayerScore = {
	player: string;
	score: GridScore;
	grid: ColorGrid;
	history: Coordinate[];
};

export type GridScoreboard = GridPlayerScore[];

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

export type Coordinate = {
	x: number;
	y: number;
};
