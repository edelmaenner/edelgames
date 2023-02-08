export type gameState = {
	state: possibleGameStates;
	activePlayerId: string | null;
};

export const enum possibleGameStates {
	STARTUP = 'startup',
	PLAYER_ACTION = 'player_action',
	ENDING_SCORE = 'ending_score',
}

export const enum ScoreCellIDs {
	ONE = 'one',
	TWO = 'two',
	THREE = 'three',
	FOUR = 'four',
	FIVE = 'five',
	SIX = 'six',
	THREE_OF_A_KIND = 'threeOfAKind',
	FOUR_OF_A_KIND = 'fourOfAKind',
	FIVE_OF_A_KIND = 'fiveOfAKind',
	FULL_HOUSE = 'fullHouse',
	SMALL_STRAIGHT = 'smallStraight',
	LARGE_STRAIGHT = 'largeStraight',
	CHANCE = 'chance',
}

export type scoreType = number | null;
export type YahtzeeScoreObject = {
	playerId: string;
	[ScoreCellIDs.ONE]: scoreType;
	[ScoreCellIDs.TWO]: scoreType;
	[ScoreCellIDs.THREE]: scoreType;
	[ScoreCellIDs.FOUR]: scoreType;
	[ScoreCellIDs.FIVE]: scoreType;
	[ScoreCellIDs.SIX]: scoreType;
	[ScoreCellIDs.THREE_OF_A_KIND]: scoreType;
	[ScoreCellIDs.FOUR_OF_A_KIND]: scoreType;
	[ScoreCellIDs.FULL_HOUSE]: scoreType;
	[ScoreCellIDs.SMALL_STRAIGHT]: scoreType;
	[ScoreCellIDs.LARGE_STRAIGHT]: scoreType;
	[ScoreCellIDs.FIVE_OF_A_KIND]: scoreType;
	[ScoreCellIDs.CHANCE]: scoreType;
	total: scoreType;
};
export type YahtzeeScoreboardType = YahtzeeScoreObject[];

export type DiceDotCollection = { value: number; count: number }[];
