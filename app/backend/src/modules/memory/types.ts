import User from "../../framework/User";

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
