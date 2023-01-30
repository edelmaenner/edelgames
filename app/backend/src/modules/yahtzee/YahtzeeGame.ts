import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import {EventDataObject} from "../../framework/modules/api/ModuleEventApi";
import User from "../../framework/User";

type gameState = {
    state: possibleGameStates,
    activePlayerId: string|null,
    remainingRolls: number,
    scores: YahtzeeScoreboardType,
    diceValues: number[],
    diceMask: boolean[],
}

enum possibleGameStates {
    STARTUP = 'startup',
    PLAYER_ROLLS = 'player_rolls',
    PLAYER_SELECTS = 'player_selects',
    ENDING_SCORE = 'ending_score'
}

type scoreType = number|null;
export type YahtzeeScoreObject = {
    playerId: string,
    one: scoreType,
    two: scoreType,
    three: scoreType,
    four: scoreType,
    five: scoreType,
    six: scoreType,
    threeOfAKind: scoreType,
    fourOfAKind: scoreType,
    fiveOfAKind: scoreType,
    fullHouse: scoreType,
    smallStraight: scoreType,
    largeStraight: scoreType,
    chance: scoreType,
    total: scoreType
};
export type YahtzeeScoreboardType = YahtzeeScoreObject[];

export enum scoreCellIDs {
    ONE = 'one',
    TWO = 'two',
    THREE = 'three',
    FOUR = 'four',
    FIVE = 'five',
    SIX = 'six',
    THREE_OF_A_KIND = 'threeOfAKind',
    FOUR_OF_A_KIND = 'fourOfAKind',
    FIVE_OF_A_KIND = 'fiveOfAKind',
    FULL_HOUSE = 'fullHouse',
    SMALL_STRAIGHT = 'smallStraight',
    LARGE_STRAIGHT = 'largeStraight',
    CHANCE = 'chance',
}

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
    updatePlayerScores(scoreType: scoreCellIDs, playerScores: YahtzeeScoreObject): boolean {

        // shortcut, so i don't  have to type this in the switch below again and again
        const updateHelperFunc = (cellId: scoreCellIDs, key: keyof YahtzeeScoreObject) => {
            if(playerScores[key] !== null) {
                return false; // "score already set" error
            }
            // todo remove ts-ignore
            // @ts-ignore
            playerScores[key] = this.getPointsFromDices(cellId, this.gameState.diceValues);
            return true; // score successfully set
        }

        switch (scoreType) {
            case scoreCellIDs.ONE:
                return updateHelperFunc(scoreCellIDs.ONE, 'one');
            case scoreCellIDs.TWO:
                return updateHelperFunc(scoreCellIDs.TWO, 'two');
            case scoreCellIDs.THREE:
                return updateHelperFunc(scoreCellIDs.THREE, 'three');
            case scoreCellIDs.FOUR:
                return updateHelperFunc(scoreCellIDs.FOUR, 'four');
            case scoreCellIDs.FIVE:
                return updateHelperFunc(scoreCellIDs.FIVE, 'five');
            case scoreCellIDs.SIX:
                return updateHelperFunc(scoreCellIDs.SIX, 'six');
            case scoreCellIDs.THREE_OF_A_KIND:
                return updateHelperFunc(scoreCellIDs.THREE_OF_A_KIND, 'threeOfAKind');
            case scoreCellIDs.FOUR_OF_A_KIND:
                return updateHelperFunc(scoreCellIDs.FOUR_OF_A_KIND, 'fourOfAKind');
            case scoreCellIDs.FIVE_OF_A_KIND:
                return updateHelperFunc(scoreCellIDs.FIVE_OF_A_KIND, 'fiveOfAKind');
            case scoreCellIDs.SMALL_STRAIGHT:
                return updateHelperFunc(scoreCellIDs.SMALL_STRAIGHT, 'smallStraight');
            case scoreCellIDs.LARGE_STRAIGHT:
                return updateHelperFunc(scoreCellIDs.LARGE_STRAIGHT, 'largeStraight');
            case scoreCellIDs.FULL_HOUSE:
                return updateHelperFunc(scoreCellIDs.FULL_HOUSE, 'fullHouse');
            case scoreCellIDs.CHANCE:
                return updateHelperFunc(scoreCellIDs.CHANCE, 'chance');
            default:
                return false;
        }
    }

    getPointsFromDices(scoreType: scoreCellIDs, diceValues: number[]): number {
        switch(scoreType) {
            case scoreCellIDs.ONE:
                return diceValues.reduce((prev, eyes) => prev + (eyes === 1 ? 1 : 0));
            case scoreCellIDs.TWO:
                return diceValues.reduce((prev, eyes) => prev + (eyes === 2 ? 2 : 0));
            case scoreCellIDs.THREE:
                return diceValues.reduce((prev, eyes) => prev + (eyes === 3 ? 3 : 0));
            case scoreCellIDs.FOUR:
                return diceValues.reduce((prev, eyes) => prev + (eyes === 4 ? 4 : 0));
            case scoreCellIDs.FIVE:
                return diceValues.reduce((prev, eyes) => prev + (eyes === 5 ? 5 : 0));
            case scoreCellIDs.SIX:
                return diceValues.reduce((prev, eyes) => prev + (eyes === 6 ? 6 : 0));
            case scoreCellIDs.THREE_OF_A_KIND:
                // todo, when not three of a kind: return zero
                return diceValues.reduce((prev, eyes) => prev + eyes);
            case scoreCellIDs.FOUR_OF_A_KIND:
                // todo, when not four of a kind: return zero
                return diceValues.reduce((prev, eyes) => prev + eyes);
            case scoreCellIDs.FIVE_OF_A_KIND:
                // todo, when not five of a kind: return zero
                return 50;
            case scoreCellIDs.LARGE_STRAIGHT:
                // todo, when not large straight: return zero
                return 40;
            case scoreCellIDs.SMALL_STRAIGHT:
                // todo, when not small straight: return zero
                return 30;
            case scoreCellIDs.FULL_HOUSE:
                // todo, when not small straight: return zero
                return 25;
            case scoreCellIDs.CHANCE:
                return diceValues.reduce((prev, eyes) => prev + eyes);
        }

        return 0;
    }
}