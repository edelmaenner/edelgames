import User from "../../framework/util/User";
import ModuleApi from "../../framework/modules/ModuleApi";

export type GameState = {
    board: Card[]
    roundScoreBoard: Map<User, Card[]>
    scoreBoard: Map<User, number>
    config: Config
    state: State
}

export type Card = {
    guessed: boolean
    pairIndex: number
}

export type Config = {
    pairCount: number
    countdown: number
    revealPeriod: number
    revealInterval: number
}

export enum State {
    CONFIG,
    GAME
}

export type MemoryConfigProps = {
    api: ModuleApi
    config: Config
    isRoommaster: boolean
}

export type MemoryViewProps = {
    api: ModuleApi
    board: Card[]
}