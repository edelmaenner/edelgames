import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import User from '../../framework/User';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import {
	ColorGridCollection,
	defaultGrid,
	GameStates,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import {
	C2SEvents,
	OnActiveSelectDiceEventData,
	OnPlayerCheckedEventData,
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
	gameState: GameStates = GameStates.INIT;

	onGameInitialize(api: ModuleApi): void {
		this.api = api;
		this.initPlayerGrids();
		const eventApi = this.api.getEventApi();
		eventApi.addEventHandler(
			C2SEvents.ON_ACTIVE_SELECT_DICE,
			this.onActivePlayerSelectDice.bind(this)
		);
		this.startNewRound(false);
	}

	initPlayerGrids(): void {
		const grids: ColorGridCollection = [];
		for (const member of this.api.getPlayerApi().getRoomMembers()) {
			grids.push({
				playerId: member.getId(),
				playerName: member.getUsername(),
				grid: defaultGrid,
			});
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

		// todo: notify players with active player, current gamestate and new dice values
	}

	onPlayerLeft(eventData: EventDataObject): void {
		const removedUser = eventData.removedUser as User;

		this.api
			.getPlayerApi()
			.sendRoomBubble(removedUser.getUsername() + ' left the game', 'error');
	}

	onActivePlayerSelectDice(eventData: EventDataObject): void {
		const playerId = eventData.playerId;
		const { color, count } = eventData as OnActiveSelectDiceEventData;

		// todo validate
	}

	onPlayerCheckedFields(eventData: EventDataObject): void {
		const playerId = eventData.playerId;
		const { checkedSquares } = eventData as OnPlayerCheckedEventData;

		// todo validate
	}

	getRandomDiceValue(min = 1, max = 6) {
		const range = max - min;
		return min + Math.floor(Math.random() * (range + 1));
	}
}
