import React, {Component, ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import memory from "./Memory";
import MemoryConfig from "./components/MemoryConfig";
import MemoryView from "./components/MemoryView";
import {GameState, State} from "./types";

/**
 * Main component for the Memory game.
 */
export default class MemoryGame extends Component<{}, GameState> implements ModuleGameInterface {

    private readonly api: ModuleApi;

    private hasBeenMounted: boolean = false

    /**
     * The initial game state when the game is created / loaded.
     */
    state: GameState = {
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

    constructor(props: any) {
        super(props)
        this.api = new ModuleApi(memory, this)
    }

    /**
     * Once the component has been mounted and can accept a state, this method is called.
     * Registers an event handler that listens for updates on the game state as well as requests an initial version from the server.
     */
    componentDidMount(): void {
        if (!this.hasBeenMounted) {
            this.api.getEventApi().addEventHandler("updateGameState", this.onUpdateGameState.bind(this))
            this.api.getEventApi().sendMessageToServer("requestGameState", {})
            this.hasBeenMounted = true
        }
    }

    private onUpdateGameState(eventData: GameState | any) {
        const eventState = eventData as GameState

        this.setState({
            board: eventState.board,
            config: eventState.config,
            state: eventState.state,
            scoreBoard: eventState.scoreBoard,
            roundScoreBoard: eventState.roundScoreBoard
        })
    }

    /**
     * Render the component.
     */
    render(): ReactNode {
        return (
            <div id={"memory"}>
                {(this.state.state === State.CONFIG) && <MemoryConfig api={this.api} config={this.state.config} isRoommaster={this.api.getPlayerApi().getLocalePlayer().isRoomMaster()}/>}
                {(this.state.state === State.GAME) && <MemoryView api={this.api} board={this.state.board}/>}
            </div>
        )
    }
}