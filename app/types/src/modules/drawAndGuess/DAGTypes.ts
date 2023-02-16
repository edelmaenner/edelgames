export type GameConfigObject = {
	drawingTime: number;
	choosingTime: number;
	maxHints: number;
	rounds: number;
};

export type DAGChatMessage = {
	sender: string;
	text: string;
	timestamp: number;
	coloring: string | null;
};
