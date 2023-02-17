import React, { ReactNode } from 'react';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import colorChecker from './ColorChecker';
import DiceTable from './components/DiceTable';
import ColorGridBox from './components/ColorGridBox';
import {
	ColorGrid,
	defaultGrid,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import JokerList from './components/JokerList';

interface IState {
	grid: ColorGrid;
}

export default class ColorCheckerGame
	extends React.Component<{}, IState>
	implements ModuleGameInterface
{
	private readonly api: ModuleApi;

	state = {
		grid: defaultGrid,
	};

	constructor(props: {}) {
		super(props);
		this.api = new ModuleApi(colorChecker, this);
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
						onCellClicked={(x, y) => console.log(x, y)}
						allowSelection={true}
						allowedColors={[GridColorOptions.GREEN]}
						allowedNumbers={[2, 4, 5]}
					/>

					<JokerList remainingJokers={10} onJokerUse={() => {}} />
				</div>

				<DiceTable
					lastRollTimeStamp={-1}
					diceValues={[4, 5, 6, 4, 5, 6]}
					diceSelections={['own', 'blocked', 'none', 'none', 'own', 'blocked']}
				/>
			</div>
		);
	}
}
