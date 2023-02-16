import React, { ReactNode } from 'react';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import yahtzee from './Yahtzee';
import Scoreboard from './components/Scoreboard';
import DiceTable from './components/DiceTable';
import {
	possibleGameStates,
	ScoreCellIDs,
	YahtzeeScoreboardType,
} from '@edelgames/types/src/modules/yahtzee/YTypes';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import {
	CellSelectedEventData,
	DiceChangedEventData,
	DiceSelectionChangedEventData,
	GameStateChangedEventData,
	RollRequestedEventData,
	ScoresChangedEventData,
	YahtzeeClientToServerEventNames,
	YahtzeeServerToClientEventNames,
} from '@edelgames/types/src/modules/yahtzee/YEvents';
import WinningScreen from './components/WinningScreen';

interface IState {
	gameState: possibleGameStates;
	activePlayerId: string | null;
	diceValues: number[];
	diceMask: boolean[];
	lastRollTimeStamp: number | string;
	remainingRolls: number;
	scoreboard: YahtzeeScoreboardType;
}

export default class YahtzeeGame
	extends React.Component<{}, IState>
	implements ModuleGameInterface
{
	private readonly api: ModuleApi;

	state = {
		gameState: possibleGameStates.STARTUP,
		activePlayerId: null,
		diceValues: [1, 1, 1, 1, 1],
		diceMask: [false, false, false, false],
		remainingRolls: 0,
		scoreboard: [],
		lastRollTimeStamp: -1,
	};

	constructor(props: {}) {
		super(props);
		this.api = new ModuleApi(yahtzee, this);
	}

	componentDidMount() {
		this.api
			.getEventApi()
			.addEventHandler(
				YahtzeeServerToClientEventNames.GAME_STATE_CHANGED,
				this.onGameStateChanged.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				YahtzeeServerToClientEventNames.DICES_CHANGED,
				this.onDicesChanged.bind(this)
			);
		this.api
			.getEventApi()
			.addEventHandler(
				YahtzeeServerToClientEventNames.SCORES_CHANGED,
				this.onScoresChanged.bind(this)
			);
	}

	componentWillUnmount() {}

	/*
        Remote Events
    */

	onGameStateChanged(eventData: EventDataObject): void {
		let { gameState, activePlayerId } = eventData as GameStateChangedEventData;
		this.setState({
			gameState,
			activePlayerId,
		});
	}

	onDicesChanged(eventData: EventDataObject): void {
		let { diceValues, diceMask, remainingRolls, hasRolledDice } =
			eventData as DiceChangedEventData;

		this.setState({
			diceValues,
			diceMask,
			remainingRolls,
			lastRollTimeStamp: hasRolledDice
				? Date.now()
				: this.state.lastRollTimeStamp,
		});
	}

	onScoresChanged(eventData: EventDataObject): void {
		let { scoreboard } = eventData as ScoresChangedEventData;
		this.setState({
			scoreboard,
		});
	}

	/*
        Locale Events
     */

	onCellClicked(cellId: ScoreCellIDs): void {
		let eventData: CellSelectedEventData = {
			selectedCellId: cellId,
		};

		this.api
			.getEventApi()
			.sendMessageToServer(
				YahtzeeClientToServerEventNames.CELL_SELECTED,
				eventData
			);
	}

	onDiceRollRequested(diceSelection: boolean[]): void {
		let eventData: RollRequestedEventData = {
			selectedDice: diceSelection,
		};

		this.api
			.getEventApi()
			.sendMessageToServer(
				YahtzeeClientToServerEventNames.ROLL_REQUESTED,
				eventData
			);
	}

	onDiceSelectionChanged(newDiceSelection: boolean[]): void {
		let eventData: DiceSelectionChangedEventData = {
			selectedDice: newDiceSelection,
		};

		this.api
			.getEventApi()
			.sendMessageToServer(
				YahtzeeClientToServerEventNames.DICE_SELECTION_CHANGED,
				eventData
			);
	}

	render(): ReactNode {
		let activePlayerId = this.state.activePlayerId;
		const playerApi = this.api.getPlayerApi();
		let isLocalePlayerActive =
			playerApi.getLocalePlayer().getId() === activePlayerId;

		return (
			<div id={'yahtzee'}>
				<Scoreboard
					scoreboard={this.state.scoreboard}
					playerApi={playerApi}
					activePlayerId={activePlayerId}
					onCellClicked={this.onCellClicked.bind(this)}
					currentDiceValues={this.state.diceValues}
					remainingRolls={this.state.remainingRolls}
				/>
				{this.state.gameState !== possibleGameStates.ENDING_SCORE ? (
					<DiceTable
						api={this.api}
						isLocalPlayerActive={isLocalePlayerActive}
						diceValues={this.state.diceValues}
						onDiceRollClicked={this.onDiceRollRequested.bind(this)}
						onSelectedDiceChanged={this.onDiceSelectionChanged.bind(this)}
						remainingRolls={this.state.remainingRolls}
						remoteSelectedDice={this.state.diceMask}
						lastRollTimeStamp={this.state.lastRollTimeStamp}
					/>
				) : (
					<WinningScreen
						playerApi={this.api.getPlayerApi()}
						winnerId={this.state.activePlayerId}
					/>
				)}
			</div>
		);
	}
}
