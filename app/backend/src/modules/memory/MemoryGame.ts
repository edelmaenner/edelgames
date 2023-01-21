import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import {Config, GameState, State} from "./types";

/**
 * Main class for the Stadt Land Fluss game.
 */
export default class MemoryGame implements ModuleGameInterface {
    api: ModuleApi;
    gameState: GameState

    initialGameState: GameState = {
        board: [],
        roundScoreBoard: new Map,
        scoreBoard: new Map,
        config: {
            pairCount: 20,
            countdown: 180,
            revealPeriod: 5,
            revealInterval: 5,
        },
        state: State.CONFIG
    }

    /**
     * Register the relevant event handlers and set up the initial game state.
     *
     * @param {ModuleApi} api
     */
    onGameInitialize(api: ModuleApi): void {
        this.api = api;
        this.gameState = this.initialGameState;

        this.api.getEventApi().addEventHandler("requestGameState", this.onRequestGameState.bind(this))
        this.api.getEventApi().addEventHandler("updateConfig", this.onUpdateConfig.bind(this))
        this.api.getEventApi().addEventHandler("startGame", this.onStartGame.bind(this))
    }

    private onRequestGameState(eventData: { senderId: string }) {
        this.publishGameState(eventData.senderId)
    }

    private onUpdateConfig(eventData: { senderId: string, config: Config }) {
        if(this.api.getPlayerApi().getPlayerById(eventData.senderId).getId() !== this.api.getPlayerApi().getRoomMaster().getId()) {
            return
        }

        this.gameState.config = eventData.config

        this.publishGameState()
    }

    private onStartGame(eventData: { senderId: string }) {
        if(this.api.getPlayerApi().getPlayerById(eventData.senderId).getId() !== this.api.getPlayerApi().getRoomMaster().getId()) {
            return
        }

        this.generateBoard()
        this.gameState.state = State.GAME

        this.publishGameState()
    }

    private generateBoard() {
        for (let i = 0; i < this.gameState.config.pairCount * 2; i++) {
            this.gameState.board[i] = {
                guessed: false,
                pairIndex: i % 2 === 0 ? i/2 : (i-1)/2
            }
        }
    }

    private publishGameState(playerId: string | null = null) {
        if(playerId === null) {
            this.api.getEventApi().sendRoomMessage("updateGameState", this.gameState)
        } else {
            this.api.getEventApi().sendPlayerMessage(playerId, "updateGameState", this.gameState)
        }
    }
}