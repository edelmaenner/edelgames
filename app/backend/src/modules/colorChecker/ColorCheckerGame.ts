import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import User from '../../framework/User';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import {
	ColorGrid,
	GameStates,
	GridColorOptions,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import {
	C2SEvents,
	OnGameStateUpdateEventData,
	OnGridChangedEventData,
	OnJokerRequestedEventData,
	OnPlayerStateUpdateEventData,
	OnScoresCalculatedEventData,
	OnSelectionMadeEventData,
	S2CEvents,
} from '@edelgames/types/src/modules/colorChecker/CCEvents';
import { defaultGrid } from './gridTemplates/default';
import GridHelper from './helper/GridHelper';
import PlayerHelper from './helper/PlayerHelper';
import DiceHelper from './helper/DiceHelper';

/*
 * The actual game instance, that controls and manages the game
 */
export default class ColorCheckerGame implements ModuleGameInterface {
	// technical properties
	api: ModuleApi = null;
	playerIndex = 0;
	activePlayerId: string;
	gameState: GameStates = GameStates.INIT;
	columnOwners: (string | undefined)[] = Array(15).fill(undefined);
	bonusOwners: (string | undefined)[] = Array(5).fill(undefined);

	playerHelper = new PlayerHelper();
	diceHelper = new DiceHelper();

	onGameInitialize(api: ModuleApi): void {
		this.api = api;

		for (const member of this.api.getPlayerApi().getRoomMembers()) {
			const newPlayer = this.playerHelper.initiateNewPlayer(
				member,
				defaultGrid
			);
			this.updateClientPlayerGrid(member.getId(), newPlayer.grid);
		}

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
		const playerData = this.playerHelper.getDataByPlayerId(senderId);

		if (!playerData || this.playerHelper.isPlayerReady(senderId)) {
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
			GridHelper.isSelectionValid(
				cells,
				playerData.grid,
				playerData.isUsingNumberJoker,
				playerData.isUsingColorJoker,
				this.diceHelper
			)
		) {
			const selectedColor =
				cells.length <= 0
					? GridColorOptions.BLUE
					: GridHelper.checkCellsInGrid(cells, playerData.grid);
			if (selectedColor === '#fff') {
				return;
			}

			this.playerHelper.addReadyPlayer(senderId);
			if (cells.length > 0) {
				// check if the user completed a color
				if (
					GridHelper.checkIfColorIsCompleted(selectedColor, playerData.grid)
				) {
					const colorIndex = SelectableColors.indexOf(selectedColor);
					playerData.finishedColors[colorIndex] = true;
					if (!this.bonusOwners[colorIndex]) {
						this.bonusOwners[colorIndex] = playerData.playerId;
					}
				}

				// check if the user completed any column
				const checkedColumns: number[] = [];
				for (const cell of cells) {
					if (checkedColumns.includes(cell.x)) {
						continue;
					}
					checkedColumns.push(cell.x);
					if (GridHelper.checkIfColumnIsCompleted(cell.x, playerData.grid)) {
						playerData.finishedColumns[cell.x] = true;
						if (!this.columnOwners[cell.x]) {
							this.columnOwners[cell.x] = playerData.playerId;
						}
					}
				}
			}

			this.updateClientPlayerGrid(playerData.playerId, playerData.grid);
			this.updateClientPlayerState(playerData.playerId);

			if (this.playerHelper.allPlayersReady()) {
				// this was probably a passive or a single player. If all of them made their turn, start the next round
				this.startNewRound();
			} else if (isActivePlayerPlaying) {
				// this was the first player, now the others can make their turn, but without the selected dices

				this.diceHelper.reserveDicesByValues(
					playerData.isUsingNumberJoker ? 'joker' : cells.length,
					playerData.isUsingColorJoker ? 'joker' : selectedColor
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
		const playerData = this.playerHelper.getDataByPlayerId(senderId);

		if (!playerData || this.playerHelper.isPlayerReady(senderId)) {
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
			this.diceHelper.isColorAvailable('joker')
		) {
			playerData.isUsingColorJoker = true;
			playerData.remainingJokers--;
			this.updateClientPlayerState(playerData.playerId);
		} else if (
			type === 'number' &&
			!playerData.isUsingNumberJoker &&
			this.diceHelper.isNumberAvailable('joker')
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

	updateClientPlayerGrid(playerId: string, grid: ColorGrid): void {
		const newGridData: OnGridChangedEventData = {
			newGrid: grid,
		};
		// notify player
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

		this.diceHelper.roll();
		this.diceHelper.resetDiceReservation();
		this.playerHelper.resetAllJokerUsage();
		this.playerHelper.clearReadyPlayers();
		this.gameState = GameStates.ACTIVE_PLAYER_SELECTS;
		this.updateClientGameStates();

		for (const member of roomMembers) {
			this.updateClientPlayerState(member.getId());
		}
	}

	/*
		The game is finished, if one player has at least two colors fully checked
	 */
	isGameFinished(): boolean {
		for (const playerData of this.playerHelper.players) {
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
		const points = this.playerHelper.players
			.map((playerData) => {
				return {
					player: playerData.playerId,
					score: playerData.getScore(this.columnOwners, this.bonusOwners),
					grid: playerData.grid,
				};
			})
			.sort((a, b) => (a.score > b.score ? -1 : 1));

		this.updateClientGameStates();
		const eventData: OnScoresCalculatedEventData = {
			points: points,
		};
		this.api
			.getEventApi()
			.sendRoomMessage(S2CEvents.ON_SCORES_CALCULATED, eventData);
	}

	updateClientPlayerState(playerId: string): void {
		const playerData = this.playerHelper.getDataByPlayerId(playerId);
		if (!playerData) {
			return;
		}

		const eventData: OnPlayerStateUpdateEventData = {
			usingNumberJoker: playerData.isUsingNumberJoker,
			usingColorJoker: playerData.isUsingColorJoker,
			remainingJokers: playerData.remainingJokers,
			isPlayerWaiting: this.playerHelper.isPlayerReady(playerId),
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
			currentDiceValues: this.diceHelper.diceValues,
			lastRollTimestamp: this.diceHelper.lastRollTimestamp,
			reservedBonusPoints: this.bonusOwners,
			reservedDiceIndices: this.diceHelper.getReservedDiceIndices(),
			remainingPlayers:
				this.playerHelper.players.length -
				this.playerHelper.readyPlayers.length,
		};
		this.api
			.getEventApi()
			.sendRoomMessage(S2CEvents.ON_GAME_STATE_UPDATE, eventData);
	}

	onPlayerLeft(eventData: EventDataObject): void {
		const removedUser = eventData.removedUser as User;

		if (this.api.getPlayerApi().getRoomMembers().length === 0) {
			this.api.cancelGame();
			return;
		}

		const wasActivePlayer = removedUser.getId() === this.activePlayerId;
		// remove player from list
		this.playerHelper.removePlayer(removedUser.getId());

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
			this.playerHelper.allPlayersReady()
		) {
			// seems like all other players have already finished
			this.startNewRound(true);
		}

		this.api
			.getPlayerApi()
			.sendRoomBubble(removedUser.getUsername() + ' left the game', 'error');
	}
}

export const SelectableColors = [
	GridColorOptions.RED,
	GridColorOptions.YELLOW,
	GridColorOptions.ORANGE,
	GridColorOptions.GREEN,
	GridColorOptions.BLUE,
];
