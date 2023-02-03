import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import User from "../../framework/User";
import {EventDataObject} from "@edelgames/types/src/app/ApiTypes";
import {
    gameState,
    possibleGameStates,
    ScoreCellIDs,
    YahtzeeScoreboardType, YahtzeeScoreObject
} from "@edelgames/types/src/modules/yahtzee/YTypes";
import {getPointsFromDices} from "@edelgames/types/src/modules/yahtzee/YFunctions";



/*
 * The actual game instance, that controls and manages the game
 */
export default class YahtzeeGame implements ModuleGameInterface {

    api: ModuleApi = null;
    gameState: gameState = {
        state: possibleGameStates.STARTUP,
        activePlayerId: null,
        remainingRolls: 0,
        scores: [],
        diceValues: [1,1,1,1,1],
        diceMask: [false,false,false,false,false]
    }
    playerIndex: number = 0;

    onGameInitialize(api: ModuleApi): void {
        this.api = api;
        this.initScoreboard();
        const eventApi = this.api.getEventApi();
        eventApi.addUserLeaveHandler(this.onPlayerLeft.bind(this));
        eventApi.addEventHandler('playerRolledDice', this.onPlayerRolledDice.bind(this));
        eventApi.addEventHandler('onPlayerSelectedField', this.onPlayerSelectedField.bind(this));
        this.selectNextPlayerToRoll(false);
    }

    initScoreboard(): void {
        let players = this.api.getPlayerApi().getRoomMembers();
        let scores: YahtzeeScoreboardType = [];
        for(let user of players) {
            scores.push({
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
                total: 0
            });
        }
        this.gameState.scores = scores;
    }

    selectNextPlayerToRoll(increasePlayerIndex: boolean = true): void {
        let players = this.api.getPlayerApi().getRoomMembers();
        this.playerIndex = (increasePlayerIndex ? this.playerIndex + 1 : this.playerIndex) % players.length;

        this.gameState.state = possibleGameStates.PLAYER_ROLLS;
        this.gameState.activePlayerId = players[this.playerIndex].getId();
        this.gameState.remainingRolls = 3;
        this.updateGameState();
    }

    updateGameState(): void {
        this.api.getEventApi().sendRoomMessage('gameStateChanged', this.gameState);
    }

    onPlayerRolledDice(eventData: EventDataObject): void {
        const {senderId, maskedDices} = eventData;

        if(senderId !== this.gameState.activePlayerId || this.gameState.state !== possibleGameStates.PLAYER_ROLLS) {
            return;
        }

        if(this.gameState.remainingRolls === 3) {
            this.gameState.diceMask = [false, false, false, false, false];
        }
        else {
            this.gameState.diceMask = [
                !!maskedDices[0],
                !!maskedDices[1],
                !!maskedDices[2],
                !!maskedDices[3],
                !!maskedDices[4]
            ];
        }

        this.gameState.diceValues = [
            this.gameState.diceMask[0] ? this.gameState.diceValues[0] : this.getRandomDiceValue(),
            this.gameState.diceMask[1] ? this.gameState.diceValues[1] : this.getRandomDiceValue(),
            this.gameState.diceMask[2] ? this.gameState.diceValues[2] : this.getRandomDiceValue(),
            this.gameState.diceMask[3] ? this.gameState.diceValues[3] : this.getRandomDiceValue(),
            this.gameState.diceMask[4] ? this.gameState.diceValues[4] : this.getRandomDiceValue(),
        ];

        this.gameState.remainingRolls--;
        if(this.gameState.remainingRolls <= 0) {
            this.gameState.state = possibleGameStates.PLAYER_SELECTS;
        }
        this.updateGameState();
    }

    getRandomDiceValue(min: number = 1, max: number = 6) {
        let range = max - min;
        return min + Math.floor(Math.random() * (range+1));
    }

    onPlayerSelectedField(eventData: EventDataObject): void {
        const {senderId, field} = eventData;
        let playerScores = this.gameState.scores.find((el) => el.playerId === senderId);

        if(!playerScores || senderId !== this.gameState.activePlayerId || this.gameState.state !== possibleGameStates.PLAYER_SELECTS) {
            return;
        }

        if(this.updatePlayerScores(field, playerScores)) {
            this.updateGameState();
        }
    }

    onPlayerLeft(eventData: EventDataObject): void {
        let removedUser = eventData.removedUser as User;

        this.api.getPlayerApi().sendRoomBubble(removedUser.getUsername() + ' left the game', 'error');
        // if this user was active, skip to the next one
        if(removedUser.getId() === this.gameState.activePlayerId) {
            this.selectNextPlayerToRoll(false);
        }
    }

    // returns, if the scores were updated successfully
    updatePlayerScores(scoreType: ScoreCellIDs, playerScores: YahtzeeScoreObject): boolean {
        if(playerScores[scoreType] !== null) {
            return false; // "score already set" error
        }

        playerScores[scoreType] = getPointsFromDices(scoreType, this.gameState.diceValues);
        return true;
    }

}