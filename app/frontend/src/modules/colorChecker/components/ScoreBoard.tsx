import { Component } from 'react';
import { SelectableColors } from './ColorGridBox';
import { ColorGrid } from '@edelgames/types/src/modules/colorChecker/CCTypes';

interface IProps {
	reservedBonusPoints: boolean[];
	finishedColors: boolean[];
	grid: ColorGrid;
}

export default class ScoreBoard extends Component<IProps, {}> {
	render() {
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
		const isReached = this.props.finishedColors[index];

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
