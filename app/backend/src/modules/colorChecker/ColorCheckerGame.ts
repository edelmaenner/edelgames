import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import User from '../../framework/User';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import {
	ColorGrid,
	ColorGridCollection,
	Coordinate,
	defaultGrid,
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

		if (this.validatePlayerSelection(cells, playerData.grid)) {
			let selectedColor: GridColorOptions | '#fff';
			for (const cell of cells) {
				playerData.grid[cell.x][cell.y].checked = true;
				selectedColor = playerData.grid[cell.x][cell.y].color;
			}
			this.playersReady.push(senderId);
			this.updateClientPlayerState(playerData.playerId);

			if (
				this.activePlayerId === playerData.playerId &&
				this.gameState === GameStates.ACTIVE_PLAYER_SELECTS
			) {
				// this was the first player, now the others can make their turn, but without the selected dices

				const usedNumberValue = playerData.isUsingNumberJoker
					? 6
					: cells.length;
				const usedColorValue =
					playerData.isUsingColorJoker || selectedColor === '#fff'
						? 6
						: SelectableColors.indexOf(selectedColor);
				this.reservedNumberDiceIndex = this.diceValues.indexOf(usedNumberValue);
				this.reservedColorDiceIndex = this.diceValues.indexOf(usedColorValue);

				this.gameState = GameStates.PASSIVE_PLAYERS_SELECTS;
				this.updateClientGameStates();
			} else if (
				this.playersReady.length ===
				this.api.getPlayerApi().getRoomMembers().length
			) {
				// this was a passive player. If all of them made their turn, start the next round
				this.startNewRound();
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

		if (
			this.playersReady.indexOf(senderId) !== -1 ||
			!playerData ||
			playerData.remainingJokers <= 0
		) {
			return; // this player has already made a selection, is not found or has no jokers remaining
		}

		if (
			type === 'color' &&
			!playerData.isUsingColorJoker &&
			this.canUserUseNumberDice(6)
		) {
			playerData.isUsingColorJoker = true;
			playerData.remainingJokers--;
			this.updateClientPlayerState(playerData.playerId);
		} else if (
			type === 'number' &&
			!playerData.isUsingNumberJoker &&
			this.canUserUseColorDice(6)
		) {
			playerData.isUsingNumberJoker = true;
			playerData.remainingJokers--;
			this.updateClientPlayerState(playerData.playerId);
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
			(this.diceValues[3] === col && this.reservedNumberDiceIndex !== 3) ||
			(this.diceValues[4] === col && this.reservedNumberDiceIndex !== 4) ||
			(this.diceValues[5] === col && this.reservedNumberDiceIndex !== 5)
		);
	}

	validatePlayerSelection(selection: Coordinate[], grid: ColorGrid): boolean {
		const selectionToCheck = [...selection];
		const validSelectedFields: Coordinate[] = [];

		if (selection.length === 0) {
			return true; // the user can always skip
		}

		// check, if the user can select this number and color
		const selectedColor = grid[selection[0].x][selection[0].y].color;
		if (
			selectedColor === '#fff' ||
			!this.canUserUseNumberDice(selection.length) ||
			!this.canUserUseColorDice(SelectableColors.indexOf(selectedColor) + 1)
		) {
			return false;
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

	doesCellHasCheckedNeighbour(pos: Coordinate, grid: ColorGrid): boolean {
		return (
			grid[pos.x - 1][pos.y].checked ||
			grid[pos.x + 1][pos.y].checked ||
			grid[pos.x][pos.y - 1].checked ||
			grid[pos.x][pos.y + 1].checked
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
			const newGridData: OnGridChangedEventData = {
				newGrid: [...defaultGrid],
			};
			grids.push({
				playerId: member.getId(),
				playerName: member.getUsername(),
				grid: newGridData.newGrid,
				remainingJokers: 10,
				isUsingColorJoker: false,
				isUsingNumberJoker: false,
			});

			// notify player
			this.api
				.getEventApi()
				.sendPlayerMessage(
					member.getId(),
					S2CEvents.ON_GRID_CHANGED,
					newGridData
				);
		}
		this.playerGrids = grids;
	}

	startNewRound(advancePlayer = true): void {
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
		this.gameState = GameStates.ACTIVE_PLAYER_SELECTS;
		this.updateClientGameStates();
		this.playersReady = [];

		for (const member of roomMembers) {
			this.updateClientPlayerState(member.getId());
		}
	}

	resetPlayerJokerUsage(): void {
		for (const grid of this.playerGrids) {
			grid.isUsingNumberJoker = false;
			grid.isUsingNumberJoker = false;
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
		};
		this.api
			.getEventApi()
			.sendPlayerMessage(playerId, S2CEvents.ON_PLAYER_STATE_UPDATE, eventData);
	}

	updateClientGameStates(): void {
		const eventData: OnGameStateUpdateEventData = {
			gameState: this.gameState,
			activePlayerId: this.activePlayerId,
			reservedColumnPoints: this.columnOwners.map((el) => !!el),
			currentDiceValues: this.diceValues,
			reservedBonusPoints: this.bonusOwners.map((el) => !!el),
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

		if (
			removedUser.getId() === this.activePlayerId &&
			this.playersReady.indexOf(removedUser.getId()) === -1
		) {
			// we need a new active player
			this.startNewRound(false);
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
