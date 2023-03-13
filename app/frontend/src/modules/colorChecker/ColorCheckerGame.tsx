import React, {ReactNode} from 'react';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import colorChecker from './ColorChecker';
import DiceTable from './components/DiceTable';
import ColorGridBox, {ColumnIdentifiers, EmptyGrid, SelectableColors} from './components/ColorGridBox';
import {
	ColorGrid,
	Coordinate,
	defaultGrid,
	GameStates,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import JokerList from './components/JokerList';
import {EventDataObject} from "@edelgames/types/src/app/ApiTypes";
import ScoreBoard from "./components/ScoreBoard";
import {
	OnGameStateUpdateEventData,
	OnGridChangedEventData,
	S2CEvents
} from "@edelgames/types/src/modules/colorChecker/CCEvents";

interface IState {
	grid: ColorGrid;
	gameState: GameStates;
	activePlayerId?: string;
	allowedNumbers: number[];
	allowedColors: GridColorOptions[];
	currentSelection: Coordinate[];
	currentDiceValues: number[];
	reservedDiceIndices: number[];
	reservedBonusPoints: boolean[];
	reservedColumnPoints: boolean[];
	usingColorJoker: boolean;
	usingNumberJoker: boolean;
	remainingJokers: number;
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
			grid: EmptyGrid,
			activePlayerId: undefined,
			gameState: GameStates.PASSIVE_PLAYERS_SELECTS,
			currentSelection: [],
			currentDiceValues: [6,5,4,3,2,1],
			allowedNumbers: [],
			allowedColors: [],
			reservedColumnPoints: Array(ColumnIdentifiers.length).fill(false),
			reservedBonusPoints: Array(5).fill(false),
			reservedDiceIndices: [2,5],
			usingColorJoker: false,
			usingNumberJoker: false,
			remainingJokers: 10,
		};
	}

	componentDidMount() {
		this.updateAllowedNumbersAndColors();
		this.api.getEventApi().addEventHandler(S2CEvents.ON_GAME_STATE_UPDATE, this.onGameStateChangedEvent.bind(this));
		this.api.getEventApi().addEventHandler(S2CEvents.ON_GRID_CHANGED, this.onGridChangedEvent.bind(this));
	}

	componentWillUnmount() {
		this.api.getEventApi().removeEvent(S2CEvents.ON_GAME_STATE_UPDATE);
		this.api.getEventApi().removeEvent(S2CEvents.ON_GRID_CHANGED);
	}

	/*
		Server to client events
	 */
	onGameStateChangedEvent(eventData: EventDataObject): void {
		const {
			gameState,
			reservedDiceIndices,
			reservedBonusPoints,
			reservedColumnPoints,
			currentDiceValues,
			usingColorJoker,
			usingNumberJoker,
			activePlayerId,
			remainingJokers
		} = eventData as OnGameStateUpdateEventData;

		this.setState({
			gameState,
			reservedDiceIndices,
			reservedBonusPoints,
			reservedColumnPoints,
			currentDiceValues,
			usingColorJoker,
			usingNumberJoker,
			activePlayerId,
			remainingJokers
		}, this.updateAllowedNumbersAndColors.bind(this));
	}

	onGridChangedEvent(eventData: EventDataObject): void {
		const {newGrid} = eventData as OnGridChangedEventData;
		this.setState({
			grid: newGrid
		});
	}

	/*
		Locale Events and functions
	 */

	updateAllowedNumbersAndColors(): void {
		let dices = this.state.currentDiceValues;

		let allowedNumbers: number[] = [];
		for(let value of [dices[0], dices[1], dices[2]]) {
			if(value === 6 || allowedNumbers.indexOf(value) !== -1) {
				continue;
			}
			allowedNumbers.push(value);
		}

		let allowedColors: GridColorOptions[] = [];
		for(let value of [dices[3], dices[4], dices[5]]) {
			let colorValue = SelectableColors[value-1];
			if(value === 6 || allowedColors.indexOf(colorValue) !== -1) {
				continue;
			}
			allowedColors.push(colorValue);
		}

		this.setState({
			allowedNumbers: allowedNumbers,
			allowedColors: allowedColors
		});
	}

	onSelectionConfirmed(): void {
		// todo send selection to server
	}

	onJokerSelectionChanged(isNumber: boolean): void {
		this.setState({
			usingNumberJoker: this.state.usingNumberJoker || isNumber,
			usingColorJoker: this.state.usingColorJoker || !isNumber,
		})
		// todo request joker usage on server
	}

	onCellSelectionChanged(cells: Coordinate[], selectedColor?: GridColorOptions): void {
		if(!this.isPlayerActive()) {
			this.setState({
				currentSelection: cells
			});
			return;
		}

		const colorDiceIndex = this.state.currentDiceValues.indexOf(
			this.state.usingColorJoker ? 6 : (selectedColor ? SelectableColors.indexOf(selectedColor) : -1)
		);
		const numberDiceIndex = this.state.currentDiceValues.indexOf(
			this.state.usingNumberJoker ? 6 : cells.length
		);

		this.setState({
			currentSelection: cells,
			reservedDiceIndices: [colorDiceIndex, numberDiceIndex]
		});
	}

	isPlayerActive(): boolean {
		return this.state.activePlayerId === this.api.getPlayerApi().getLocalePlayer().getId();
	}

	isFittingSelection(): boolean {
		return this.state.allowedNumbers.includes(this.state.currentSelection.length);
	}

	render(): ReactNode {
		const isPlayerActive = this.isPlayerActive();
		const allowSelection =
			(this.state.gameState === GameStates.ACTIVE_PLAYER_SELECTS && isPlayerActive) ||
			(this.state.gameState === GameStates.PASSIVE_PLAYERS_SELECTS && !isPlayerActive)

		const canUseNumberJoker = !this.state.usingNumberJoker && this.state.currentDiceValues.find((el, i) =>
			i <= 2 && el === 6  && this.state.reservedDiceIndices.indexOf(i) === -1
		) !== undefined;

		const canUseColorJoker = !this.state.usingColorJoker && this.state.currentDiceValues.find((el, i) =>
			i > 2 && el === 6 && this.state.reservedDiceIndices.indexOf(i) === -1
		) !== undefined;

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
						reservedColumnPoints={this.state.reservedColumnPoints}
						allowSelection={allowSelection}
						allowedColors={this.state.usingColorJoker ? SelectableColors : this.state.allowedColors}
						allowedNumbers={this.state.usingNumberJoker ? [1,2,3,4,5] : this.state.allowedNumbers}
					/>

					<JokerList
						remainingJokers={this.state.remainingJokers}
						onJokerUse={this.onJokerSelectionChanged.bind(this)}
						usingColorJoker={this.state.usingColorJoker}
						usingNumberJoker={this.state.usingNumberJoker}
						canUseNumberJoker={canUseNumberJoker}
						canUseColorJoker={canUseColorJoker}
					/>

					{
						allowSelection ?
						<button
							className={'btn btn-primary '}
							onClick={this.onSelectionConfirmed.bind(this)}
							disabled={!this.isFittingSelection() && this.state.currentSelection.length !== 0}
						>
							{this.state.currentSelection.length !== 0 ? 'Bestätigen' : 'Runde überspringen'}
						</button> : null
					}
				</div>

				<ScoreBoard
					reservedBonusPoints={this.state.reservedBonusPoints}
					grid={this.state.grid}
				/>

				<DiceTable
					lastRollTimeStamp={-1}
					diceValues={this.state.currentDiceValues}
					diceSelections={[false,false,false,false,false,false].map((el, index) =>
						this.state.reservedDiceIndices.indexOf(index) !== -1
					)}
				/>
			</div>
		);
	}
}
