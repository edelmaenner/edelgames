import React, { ReactNode } from 'react';
import {
	ColorGrid,
	ColorGridCell,
	Coordinate,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ModuleEventApi from '../../../framework/modules/api/ModuleEventApi';

interface IProps {
	colorGrid: ColorGrid;
	onCellSelectionChanged: {
		(cells: Coordinate[], cellColor?: GridColorOptions): void;
	};
	allowSelection: boolean;
	allowedColors?: GridColorOptions[];
	allowedNumbers?: number[];
	reservedColumnPoints: boolean[];
	finishedColumns: boolean[];
	eventApi: ModuleEventApi;
}

interface IState {
	currentSelection: Coordinate[];
}

export default class ColorGridBox extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			currentSelection: [],
		};
	}

	componentDidMount() {
		this.props.eventApi.addEventHandler(
			'clearGridSelection',
			this.onClearGridSelection.bind(this)
		);
	}

	componentWillUnmount() {
		this.props.eventApi.removeEvent('clearGridSelection');
	}

	onClearGridSelection(): void {
		this.setState({
			currentSelection: [],
		});
	}

	render(): ReactNode {
		return (
			<div className={'color-checker-grid'}>
				{[...Array(ColumnIdentifiers.length)].map((el, index) =>
					this.renderColumn(index)
				)}
			</div>
		);
	}

	renderColumn(x: number): JSX.Element {
		const isColumnFinished = this.props.finishedColumns[x];

		return (
			<div className={'color-checker-grid-column'} key={'column_' + x}>
				<div className={'color-checker-grid-cell'}>{ColumnIdentifiers[x]}</div>

				{[...Array(RowIdentifiers.length)].map((el, index) =>
					this.renderCell(x, index)
				)}

				<div
					className={
						'points ' +
						(this.props.reservedColumnPoints[x]
							? 'striked'
							: isColumnFinished
							? 'circled'
							: '')
					}
				>
					{ColumnPoints[x][0]}
				</div>
				<div
					className={
						'points ' +
						(this.props.reservedColumnPoints[x] && isColumnFinished
							? 'circled'
							: '')
					}
				>
					{ColumnPoints[x][1]}
				</div>
			</div>
		);
	}

	getCellFromGrid(x: number, y: number): ColorGridCell {
		const width = this.props.colorGrid.length;
		const height = this.props.colorGrid[0].length;

		if (x >= 0 && y >= 0 && x < width && y < height) {
			return this.props.colorGrid[x][y];
		}

		return EmptyCell;
	}

	isCellInCurrentSelection(pos: Coordinate): boolean {
		return (
			this.state.currentSelection.find(
				(el) => el.x === pos.x && el.y === pos.y
			) !== undefined
		);
	}

	renderCell(x: number, y: number): JSX.Element {
		let cell = this.getCellFromGrid(x, y);
		let pos = { x: x, y: y };

		let classes = ['color-checker-grid-cell'];
		if (this.isCellInCurrentSelection(pos)) {
			classes.push('selected');
		}

		return (
			<div
				key={'column_' + x + '_' + y}
				className={classes.join(' ')}
				onClick={this.onCellClicked.bind(this, pos)}
				onMouseEnter={(event) =>
					this.onMouseEnterCell(pos, event.currentTarget)
				}
				onMouseLeave={(event) =>
					this.onMouseLeaveCell(pos, event.currentTarget)
				}
				style={{
					backgroundColor: cell.color,
				}}
			>
				{cell.checked ? (
					<FontAwesomeIcon icon={['fad', 'xmark']} size="1x" />
				) : null}
				{cell.isSpecial && !cell.checked ? (
					<FontAwesomeIcon icon={['fad', 'star']} size="1x" />
				) : null}
			</div>
		);
	}

	onMouseEnterCell(pos: Coordinate, element: Element): void {
		let isSelectable = this.canFieldBeSelected(
			pos,
			this.props.allowedColors ?? [],
			this.props.allowedNumbers ?? []
		);
		if (isSelectable) {
			element.classList.add('selectable');
		}
	}

	onMouseLeaveCell(pos: Coordinate, element: Element): void {
		element.classList.remove('selectable', 'clickable');
	}

	onCellClicked(pos: Coordinate): void {
		let existingSelection = this.state.currentSelection.find(
			(el) => el.x === pos.x && el.y === pos.y
		);
		let newSelection = [...this.state.currentSelection];

		if (existingSelection !== undefined) {
			// remove selection
			newSelection.splice(
				this.state.currentSelection.indexOf(existingSelection),
				1
			);
			if (!this.isSelectionValid(newSelection)) {
				return; // abort this change, as it invalidates the selection
			}
		} else if (
			this.canFieldBeSelected(
				pos,
				this.props.allowedColors ?? [],
				this.props.allowedNumbers ?? []
			)
		) {
			// add selection
			newSelection.push(pos);
		} else {
			// do nothing
			return;
		}

		this.setState({
			currentSelection: newSelection,
		});

		let selectedColor =
			newSelection.length > 0
				? this.getCellFromGrid(newSelection[0].x, newSelection[0].y).color
				: undefined;
		this.props.onCellSelectionChanged(
			newSelection,
			selectedColor === '#fff' ? undefined : selectedColor
		);
	}

	isSelectionValid(selection: Coordinate[]): boolean {
		let selectionToCheck = [...selection];
		let validSelectedFields: Coordinate[] = [];

		let continueCheck = true;
		while (continueCheck) {
			continueCheck = false;

			// try to find a valid selection
			for (let i = 0; i < selectionToCheck.length; i++) {
				let pos = selectionToCheck[i];
				let isValid = false;
				if (validSelectedFields.length === 0) {
					// start by searching a cell next to a checked field or the start column
					isValid = pos.x === 7 || this.doesCellHasCheckedNeighbour(pos);
				} else {
					// require additional selections to be next to an existing selection
					isValid =
						this.getSelectedNeighbourOfCell(pos, validSelectedFields) !==
						undefined;
				}

				if (isValid) {
					validSelectedFields.push(pos);
					selectionToCheck.splice(i, 1);
					continueCheck = true;
					break;
				}
			}
		}

		return validSelectedFields.length === selection.length;
	}

	doesCellHasCheckedNeighbour(pos: Coordinate): boolean {
		return (
			this.getCellFromGrid(pos.x - 1, pos.y).checked ||
			this.getCellFromGrid(pos.x + 1, pos.y).checked ||
			this.getCellFromGrid(pos.x, pos.y - 1).checked ||
			this.getCellFromGrid(pos.x, pos.y + 1).checked
		);
	}

	getSelectedNeighbourOfCell(
		pos: Coordinate,
		selection: Coordinate[]
	): Coordinate | undefined {
		return selection.find(
			(other) =>
				(Math.abs(other.x - pos.x) === 1 && other.y === pos.y) ||
				(other.x === pos.x && Math.abs(other.y - pos.y) === 1)
		);
	}

	canFieldBeSelected(
		pos: Coordinate,
		allowedColors: GridColorOptions[],
		allowedCounts: number[]
	): boolean {
		const gridWidth = this.props.colorGrid.length;
		const gridHeight = this.props.colorGrid[0].length;

		const requiredFieldCount =
			allowedCounts.reduce((prev, curr) => (prev < curr ? prev : curr)) || 0;
		const allowedFieldCount =
			allowedCounts.reduce((prev, curr) => (prev > curr ? prev : curr)) || 0;

		if (this.state.currentSelection.length >= allowedFieldCount) {
			return false; // already selected the maximum
		}

		if (pos.x < 0 || pos.y < 0 || pos.x >= gridWidth || pos.y >= gridHeight) {
			return false; // out of bounce
		}

		const targetField = this.props.colorGrid[pos.x][pos.y];
		if (
			targetField.color === '#fff' ||
			allowedColors.indexOf(targetField.color) === -1
		) {
			return false; // placeholder color or color not allowed
		}

		// if we already have a selection
		if (this.state.currentSelection.length > 0) {
			// check if this field is already selected and thus valid
			const isCellAlreadySelected = this.state.currentSelection.find(
				(other) => other.x === pos.x && other.y === pos.y
			);
			if (isCellAlreadySelected) {
				return true;
			}

			// check if this field is neighboring one of them
			const existingNeighbour = this.getSelectedNeighbourOfCell(
				pos,
				this.state.currentSelection
			);
			if (!existingNeighbour) {
				return false;
			}

			// check if the neighbouring cell has the same color
			if (
				targetField.color !==
				this.getCellFromGrid(existingNeighbour.x, existingNeighbour.y).color
			) {
				return false;
			}
		} else if (pos.x !== 7 && !this.doesCellHasCheckedNeighbour(pos)) {
			// we dont have any checked, neighbouring cells and are not in the starting column
			return false;
		}

		// now we have to find nearby empty fields with the same color. At least as many as requiredFieldCount
		let nearbyFields: Coordinate[] = [];
		let fieldsToCheck: Coordinate[] = [pos];

		while (
			fieldsToCheck.length > 0 &&
			nearbyFields.length < requiredFieldCount
		) {
			const fieldToCheck = fieldsToCheck.shift();
			if (!fieldToCheck) {
				continue;
			}

			const gridFieldToCheck =
				this.props.colorGrid[fieldToCheck.x][fieldToCheck.y];

			if (
				nearbyFields.find(
					(field) => field.x === fieldToCheck.x && field.y === fieldToCheck.y
				) ||
				gridFieldToCheck.color !== targetField.color ||
				gridFieldToCheck.checked
			) {
				continue; // skip already found fields, field with another color or already checked fields
			}

			nearbyFields.push(fieldToCheck);

			if (fieldToCheck.x > 0) {
				fieldsToCheck.push({ x: fieldToCheck.x - 1, y: fieldToCheck.y });
			}
			if (fieldToCheck.y > 0) {
				fieldsToCheck.push({ x: fieldToCheck.x, y: fieldToCheck.y - 1 });
			}
			if (fieldToCheck.x < gridWidth - 1) {
				fieldsToCheck.push({ x: fieldToCheck.x + 1, y: fieldToCheck.y });
			}
			if (fieldToCheck.y < gridHeight - 1) {
				fieldsToCheck.push({ x: fieldToCheck.x, y: fieldToCheck.y + 1 });
			}
		}

		return nearbyFields.length >= requiredFieldCount;
	}
}

export const ColumnIdentifiers = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
];
export const RowIdentifiers = [0, 1, 2, 3, 4, 5, 6];
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
export const SelectableColors = [
	GridColorOptions.RED,
	GridColorOptions.YELLOW,
	GridColorOptions.ORANGE,
	GridColorOptions.GREEN,
	GridColorOptions.BLUE,
];
export const EmptyCell: ColorGridCell = {
	checked: false,
	color: '#fff',
	isSpecial: false,
};
export const EmptyGrid = ColumnIdentifiers.map(() =>
	RowIdentifiers.map(() => EmptyCell)
);
