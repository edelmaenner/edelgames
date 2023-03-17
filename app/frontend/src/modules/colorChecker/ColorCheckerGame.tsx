import React, { ReactNode } from 'react';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import colorChecker from './ColorChecker';
import DiceTable from './components/DiceTable';
import ColorGridBox, {
	ColumnIdentifiers,
	EmptyGrid,
	SelectableColors,
} from './components/ColorGridBox';
import {
	ColorGrid,
	Coordinate,
	GameStates,
	GridColorOptions,
	GridScoreboard,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import JokerList from './components/JokerList';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import ScoreBoard from './components/ScoreBoard';
import {
	C2SEvents,
	OnGameStateUpdateEventData,
	OnGridChangedEventData,
	OnJokerRequestedEventData,
	OnPlayerStateUpdateEventData, OnRemainingPlayersChangedEventData,
	OnScoresCalculatedEventData,
	OnSelectionMadeEventData,
	S2CEvents,
} from '@edelgames/types/src/modules/colorChecker/CCEvents';
import WinningScreen from './components/WinningScreen';

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
	isPlayerWaiting: boolean;
	finishedColors: boolean[];
	finishedColumns: boolean[];
	remainingPlayers: number;
	lastRollTimestamp: number;
	scoreboard: GridScoreboard | undefined;
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
			currentDiceValues: [6, 5, 4, 3, 2, 1],
			allowedNumbers: [],
			allowedColors: [],
			reservedColumnPoints: Array(ColumnIdentifiers.length).fill(false),
			reservedBonusPoints: Array(5).fill(false),
			reservedDiceIndices: [2, 5],
			usingColorJoker: false,
			usingNumberJoker: false,
			remainingJokers: 10,
			isPlayerWaiting: false,
			finishedColumns: Array(15).fill(false),
			finishedColors: Array(5).fill(false),
			remainingPlayers: 0,
			scoreboard: undefined,
			lastRollTimestamp: -1,
		};
	}

	componentDidMount() {
		this.updateAllowedNumbersAndColors();
		this.api
			.getEventApi()
			.addEventHandler(
				S2CEvents.ON_GAME_STATE_UPDATE,
				this.onGameStateChangedEvent.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				S2CEvents.ON_GRID_CHANGED,
				this.onGridChangedEvent.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				S2CEvents.ON_PLAYER_STATE_UPDATE,
				this.onPlayerStateChangedEvent.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				S2CEvents.ON_SCORES_CALCULATED,
				this.onScoresCalculatedEvent.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				S2CEvents.ON_REMAINING_PLAYERS_CHANGED,
				this.onRemainingPlayersChangedEvent.bind(this)
			);
	}

	componentWillUnmount() {
		this.api.getEventApi().removeEvent(S2CEvents.ON_GRID_CHANGED);
		this.api.getEventApi().removeEvent(S2CEvents.ON_PLAYER_STATE_UPDATE);
		this.api.getEventApi().removeEvent(S2CEvents.ON_GAME_STATE_UPDATE);
		this.api.getEventApi().removeEvent(S2CEvents.ON_SCORES_CALCULATED);
	}

	/*
		Server to client events
	 */
	onScoresCalculatedEvent(eventData: EventDataObject): void {
		const { points } = eventData as OnScoresCalculatedEventData;
		this.setState({
			scoreboard: points,
		});
	}

	onRemainingPlayersChangedEvent(eventData: EventDataObject): void {
		const {remainingPlayers} = eventData as OnRemainingPlayersChangedEventData;
		this.setState({
			remainingPlayers: remainingPlayers
		})
	}

	onPlayerStateChangedEvent(eventData: EventDataObject): void {
		const {
			usingColorJoker,
			usingNumberJoker,
			remainingJokers,
			isPlayerWaiting,
			finishedColors,
			finishedColumns,
		} = eventData as OnPlayerStateUpdateEventData;

		this.setState({
			usingColorJoker,
			usingNumberJoker,
			remainingJokers,
			isPlayerWaiting,
			finishedColors,
			finishedColumns,
		});
	}

	onGameStateChangedEvent(eventData: EventDataObject): void {
		const {
			gameState,
			reservedDiceIndices,
			reservedBonusPoints,
			reservedColumnPoints,
			currentDiceValues,
			activePlayerId,
			remainingPlayers,
			lastRollTimestamp,
		} = eventData as OnGameStateUpdateEventData;

		const localePlayerId = this.api.getPlayerApi().getLocalePlayer().getId();
		this.setState(
			{
				gameState: gameState,
				reservedDiceIndices: reservedDiceIndices,
				reservedBonusPoints: reservedBonusPoints.map(
					(player) => !!(player && player !== localePlayerId)
				),
				reservedColumnPoints: reservedColumnPoints.map(
					(player) => !!(player && player !== localePlayerId)
				),
				currentDiceValues: currentDiceValues,
				activePlayerId: activePlayerId,
				remainingPlayers: remainingPlayers,
				lastRollTimestamp: lastRollTimestamp,
			},
			this.updateAllowedNumbersAndColors.bind(this)
		);
	}

	onGridChangedEvent(eventData: EventDataObject): void {
		const { newGrid } = eventData as OnGridChangedEventData;
		this.api.getEventApi().alertEvent('clearGridSelection');
		this.setState({
			grid: newGrid,
			currentSelection: [],
		});
	}

	/*
		Locale Events and functions
	 */

	updateAllowedNumbersAndColors(): void {
		let dices = this.state.currentDiceValues;

		let allowedNumbers: number[] = [];
		for (let i = 0; i < 3; i++) {
			let value = dices[i];
			if (
				value === 6 ||
				this.state.reservedDiceIndices[0] === i ||
				allowedNumbers.indexOf(value) !== -1
			) {
				continue;
			}
			allowedNumbers.push(value);
		}

		let allowedColors: GridColorOptions[] = [];
		for (let i = 3; i < 6; i++) {
			let value = dices[i];
			let colorValue = SelectableColors[value - 1];
			if (
				value === 6 ||
				this.state.reservedDiceIndices[1] === i ||
				allowedColors.indexOf(colorValue) !== -1
			) {
				continue;
			}
			allowedColors.push(colorValue);
		}

		this.setState({
			allowedNumbers: allowedNumbers,
			allowedColors: allowedColors,
		});
	}

	onSelectionConfirmed(): void {
		if (
			(this.isPlayerActive() &&
				this.state.gameState === GameStates.ACTIVE_PLAYER_SELECTS) ||
			(!this.isPlayerActive() &&
				this.state.gameState === GameStates.PASSIVE_PLAYERS_SELECTS)
		) {
			const eventData: OnSelectionMadeEventData = {
				cells: this.state.currentSelection,
			};
			this.api
				.getEventApi()
				.sendMessageToServer(C2SEvents.ON_SELECTION_MADE, eventData);
		}
	}

	onJokerSelectionChanged(isNumber: boolean): void {
		if (
			(isNumber && !this.state.usingNumberJoker) ||
			(!isNumber && !this.state.usingColorJoker)
		) {
			const eventData: OnJokerRequestedEventData = {
				type: isNumber ? 'number' : 'color',
			};
			this.api
				.getEventApi()
				.sendMessageToServer(C2SEvents.ON_JOKER_REQUESTED, eventData);
		}
	}

	onCellSelectionChanged(
		cells: Coordinate[],
		selectedColor?: GridColorOptions
	): void {
		if (!this.isPlayerActive()) {
			this.setState({
				currentSelection: cells,
			});
			return;
		}

		const colorDiceIndex = this.state.currentDiceValues.indexOf(
			this.state.usingColorJoker
				? 6
				: selectedColor
				? SelectableColors.indexOf(selectedColor) + 1
				: -1,
			3
		);

		const numberDiceIndex = this.state.currentDiceValues
			.slice(0, 3)
			.indexOf(this.state.usingNumberJoker ? 6 : cells.length);

		this.setState({
			currentSelection: cells,
			reservedDiceIndices: [colorDiceIndex, numberDiceIndex],
		});
	}

	isPlayerActive(): boolean {
		return (
			this.state.activePlayerId ===
			this.api.getPlayerApi().getLocalePlayer().getId()
		);
	}

	isFittingSelection(): boolean {
		return (
			this.state.currentSelection.length === 0 ||
			(this.state.allowedNumbers.includes(this.state.currentSelection.length) &&
				this.state.currentSelection.length < 6) ||
			this.state.usingNumberJoker
		);
	}

	render(): ReactNode {
		if (
			this.state.gameState === GameStates.ENDING_SCREEN &&
			this.state.scoreboard !== undefined
		) {
			return (
				<div id={'colorChecker'}>
					<WinningScreen
						scoreboard={this.state.scoreboard}
						playerApi={this.api.getPlayerApi()}
					/>
				</div>
			);
		}

		const isPlayerActive = this.isPlayerActive();
		const allowSelection =
			!this.state.isPlayerWaiting &&
			((this.state.gameState === GameStates.ACTIVE_PLAYER_SELECTS &&
				isPlayerActive) ||
				(this.state.gameState === GameStates.PASSIVE_PLAYERS_SELECTS &&
					!isPlayerActive));

		const canUseNumberJoker =
			!this.state.usingNumberJoker &&
			this.state.currentDiceValues.find(
				(el, i) =>
					i <= 2 && el === 6 && this.state.reservedDiceIndices.indexOf(i) === -1
			) !== undefined;

		const canUseColorJoker =
			!this.state.usingColorJoker &&
			this.state.currentDiceValues.find(
				(el, i) =>
					i > 2 && el === 6 && this.state.reservedDiceIndices.indexOf(i) === -1
			) !== undefined;

		const activePlayerName =
			(this.state.activePlayerId
				? this.api
						.getPlayerApi()
						.getPlayerById(this.state.activePlayerId)
						?.getUsername()
				: '') || '';

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
						finishedColumns={this.state.finishedColumns}
						allowSelection={allowSelection}
						allowedColors={
							this.state.usingColorJoker
								? SelectableColors
								: this.state.allowedColors
						}
						allowedNumbers={
							this.state.usingNumberJoker
								? [1, 2, 3, 4, 5]
								: this.state.allowedNumbers
						}
						eventApi={this.api.getEventApi()}
					/>

					<JokerList
						remainingJokers={this.state.remainingJokers}
						onJokerUse={this.onJokerSelectionChanged.bind(this)}
						usingColorJoker={this.state.usingColorJoker}
						usingNumberJoker={this.state.usingNumberJoker}
						canUseNumberJoker={canUseNumberJoker}
						canUseColorJoker={canUseColorJoker}
					/>

					{allowSelection ? (
						<button
							className={'btn btn-primary '}
							onClick={this.onSelectionConfirmed.bind(this)}
							disabled={!this.isFittingSelection()}
						>
							{this.state.currentSelection.length !== 0
								? 'Bestätigen'
								: 'Runde überspringen'}
						</button>
					) : null}
				</div>

				<ScoreBoard
					reservedBonusPoints={this.state.reservedBonusPoints}
					finishedColors={this.state.finishedColors}
					grid={this.state.grid}
					gameState={this.state.gameState}
					remainingPlayers={this.state.remainingPlayers}
					activePlayerName={activePlayerName}
				/>

				<DiceTable
					lastRollTimeStamp={this.state.lastRollTimestamp}
					diceValues={this.state.currentDiceValues}
					diceSelections={[false, false, false, false, false, false].map(
						(el, index) => this.state.reservedDiceIndices.indexOf(index) !== -1
					)}
				/>
			</div>
		);
	}
}
