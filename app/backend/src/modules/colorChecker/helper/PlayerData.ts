import {
	ColorGrid,
	GridScore,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { SelectableColors } from '../ColorCheckerGame';
import User from '../../../framework/User';
import GridHelper, { ColumnPoints } from './GridHelper';

export default class PlayerData {
	playerId: string;
	playerName: string;
	grid: ColorGrid;
	finishedColumns: boolean[];
	finishedColors: boolean[] = Array(SelectableColors.length).fill(false);
	remainingJokers = 10;
	isUsingNumberJoker = false;
	isUsingColorJoker = false;

	constructor(player: User, gridTemplate: ColorGrid) {
		this.playerId = player.getId();
		this.playerName = player.getUsername();
		this.grid = GridHelper.createNewGrid(gridTemplate);
		this.finishedColumns = Array(this.grid.length).fill(false);
	}

	getScore(
		columnOwners: (string | undefined)[],
		bonusOwners: (string | undefined)[]
	): GridScore {
		// gather the score for full column
		const columnPoints: number = this.finishedColumns
			.map((isFinished, index) => {
				if (!isFinished) {
					return 0;
				}
				return ColumnPoints[index][
					columnOwners[index] === this.playerId ? 0 : 1
				];
			})
			.reduce((prev, curr) => prev + curr);

		// gather the score for bonus points
		const colorPoints: number[] = this.finishedColors.map(
			(isFinished, index) => {
				if (!isFinished) {
					return 0;
				}
				return bonusOwners[index] === this.playerId ? 5 : 3;
			}
		);
		const bonusPoints: number = colorPoints.reduce((prev, curr) => prev + curr);

		const starPoints = -2 * GridHelper.getUncheckedStarsInGrid(this.grid);

		return {
			bonus: bonusPoints,
			columns: columnPoints,
			jokers: this.remainingJokers,
			stars: starPoints,
			total: bonusPoints + columnPoints + this.remainingJokers + starPoints,
		};
	}
}
