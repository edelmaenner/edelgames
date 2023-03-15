import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import User from '../../framework/User';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import {
	ColorGrid,
	ColorGridCell,
	ColorGridCollection,
	ColorGridColumn,
	ColorGridDefinition,
	Coordinate,
	GameStates,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import {
	C2SEvents,
	OnGameStateUpdateEventData,
	OnGridChangedEventData,
	OnJokerRequestedEventData,
	OnPlayerStateUpdateEventData,
	OnSelectionMadeEventData,
	S2CEvents,
} from '@edelgames/types/src/modules/colorChecker/CCEvents';
import { defaultGrid } from './gridTemplates/default';

/*
 * The actual game instance, that controls and manages the game
 */
export default class ColorCheckerGame implements ModuleGameInterface {
	// technical properties
	api: ModuleApi = null;
	playerIndex = 0;
	activePlayerId: string;
	playerGrids: ColorGridCollection;
	diceValues: number[] = [1, 1, 1, 1, 1, 1];
	reservedNumberDiceIndex: number;
	reservedColorDiceIndex: number;
	gameState: GameStates = GameStates.INIT;
	columnOwners: (string | undefined)[] = Array(15).fill(undefined);
	bonusOwners: (string | undefined)[] = Array(5).fill(undefined);
	playersReady: string[] = [];

	onGameInitialize(api: ModuleApi): void {
		this.api = api;
		this.initPlayerGrids();
		const eventApi = this.api.getEventApi();
		eventApi.addUserLeaveHandler(this.onPlayerLeft.bind(this));
		eventApi.addEventHandler(
			C2SEvents.ON_SELECTION_MADE,
			this.onPlayerSelectionMadeEvent.bind(this)
		);
		eventApi.addEventHandler(
			C2SEvents.ON_JOKER_REQUESTED,
			this.onPlayerRequestedJokerEvent.bind(this)
		);

		this.startNewRound(false);
	}

	onPlayerSelectionMadeEvent(event: EventDataObject): void {
		const { senderId } = event;
		const { cells } = event as OnSelectionMadeEventData;
		const playerData = this.playerGrids.find((el) => el.playerId === senderId);

		if (this.playersReady.indexOf(senderId) !== -1 || !playerData) {
			return; // this player has already made a selection or could not be found
		}

		const isActivePlayerPlaying =
			this.gameState === GameStates.ACTIVE_PLAYER_SELECTS &&
			this.activePlayerId === playerData.playerId;
		const isPassivePlayerPlaying =
			this.gameState === GameStates.PASSIVE_PLAYERS_SELECTS &&
			this.activePlayerId !== playerData.playerId;
		if (!isActivePlayerPlaying && !isPassivePlayerPlaying) {
			return; // somehow a player did a move, but was not supposed to
		}

		if (
			this.validatePlayerSelection(
				cells,
				playerData.grid,
				playerData.isUsingNumberJoker,
				playerData.isUsingColorJoker
			)
		) {
			let selectedColor: GridColorOptions | '#fff' = '#fff';
			for (const cell of cells) {
				console.log('writing to grid of player ', playerData.playerName);
				playerData.grid[cell.x][cell.y].checked = true;
				selectedColor = playerData.grid[cell.x][cell.y].color;
			}
			this.playersReady.push(senderId);

			if (selectedColor !== '#fff' && cells.length > 0) {
				this.checkColorForCompletion(selectedColor, playerData);
				const checkedColumns: number[] = [];
				for (const cell of cells) {
					if (!checkedColumns.includes(cell.x)) {
						checkedColumns.push(cell.x);
						this.checkColumnForCompletion(cell.x, playerData);
					}
				}
			}
			this.updateClientPlayerGrid(playerData.playerId, playerData.grid);
			this.updateClientPlayerState(playerData.playerId);

			if (
				this.playersReady.length >=
				this.api.getPlayerApi().getRoomMembers().length
			) {
				// this was probably a passive or a single player. If all of them made their turn, start the next round
				this.startNewRound();
			} else if (isActivePlayerPlaying) {
				// this was the first player, now the others can make their turn, but without the selected dices

				const usedNumberValue = playerData.isUsingNumberJoker
					? 6
					: cells.length;
				const usedColorValue =
					playerData.isUsingColorJoker || selectedColor === '#fff'
						? 6
						: SelectableColors.indexOf(selectedColor) + 1;
				this.reservedNumberDiceIndex = this.diceValues
					.slice(0, 3)
					.indexOf(usedNumberValue);
				this.reservedColorDiceIndex = this.diceValues.indexOf(
					usedColorValue,
					3
				);

				this.gameState = GameStates.PASSIVE_PLAYERS_SELECTS;
				this.updateClientGameStates();
			}
		} else {
			this.api
				.getEventApi()
				.sendPlayerBubble(senderId, 'Ungültige Auswahl!', 'error');
		}
	}

	onPlayerRequestedJokerEvent(event: EventDataObject): void {
		const { senderId } = event;
		const { type } = event as OnJokerRequestedEventData;
		const playerData = this.playerGrids.find((el) => el.playerId === senderId);

		if (this.playersReady.indexOf(senderId) !== -1 || !playerData) {
			return; // this player has already made a selection, is not found or has no jokers remaining
		}

		if (playerData.remainingJokers <= 0) {
			this.api
				.getEventApi()
				.sendPlayerBubble(
					playerData.playerId,
					'Du hast keine Joker mehr übrig!',
					'warning'
				);
			return;
		}

		if (
			type === 'color' &&
			!playerData.isUsingColorJoker &&
			this.canUserUseColorDice(6)
		) {
			playerData.isUsingColorJoker = true;
			playerData.remainingJokers--;
			this.updateClientPlayerState(playerData.playerId);
		} else if (
			type === 'number' &&
			!playerData.isUsingNumberJoker &&
			this.canUserUseNumberDice(6)
		) {
			playerData.isUsingNumberJoker = true;
			playerData.remainingJokers--;
			this.updateClientPlayerState(playerData.playerId);
		} else {
			this.api
				.getEventApi()
				.sendPlayerBubble(
					playerData.playerId,
					'Du kannst diesen Joker nicht benutzen',
					'warning'
				);
		}
	}

	checkColorForCompletion(
		color: GridColorOptions,
		playerData: ColorGridDefinition
	): void {
		const colorIndex = SelectableColors.indexOf(color);
		let isComplete = true;

		for (const row of playerData.grid) {
			for (const cell of row) {
				if (cell.color === color && !cell.checked) {
					isComplete = false;
					break;
				}
			}
			if (!isComplete) {
				break;
			}
		}

		if (isComplete) {
			playerData.finishedColors[colorIndex] = true;
			if (!this.bonusOwners[colorIndex]) {
				this.bonusOwners[colorIndex] = playerData.playerId;
			}
		}
	}

	checkColumnForCompletion(x: number, playerData: ColorGridDefinition): void {
		let isComplete = true;
		for (const cell of playerData.grid[x]) {
			if (!cell.checked) {
				isComplete = false;
				break;
			}
		}

		if (isComplete) {
			playerData.finishedColumns[x] = true;
			if (!this.columnOwners[x]) {
				this.columnOwners[x] = playerData.playerId;
			}
		}
	}

	canUserUseNumberDice(num: number): boolean {
		return (
			(this.diceValues[0] === num && this.reservedNumberDiceIndex !== 0) ||
			(this.diceValues[1] === num && this.reservedNumberDiceIndex !== 1) ||
			(this.diceValues[2] === num && this.reservedNumberDiceIndex !== 2)
		);
	}

	canUserUseColorDice(col: number): boolean {
		return (
			(this.diceValues[3] === col && this.reservedColorDiceIndex !== 3) ||
			(this.diceValues[4] === col && this.reservedColorDiceIndex !== 4) ||
			(this.diceValues[5] === col && this.reservedColorDiceIndex !== 5)
		);
	}

	validatePlayerSelection(
		selection: Coordinate[],
		grid: ColorGrid,
		isUsingNumberJoker: boolean,
		isUsingColorJoker: boolean
	): boolean {
		const selectionToCheck = [...selection];
		const validSelectedFields: Coordinate[] = [];

		if (selection.length === 0) {
			return true; // the user can always skip
		}

		// check, if the user can select this number and color
		const selectedColor = grid[selection[0].x][selection[0].y].color;
		if (selection.length > 5) {
			return false;
		}

		if (
			selectedColor === '#fff' ||
			!this.canUserUseNumberDice(isUsingNumberJoker ? 6 : selection.length) ||
			!this.canUserUseColorDice(
				isUsingColorJoker ? 6 : SelectableColors.indexOf(selectedColor) + 1
			)
		) {
			return false;
		}

		// check if all fields have the same color
		for (const pos of selection) {
			if (grid[pos.x][pos.y].color !== selectedColor) {
				return false;
			}
		}

		let continueCheck = true;
		while (continueCheck) {
			continueCheck = false;

			// try to find a valid selection
			for (let i = 0; i < selectionToCheck.length; i++) {
				const pos = selectionToCheck[i];
				let isValid = false;
				if (validSelectedFields.length === 0) {
					// start by searching a cell next to a checked field or the start column
					isValid = pos.x === 7 || this.doesCellHasCheckedNeighbour(pos, grid);
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

	getCellFromGrid(x: number, y: number, grid: ColorGrid): ColorGridCell {
		if (x >= 0 && y >= 0 && x < grid.length && y < grid[0].length) {
			return grid[x][y];
		}
		return EmptyCell;
	}

	doesCellHasCheckedNeighbour(pos: Coordinate, grid: ColorGrid): boolean {
		return (
			this.getCellFromGrid(pos.x - 1, pos.y, grid).checked ||
			this.getCellFromGrid(pos.x + 1, pos.y, grid).checked ||
			this.getCellFromGrid(pos.x, pos.y - 1, grid).checked ||
			this.getCellFromGrid(pos.x, pos.y + 1, grid).checked
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

	initPlayerGrids(): void {
		const grids: ColorGridCollection = [];

		for (const member of this.api.getPlayerApi().getRoomMembers()) {
			const newGrid: ColorGrid = this.createNewGrid();
			const newCollection = {
				playerId: member.getId(),
				playerName: member.getUsername(),
				grid: newGrid,
				remainingJokers: 10,
				isUsingColorJoker: false,
				isUsingNumberJoker: false,
				finishedColors: Array(SelectableColors.length).fill(false),
				finishedColumns: Array(newGrid.length).fill(false),
			};
			grids.push(newCollection);

			this.updateClientPlayerGrid(member.getId(), newGrid);
		}
		this.playerGrids = grids;
	}

	createNewGrid(): ColorGrid {
		const templateGrid = defaultGrid;

		const grid: ColorGrid = [];
		for (let x = 0; x < templateGrid.length; x++) {
			const column: ColorGridColumn = [];
			for (let y = 0; y < templateGrid[0].length; y++) {
				const templateCell = templateGrid[x][y];
				column.push({
					color: templateCell.color,
					checked: templateCell.checked,
					isSpecial: templateCell.isSpecial,
				});
			}
			grid.push(column);
		}

		return grid;
	}

	updateClientPlayerGrid(playerId: string, grid: ColorGrid): void {
		const newGridData: OnGridChangedEventData = {
			newGrid: grid,
		};
		// notify player
		console.log('update grid of player', playerId);
		this.api
			.getEventApi()
			.sendPlayerMessage(playerId, S2CEvents.ON_GRID_CHANGED, newGridData);
	}

	startNewRound(advancePlayer = true): void {
		if (this.isGameFinished()) {
			this.initiateEndGame();
			return;
		}

		const roomMembers = this.api.getPlayerApi().getRoomMembers();
		if (advancePlayer) {
			this.playerIndex++;
		}
		this.activePlayerId =
			roomMembers[this.playerIndex % roomMembers.length].getId();

		// roll dices
		this.diceValues[0] = this.getRandomDiceValue();
		this.diceValues[1] = this.getRandomDiceValue();
		this.diceValues[2] = this.getRandomDiceValue();
		this.diceValues[3] = this.getRandomDiceValue();
		this.diceValues[4] = this.getRandomDiceValue();
		this.diceValues[5] = this.getRandomDiceValue();

		this.resetPlayerJokerUsage();
		this.reservedColorDiceIndex = -1;
		this.reservedNumberDiceIndex = -1;
		this.gameState = GameStates.ACTIVE_PLAYER_SELECTS;
		this.updateClientGameStates();
		this.playersReady = [];

		for (const member of roomMembers) {
			this.updateClientPlayerState(member.getId());
		}
	}

	/*
		The game is finished, if one player has at least two colors fully checked
	 */
	isGameFinished(): boolean {
		for (const playerData of this.playerGrids) {
			const finishedColors = playerData.finishedColors.filter(
				(el) => el
			).length;
			if (finishedColors >= 2) {
				return true;
			}
		}
		return false;
	}

	initiateEndGame(): void {
		this.gameState = GameStates.ENDING_SCREEN;
		const points = [];
		this.updateClientGameStates();
		this.api.getEventApi();
	}

	resetPlayerJokerUsage(): void {
		for (const grid of this.playerGrids) {
			grid.isUsingNumberJoker = false;
			grid.isUsingColorJoker = false;
		}
	}

	updateClientPlayerState(playerId: string): void {
		const playerData = this.playerGrids.find((el) => el.playerId === playerId);
		if (!playerData) {
			return;
		}

		const eventData: OnPlayerStateUpdateEventData = {
			usingNumberJoker: playerData.isUsingNumberJoker,
			usingColorJoker: playerData.isUsingColorJoker,
			remainingJokers: playerData.remainingJokers,
			isPlayerWaiting: this.playersReady.indexOf(playerId) !== -1,
			finishedColors: playerData.finishedColors,
			finishedColumns: playerData.finishedColumns,
		};
		this.api
			.getEventApi()
			.sendPlayerMessage(playerId, S2CEvents.ON_PLAYER_STATE_UPDATE, eventData);
	}

	updateClientGameStates(): void {
		const eventData: OnGameStateUpdateEventData = {
			gameState: this.gameState,
			activePlayerId: this.activePlayerId,
			reservedColumnPoints: this.columnOwners,
			currentDiceValues: this.diceValues,
			reservedBonusPoints: this.bonusOwners,
			reservedDiceIndices: [
				this.reservedNumberDiceIndex,
				this.reservedColorDiceIndex,
			],
		};
		this.api
			.getEventApi()
			.sendRoomMessage(S2CEvents.ON_GAME_STATE_UPDATE, eventData);
	}

	onPlayerLeft(eventData: EventDataObject): void {
		const removedUser = eventData.removedUser as User;

		const wasActivePlayer = removedUser.getId() === this.activePlayerId;
		// remove player from list
		this.playersReady.filter((player) => player !== removedUser.getId());

		if (
			wasActivePlayer &&
			this.gameState === GameStates.ACTIVE_PLAYER_SELECTS
		) {
			// we need a new active player
			this.startNewRound(false);
		} else if (
			wasActivePlayer &&
			this.gameState === GameStates.PASSIVE_PLAYERS_SELECTS
		) {
			// do nothing, let the players finish this round
		} else if (
			!wasActivePlayer &&
			this.gameState === GameStates.ACTIVE_PLAYER_SELECTS
		) {
			// do nothing, let the players finish this round
		} else if (
			!wasActivePlayer &&
			this.gameState === GameStates.PASSIVE_PLAYERS_SELECTS &&
			this.playersReady.length >=
				this.api.getPlayerApi().getRoomMembers().length
		) {
			// seems like all other players have already finished
			this.startNewRound(true);
		}

		this.api
			.getPlayerApi()
			.sendRoomBubble(removedUser.getUsername() + ' left the game', 'error');
	}

	getRandomDiceValue(min = 1, max = 6) {
		const range = max - min;
		return min + Math.floor(Math.random() * (range + 1));
	}
}

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
