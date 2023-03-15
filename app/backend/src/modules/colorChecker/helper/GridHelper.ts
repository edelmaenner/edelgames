import {
	ColorGrid,
	ColorGridCell,
	ColorGridColumn,
	Coordinate,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { defaultGrid } from '../gridTemplates/default';
import DiceHelper from './DiceHelper';

export default class GridHelper {
	static AvailableGridTemplates: ColorGrid[] = [defaultGrid];

	static EmptyCell: ColorGridCell = {
		checked: false,
		color: '#fff',
		isSpecial: false,
	};

	static createNewGrid(templateGrid: ColorGrid): ColorGrid {
		const grid: ColorGrid = [];
		for (let x = 0; x < templateGrid.length; x++) {
			const column: ColorGridColumn = [];
			for (let y = 0; y < templateGrid[0].length; y++) {
				const templateCell = templateGrid[x][y];
				column.push({
					color: templateCell.color,
					checked: templateCell.checked,
					isSpecial: templateCell.isSpecial,
				});
			}
			grid.push(column);
		}

		return grid;
	}

	static getCell(x: number, y: number, grid: ColorGrid): ColorGridCell {
		if (x >= 0 && y >= 0 && x < grid.length && y < grid[0].length) {
			return grid[x][y];
		}
		return GridHelper.EmptyCell;
	}

	static getCellAt(pos: Coordinate, grid: ColorGrid): ColorGridCell {
		return this.getCell(pos.x, pos.y, grid);
	}

	static getUncheckedStarsInGrid(grid: ColorGrid): number {
		let uncheckedStars = 0;
		for (const column of grid) {
			for (const cell of column) {
				if (!cell.checked && cell.isSpecial) {
					uncheckedStars++;
				}
			}
		}
		return uncheckedStars;
	}

	static doesCellHasCheckedNeighbour(
		pos: Coordinate,
		grid: ColorGrid
	): boolean {
		return (
			this.getCell(pos.x - 1, pos.y, grid).checked ||
			this.getCell(pos.x + 1, pos.y, grid).checked ||
			this.getCell(pos.x, pos.y - 1, grid).checked ||
			this.getCell(pos.x, pos.y + 1, grid).checked
		);
	}

	static doesCellHasSelectedNeighbour(
		pos: Coordinate,
		selection: Coordinate[]
	): boolean {
		return (
			selection.find(
				(other) =>
					(Math.abs(other.x - pos.x) === 1 && other.y === pos.y) ||
					(other.x === pos.x && Math.abs(other.y - pos.y) === 1)
			) !== undefined
		);
	}

	/*
        Mark the cells as checked and returns if it was successful
     */
	static checkCellsInGrid(
		cells: Coordinate[],
		grid: ColorGrid
	): GridColorOptions | '#fff' {
		const cellColor =
			cells.length > 0 ? this.getCellAt(cells[0], grid).color : '#fff';
		if (cellColor === '#fff') {
			return cellColor;
		}

		// only check the cells, if the cellColor is valid
		for (const pos of cells) {
			this.getCellAt(pos, grid).checked = true;
		}
		return cellColor;
	}

	static checkIfColorIsCompleted(
		color: GridColorOptions,
		grid: ColorGrid
	): boolean {
		for (const row of grid) {
			for (const cell of row) {
				if (cell.color === color && !cell.checked) {
					return false;
				}
			}
		}

		return true;
	}

	static checkIfColumnIsCompleted(
		columnIndex: number,
		grid: ColorGrid
	): boolean {
		for (const cell of grid[columnIndex]) {
			if (!cell.checked) {
				return false;
			}
		}
		return true;
	}

	static isSelectionValid(
		selection: Coordinate[],
		grid: ColorGrid,
		isUsingNumberJoker: boolean,
		isUsingColorJoker: boolean,
		diceHelper: DiceHelper
	): boolean {
		if (selection.length === 0) {
			return true; // the user can always skip
		}

		if (selection.length > 5) {
			return false; // the total maximum will always be 5 cells at a time
		}

		// check if the number and color are available dices
		const selectedColor = this.getCellAt(selection[0], grid).color;
		if (
			!diceHelper.isNumberAvailable(
				isUsingNumberJoker ? 6 : selection.length
			) ||
			!diceHelper.isColorAvailable(isUsingColorJoker ? 'joker' : selectedColor)
		) {
			return false;
		}

		// check if all fields have the same color
		for (const pos of selection) {
			if (this.getCellAt(pos, grid).color !== selectedColor) {
				return false;
			}
		}

		const fieldsToValidate = [...selection];
		const validatedFields: Coordinate[] = [];
		let continueCheck = false;

		do {
			continueCheck = false;

			// try to find one field, that can be validated
			for (let i = 0; i < fieldsToValidate.length; i++) {
				const pos = fieldsToValidate[i];
				let isValid = false;

				if (validatedFields.length === 0) {
					// start by searching a cell next to a checked field or the start column
					isValid =
						pos.x === 7 || GridHelper.doesCellHasCheckedNeighbour(pos, grid);
				} else {
					// require all other fields to be next to a valid selection
					isValid = this.doesCellHasSelectedNeighbour(pos, validatedFields);
				}

				if (isValid) {
					validatedFields.push(pos);
					fieldsToValidate.splice(i, 1);
					continueCheck = true;
					break;
				}
			}
		} while (continueCheck);

		return validatedFields.length === selection.length;
	}
}

export const ColumnPoints = [
	[5, 3],
	[3, 2],
	[3, 2],
	[3, 2],
	[2, 1],
	[2, 1],
	[2, 1],
	[1, 0],
	[2, 1],
	[2, 1],
	[2, 1],
	[3, 2],
	[3, 2],
	[3, 2],
	[5, 3],
];
