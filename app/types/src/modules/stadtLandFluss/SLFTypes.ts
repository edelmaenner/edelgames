export type gameConfig = {
	categories: string[];
	rounds: number;
};

export type Guesses = {
	[userId: string]: {
		[letter: string]: {
			[category: string]: string;
		};
	};
};

export type Points = {
	[letter: string]: {
		[category: string]: {
			[userId: string]: number;
		};
	};
};

export type PointOverrides = {
	[userId: string]: {
		[category: string]: string[];
	};
};

export interface Players {
	[index: string]: string;
}

export type GameState = {
	active: boolean;
	players: Players;
	config: gameConfig;
	round: number | null;
	guesses: Guesses;
	gamePhase: string;
	letter: string;
	ready_users: string[];
	points: Points;
	point_overrides: PointOverrides;
};
