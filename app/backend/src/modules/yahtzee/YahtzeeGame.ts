import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import User from "../../framework/User";
import {EventDataObject} from "@edelgames/types/src/app/ApiTypes";
import {
    possibleGameStates,
    ScoreCellIDs,
    YahtzeeScoreboardType,
    YahtzeeScoreObject
} from "@edelgames/types/src/modules/yahtzee/YTypes";
import {getPointsFromDices, getTotalFirstPartPoints} from "@edelgames/types/src/modules/yahtzee/YFunctions";
import {
    CellSelectedEventData,
    DiceChangedEventData,
    DiceSelectionChangedEventData,
    GameStateChangedEventData,
    RollRequestedEventData,
    ScoresChangedEventData,
    YahtzeeClientToServerEventNames,
    YahtzeeServerToClientEventNames
} from "@edelgames/types/src/modules/yahtzee/YEvents";


/*
 * The actual game instance, that controls and manages the game
 */
export default class YahtzeeGame implements ModuleGameInterface {

    // technical properties
    api: ModuleApi = null;
    playerIndex: number = 0;

    // game properties
    gameState: possibleGameStates = possibleGameStates.STARTUP;
    activePlayerId: string|null = null;
    diceValues: number[] = [1,1,1,1,1];
    diceMask: boolean[] = [false,false,false,false];
    remainingRolls: number = 0;
    scoreboard: YahtzeeScoreboardType = [];

    onGameInitialize(api: ModuleApi): void {
        this.api = api;
        this.initScoreboard();

        const eventApi = this.api.getEventApi();
        eventApi.addUserLeaveHandler(this.onPlayerLeft.bind(this));
        eventApi.addEventHandler(YahtzeeClientToServerEventNames.ROLL_REQUESTED, this.onPlayerRolledDice.bind(this));
        eventApi.addEventHandler(YahtzeeClientToServerEventNames.DICE_SELECTION_CHANGED, this.onPlayerChangedSelection.bind(this));
        eventApi.addEventHandler(YahtzeeClientToServerEventNames.CELL_SELECTED, this.onPlayerSelectedField.bind(this));
        this.selectNextPlayerToRoll(false);
    }

    initScoreboard(): void {
        let players = this.api.getPlayerApi().getRoomMembers();
        this.scoreboard = [];
        for(let user of players) {
            this.scoreboard.push({
                playerId: user.getId(),
                one: null,
                two: null,
                three: null,
                four: null,
                five: null,
                six: null,
                threeOfAKind: null,
                fourOfAKind: null,
                fullHouse: null,
                smallStraight: null,
                largeStraight: null,
                fiveOfAKind: null,
                chance: null,
                total: null
            });
        }
        this.sendScoresChangedUpdate();
    }

    /*
        Locale (Server) Events
     */

    sendGameStateUpdate(): void {
        this.api.getEventApi().sendRoomMessage(
            YahtzeeServerToClientEventNames.GAME_STATE_CHANGED,
            {
                gameState: this.gameState,
                activePlayerId: this.activePlayerId
            } as GameStateChangedEventData
        );
    }

    sendDicesChangedUpdate(hasRolledDice: boolean): void {
        this.api.getEventApi().sendRoomMessage(
            YahtzeeServerToClientEventNames.DICES_CHANGED,
            {
                diceMask: this.diceMask,
                diceValues: this.diceValues,
                remainingRolls: this.remainingRolls,
                hasRolledDice: hasRolledDice
            } as DiceChangedEventData
        );
    }

    sendScoresChangedUpdate(): void {
        this.api.getEventApi().sendRoomMessage(
            YahtzeeServerToClientEventNames.SCORES_CHANGED,
            {
                scoreboard: this.scoreboard
            } as ScoresChangedEventData
        );
    }

    /*
        Remote (Client) Events
     */

    onPlayerRolledDice(eventData: EventDataObject): void {
        const {senderId} = eventData;
        const {selectedDice} = eventData as RollRequestedEventData;

        if (senderId !== this.activePlayerId ||
            this.gameState !== possibleGameStates.PLAYER_ACTION ||
            this.remainingRolls <= 0)
        {
            return;
        }

        if(this.remainingRolls === 3) {
            this.diceMask = [false, false, false, false, false];
        }
        else {
            this.diceMask = [
                !!selectedDice[0],
                !!selectedDice[1],
                !!selectedDice[2],
                !!selectedDice[3],
                !!selectedDice[4]
            ];
        }

        this.diceValues = [
            this.diceMask[0] ? this.diceValues[0] : this.getRandomDiceValue(),
            this.diceMask[1] ? this.diceValues[1] : this.getRandomDiceValue(),
            this.diceMask[2] ? this.diceValues[2] : this.getRandomDiceValue(),
            this.diceMask[3] ? this.diceValues[3] : this.getRandomDiceValue(),
            this.diceMask[4] ? this.diceValues[4] : this.getRandomDiceValue(),
        ];

        this.remainingRolls--;
        this.sendDicesChangedUpdate(true);
    }

    onPlayerChangedSelection(eventData: EventDataObject): void {
        const {senderId} = eventData;
        const {selectedDice} = eventData as DiceSelectionChangedEventData;
        const hasInvalidSelection = selectedDice.every((mask) => mask) || selectedDice.length !== 5;

        if(this.remainingRolls >= 3 || senderId !== this.activePlayerId || hasInvalidSelection) {
            return;
        }
        this.diceMask = [
            !!selectedDice[0],
            !!selectedDice[1],
            !!selectedDice[2],
            !!selectedDice[3],
            !!selectedDice[4]
        ];
        this.sendDicesChangedUpdate(false);
    }

    onPlayerSelectedField(eventData: EventDataObject): void {
        const {senderId} = eventData;
        const {selectedCellId} = eventData as CellSelectedEventData;

        let playerScores = this.scoreboard.find((el) => el.playerId === senderId);
        if (!playerScores ||
            senderId !== this.activePlayerId ||
            this.remainingRolls >= 3 ||
            this.gameState !== possibleGameStates.PLAYER_ACTION)
        {
            return;
        }

        if(this.updatePlayerScores(selectedCellId, playerScores)) {
            this.sendScoresChangedUpdate();
            this.selectNextPlayerToRoll(true);
        }
    }

    onPlayerLeft(eventData: EventDataObject): void {
        let removedUser = eventData.removedUser as User;

        this.api.getPlayerApi().sendRoomBubble(removedUser.getUsername() + ' left the game', 'error');
        // if this user was active, skip to the next one
        if(removedUser.getId() === this.activePlayerId) {
            this.selectNextPlayerToRoll(false);
        }
    }

    getRandomDiceValue(min: number = 1, max: number = 6) {
        let range = max - min;
        return min + Math.floor(Math.random() * (range+1));
    }

    // returns, if the scores were updated successfully
    updatePlayerScores(scoreType: ScoreCellIDs, playerScores: YahtzeeScoreObject): boolean {
        if(playerScores[scoreType] !== null) {
            return false; // "score already set" error
        }

        playerScores[scoreType] = getPointsFromDices(scoreType, this.diceValues);
        return true;
    }

    selectNextPlayerToRoll(increasePlayerIndex: boolean = true): void {
        let players = this.api.getPlayerApi().getRoomMembers();
        if(players.length <= 0) {
            this.api.cancelGame();
            return;
        }

        if(this.isGameFinished()) {
            this.gameState = possibleGameStates.ENDING_SCORE;
            this.activePlayerId = this.getHighestScoredPlayerId();
            this.sendScoresChangedUpdate();
            this.sendGameStateUpdate();
            return;
        }

        this.playerIndex = (increasePlayerIndex ? this.playerIndex + 1 : this.playerIndex) % players.length;

        this.gameState = possibleGameStates.PLAYER_ACTION;
        this.activePlayerId = players[this.playerIndex].getId();
        this.remainingRolls = 3;
        this.diceMask = [false,false,false,false,false];

        this.sendGameStateUpdate();
        this.sendDicesChangedUpdate(false);
    }

    isGameFinished(): boolean {
        for(let scores of this.scoreboard) {
            scores  = scores as YahtzeeScoreObject;
            if (
                scores[ScoreCellIDs.ONE] === null ||
                scores[ScoreCellIDs.TWO] === null ||
                scores[ScoreCellIDs.THREE] === null ||
                scores[ScoreCellIDs.FOUR] === null ||
                scores[ScoreCellIDs.FIVE] === null ||
                scores[ScoreCellIDs.SIX] === null ||
                scores[ScoreCellIDs.THREE_OF_A_KIND] === null ||
                scores[ScoreCellIDs.FOUR_OF_A_KIND] === null ||
                scores[ScoreCellIDs.FIVE_OF_A_KIND] === null ||
                scores[ScoreCellIDs.FULL_HOUSE] === null ||
                scores[ScoreCellIDs.SMALL_STRAIGHT] === null ||
                scores[ScoreCellIDs.LARGE_STRAIGHT] === null ||
                scores[ScoreCellIDs.CHANCE] === null
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns null when tied
     */
    getHighestScoredPlayerId(): string|null {
        let highestScore = 0;
        let highestScorePlayerCount = 0;
        let highestScorePlayerId = null;

        for(let scores of this.scoreboard) {
            scores = scores as YahtzeeScoreObject;
            let firstPart = getTotalFirstPartPoints(scores);
            let secondPart =
                scores[ScoreCellIDs.THREE_OF_A_KIND] +
                scores[ScoreCellIDs.FOUR_OF_A_KIND] +
                scores[ScoreCellIDs.FIVE_OF_A_KIND] +
                scores[ScoreCellIDs.CHANCE] +
                scores[ScoreCellIDs.FULL_HOUSE] +
                scores[ScoreCellIDs.SMALL_STRAIGHT] +
                scores[ScoreCellIDs.SMALL_STRAIGHT];
            scores.total = firstPart + (firstPart >= 63 ? 35 : 0) + secondPart;

            if(scores.total > highestScore) {
                highestScore = scores.total;
                highestScorePlayerId = scores.playerId;
                highestScorePlayerCount = 1;
            }
            else if(scores.total === highestScore) {
                highestScorePlayerCount++;
            }
        }

        return highestScorePlayerCount === 1 ? highestScorePlayerId : null;
    }

}