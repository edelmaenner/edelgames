import { Component } from 'react';
import { SelectableColors } from './ColorGridBox';
import { ColorGrid } from '@edelgames/types/src/modules/colorChecker/CCTypes';

interface IProps {
	reservedBonusPoints: boolean[];
	grid: ColorGrid;
}

export default class ScoreBoard extends Component<IProps, {}> {
	finishedColors: boolean[] = Array(SelectableColors.length);

	updateFinishedColors(): void {
		for (let i = 0; i < SelectableColors.length; i++) {
			let color = SelectableColors[i];
			let isColorFinished = true;

			for (let row of this.props.grid) {
				for (let column of row) {
					if (column.color === color && !column.checked) {
						isColorFinished = false;
						break;
					}
				}

				if (!isColorFinished) {
					break;
				}
			}

			this.finishedColors[i] = isColorFinished;
		}
	}

	render() {
		this.updateFinishedColors();

		return <div className={'scoreboard'}>{this.renderBonusPanel()}</div>;
	}

	renderBonusPanel(): JSX.Element {
		return (
			<div className={'bonus-panel'}>
				{SelectableColors.map(this.renderBonusPanelRow.bind(this))}
			</div>
		);
	}

	renderBonusPanelRow(color: string, index: number): JSX.Element {
		const isReserved = this.props.reservedBonusPoints[index];
		const isReached = this.props.reservedBonusPoints[index];

		return (
			<div className={'color-bonus-row'} key={'color-bonus-' + color}>
				<div
					className={'color-bonus-cell color-bonus-preview'}
					style={{
						backgroundColor: color,
					}}
				></div>
				<div className={'color-bonus-cell'}>
					<span className={isReserved ? 'striked' : isReached ? 'circled' : ''}>
						5
					</span>
				</div>
				<div className={'color-bonus-cell'}>
					<span className={isReserved && isReached ? 'circled' : ''}>3</span>
				</div>
			</div>
		);
	}
}
