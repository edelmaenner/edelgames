import {
	Category,
	IBoardElement,
} from '@edelgames/types/src/modules/codenames/CNTypes';

export class BoardElement implements IBoardElement {
	word: string;
	category: Category;
	teamName: string;
	categoryVisibleForEveryone: boolean;
	marks: string[];

	constructor(
		word: string,
		category: Category,
		teamName: string,
		categoryVisibleForEveryone = false,
		marks: string[] = []
	) {
		this.word = word;
		this.category = category;
		this.teamName = teamName;
		this.categoryVisibleForEveryone = categoryVisibleForEveryone;
		this.marks = marks;
	}
}
