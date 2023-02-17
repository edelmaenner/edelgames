import React, { ReactNode } from 'react';
import {
	ColorGrid,
	Coordinate,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
	colorGrid: ColorGrid;
	onCellClicked: { (x: number, y: number): void };
	allowSelection: boolean;
	allowedColors?: GridColorOptions[];
	allowedNumbers?: number[];
}

interface IState {
	currentSelection: Coordinate[];
}

export default class ColorGridBox extends React.Component<IProps, IState> {
	state = {
		currentSelection: [{ x: 8, y: 3 }],
	};

	render(): ReactNode {
		return (
			<div className={'color-checker-grid'}>
				{[...Array(15)].map((el, index) => this.renderColumn(index))}
			</div>
		);
	}

	renderColumn(x: number): JSX.Element {
		return (
			<div className={'color-checker-grid-column'}>
				<div className={'color-checker-grid-cell'}>
					{
						[
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
						][x]
					}
				</div>

				{[...Array(7)].map((el, index) => this.renderCell(x, index))}
			</div>
		);
	}

	renderCell(x: number, y: number): JSX.Element {
		let cell = this.props.colorGrid[x][y] || {
			color: '#fff',
			isSpecial: false,
			checked: false,
		};

		const canBeSelected = this.canFieldBeSelected(
			{ x: x, y: y },
			[GridColorOptions.GREEN],
			[2]
		);

		let classes = ['color-checker-grid-cell'];
		if (!cell.checked && canBeSelected) classes.push('clickable');
		if (canBeSelected) classes.push('selectable');

		return (
			<div
				className={classes.join(' ')}
				onClick={() => this.props.onCellClicked(x, y)}
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

	canFieldBeSelected(
		pos: Coordinate,
		allowedColors: GridColorOptions[],
		allowedCounts: number[]
	): boolean {
		const gridWidth = this.props.colorGrid.length;
		const gridHeight = this.props.colorGrid[0].length;

		const requiredFieldCount =
			allowedCounts.reduce((prev, curr) => (prev < curr ? prev : curr)) || 0;

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

		// now we have to find nearby empty fields with the same color. At least as many as requiredFieldCount
		let nearbyFields: Coordinate[] = [];
		let fieldsToCheck: Coordinate[] = [pos];

		// todo prevent selecting more fields, once the requiredFieldCount is reached and the spot would not
		// provide enough fields for a higher fieldCount

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

		if (pos.x === 8 && pos.y == 3) {
			console.log(
				`${pos.x}|${pos.y} has ${nearbyFields.length} neighbours of ${requiredFieldCount}`,
				nearbyFields
			);
		}

		return nearbyFields.length >= requiredFieldCount;
	}
}
