import React, {ReactNode} from 'react';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import colorChecker from './ColorChecker';
import DiceTable from './components/DiceTable';
import ColorGridBox from './components/ColorGridBox';
import {ColorGrid, Coordinate, defaultGrid, GridColorOptions,} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import JokerList from './components/JokerList';

interface IState {
	grid: ColorGrid;
	allowedNumbers: number[],
	allowedColors: GridColorOptions[],
	allowSelection: boolean,
	currentSelection: Coordinate[],
	currentDiceValues: number[]
}

export default class ColorCheckerGame
	extends React.Component<{}, IState>
	implements ModuleGameInterface
{
	private readonly api: ModuleApi;

	constructor(props: {}) {
		super(props);
		this.api = new ModuleApi(colorChecker, this);
		this.state = {
			grid: defaultGrid,
			allowedNumbers: [2,4],
			allowedColors: [GridColorOptions.BLUE],
			allowSelection: true,
			currentSelection: [],
			currentDiceValues: [6,6,1,1,6,1]
		};
	}

	onCellSelectionChanged(cells: Coordinate[]): void {
		this.setState({
			currentSelection: cells
		})
	}

	isFittingSelection(): boolean {
		return this.state.allowedNumbers.includes(this.state.currentSelection.length);
	}

	render(): ReactNode {
		return (
			<div id={'colorChecker'}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<ColorGridBox
						colorGrid={this.state.grid}
						onCellSelectionChanged={this.onCellSelectionChanged.bind(this)}
						allowSelection={this.state.allowSelection}
						allowedColors={this.state.allowedColors}
						allowedNumbers={this.state.allowedNumbers}
					/>

					<JokerList
						remainingJokers={10}
						onJokerUse={() => {}}
						usingColorJoker={false}
						usingNumberJoker={false}
						canUseNumberJoker={this.state.currentDiceValues.find(
							(el, i) => i <= 2 && el === 6
						) !== undefined}
						canUseColorJoker={this.state.currentDiceValues.find(
							(el, i) => i > 2 && el === 6
						) !== undefined}
					/>

					{
						this.state.allowSelection ?
						<button
							className={'btn btn-primary '}
							disabled={!this.isFittingSelection()}
						>
							Bestätigen
						</button> : null
					}
				</div>

				<DiceTable
					lastRollTimeStamp={-1}
					diceValues={this.state.currentDiceValues}
					diceSelections={['own', 'blocked', 'none', 'none', 'own', 'blocked']}
				/>
			</div>
		);
	}
}
