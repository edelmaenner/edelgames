import React, {ReactNode} from 'react';
import {
	ColorGrid, ColorGridCell,
	Coordinate,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
	colorGrid: ColorGrid;
	onCellSelectionChanged: { (cells: Coordinate[]): void };
	allowSelection: boolean;
	allowedColors?: GridColorOptions[];
	allowedNumbers?: number[];
}

interface IState {
	currentSelection: Coordinate[];
}

export default class ColorGridBox extends React.Component<IProps, IState> {

	constructor(props: IProps) {
		super(props);
		this.state = {
			currentSelection: []
		}
	}

	render(): ReactNode {
		return (
			<div className={'color-checker-grid'}>
				{[...Array(15)].map((el, index) => this.renderColumn(index))}
			</div>
		);
	}

	renderColumn(x: number): JSX.Element {
		return (
			<div className={'color-checker-grid-column'} key={"column_"+x}>
				<div className={'color-checker-grid-cell'}>
					{
						['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'][x]
					}
				</div>

				{[...Array(7)].map((el, index) => this.renderCell(x, index))}
			</div>
		);
	}

	getCellFromGrid(x: number, y: number): ColorGridCell {
		const width = this.props.colorGrid.length;
		const height = this.props.colorGrid[0].length;

		if(x >= 0 && y >= 0 && x < width && y < height) {
			return this.props.colorGrid[x][y];
		}

		return {
			color: '#fff',
			isSpecial: false,
			checked: false,
		};
	}

	isCellInCurrentSelection(pos: Coordinate): boolean {
		return this.state.currentSelection.find(el => (el.x === pos.x && el.y === pos.y)) !== undefined;
	}

	renderCell(x: number, y: number): JSX.Element {
		let cell = this.getCellFromGrid(x,y);
		let pos = {x: x, y: y};

		let classes = ['color-checker-grid-cell'];
		if(this.isCellInCurrentSelection(pos)) {
			classes.push('selected');
		}

		return (
			<div
				key={"column_"+x+"_"+y}
				className={classes.join(' ')}
				onClick={this.onCellClicked.bind(this, pos)}
				onMouseEnter={(event) => this.onMouseEnterCell(pos, event.currentTarget)}
				onMouseLeave={(event) => this.onMouseLeaveCell(pos, event.currentTarget)}
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
		if(isSelectable) {
			element.classList.add('selectable');
		}
	}

	onMouseLeaveCell(pos: Coordinate, element: Element): void {
		element.classList.remove('selectable', 'clickable');
	}

	onCellClicked(pos: Coordinate): void {
		let existingSelection = this.state.currentSelection.find(el => el.x === pos.x && el.y === pos.y);
		let newSelection = this.state.currentSelection;

		if(existingSelection !== undefined) {
			// remove selection
			newSelection.splice(this.state.currentSelection.indexOf(existingSelection), 1);
		}
		else if(this.canFieldBeSelected(pos, this.props.allowedColors??[], this.props.allowedNumbers??[])) {
			// add selection
			newSelection.push(pos);
		}

		this.setState({
			currentSelection: newSelection
		});
		this.props.onCellSelectionChanged(newSelection);
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

		if(this.state.currentSelection.length >= allowedFieldCount) {
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

		// if we already have a selection, check if this field is neighboring one of them and not one of them
		if (
			this.state.currentSelection.length > 0 &&
			(!this.state.currentSelection.find(
				(other) =>
					(Math.abs(other.x - pos.x) === 1 && other.y === pos.y) ||
					(other.x === pos.x && Math.abs(other.y - pos.y) === 1)
			) ||
				this.state.currentSelection.find(
					(other) => other.x === pos.x && other.y === pos.y
				))
		) {
			return false;
		}

		// if we don't have a selection yet, check if this cell is next to a selected one or the start column
		if (this.state.currentSelection.length === 0 &&
			pos.x !== 7 &&
			!this.getCellFromGrid(pos.x-1,pos.y).checked &&
			!this.getCellFromGrid(pos.x+1,pos.y).checked &&
			!this.getCellFromGrid(pos.x,pos.y-1).checked &&
			!this.getCellFromGrid(pos.x,pos.y+1).checked
		) {
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
