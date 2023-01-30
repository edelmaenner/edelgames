export interface ITeam {
	id?: number;
	teamColor?: string;
	name: string;
	spymaster: string | undefined;
	investigators: string[];
	wordsLeft: number;
	active: boolean;
}

export interface IBoardElement {
	word: string;
	category: Category;
	teamName: string;
	teamId?: number;
	categoryVisibleForEveryone: boolean;
	marks: string[];
}

export type Hint = {
	word: string;
	amnt: number;
};

export enum Category {
	'bomb',
	'neutral',
	'team',
}
