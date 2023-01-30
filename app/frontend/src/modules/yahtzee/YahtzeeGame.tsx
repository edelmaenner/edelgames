import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import yahtzee from "./Yahtzee";
import Scoreboard from "./components/Scoreboard";
import DiceTable from "./components/DiceTable";

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

interface IState {
    gameState: YahtzeeGameStates,
    scoreboard: YahtzeeScoreboardType,
}

export enum YahtzeeGameStates {
    PLAYER_ROLL_DICE_1 = 'PLAYER_ROLL_DICE_1', // first roll
    PLAYER_ROLL_DICE_2 = 'PLAYER_ROLL_DICE_2', // second roll
    PLAYER_ROLL_DICE_3 = 'PLAYER_ROLL_DICE_3', // last roll
    PLAYER_SELECT_CELL = 'PLAYER_SELECT_CELL'
}

export default class YahtzeeGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly api: ModuleApi;

    state = {
        gameState: YahtzeeGameStates.PLAYER_ROLL_DICE_1,
        scoreboard: [
            {
                playerId: '',
                one: null,
                two: null,
                three: null,
                four: null,
                five: null,
                six: null,
                threeOfAKind: null,
                fourOfAKind: null,
                fiveOfAKind: null,
                fullHouse: null,
                smallStraight: null,
                largeStraight: null,
                chance: null,
                total: 0
            }
        ]
    }


    constructor(props: {}) {
        super(props);
        this.api = new ModuleApi(yahtzee, this);
    }

    render(): ReactNode {
        let scoreboard = this.state.scoreboard;
        scoreboard[0].playerId = this.api.getPlayerApi().getLocalePlayer().getId();

        return (
            <div id={"yahtzee"}>
                <Scoreboard scoreboard={scoreboard}
                            api={this.api}
                            activePlayerId={scoreboard[0].playerId}
                            allowCellClick={this.state.gameState === YahtzeeGameStates.PLAYER_SELECT_CELL}/>
                <DiceTable api={this.api}
                           isLocalPlayerActive={true}/>
            </div>
        );
    }


}