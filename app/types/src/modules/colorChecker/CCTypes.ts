export const enum GameStates {
	INIT = 'init',
	ACTIVE_PLAYER_SELECTS = 'activePlayerSelects',
	PASSIVE_PLAYERS_SELECTS = 'passivePlayersSelects',
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
export type ColorGridCollection = {
	playerId: string;
	playerName: string;
	grid: ColorGrid;
}[];

export type Coordinate = {
	x: number;
	y: number;
};

export const defaultGrid: ColorGrid = [
	[
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: true, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: true, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: true, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: true, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: true, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: true, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: true, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.GREEN, isSpecial: true, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: true, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: true, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: true, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.ORANGE, isSpecial: true, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: true, checked: false },
	],
	[
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: true, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
	],
	[
		{ color: GridColorOptions.YELLOW, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.GREEN, isSpecial: false, checked: false },
		{ color: GridColorOptions.BLUE, isSpecial: false, checked: false },
		{ color: GridColorOptions.RED, isSpecial: false, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: true, checked: false },
		{ color: GridColorOptions.ORANGE, isSpecial: false, checked: false },
	],
];