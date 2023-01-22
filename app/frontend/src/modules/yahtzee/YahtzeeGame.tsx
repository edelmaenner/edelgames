import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import yahtzee from "./Yahtzee";
import Scoreboard from "./components/Scoreboard";
import DiceTable from "./components/DiceTable";

type scoreType = number|undefined;
export type YahtzeeScoreObject = {
    playerId: string,
    gather: {
        one: scoreType,
        two: scoreType,
        three: scoreType,
        four: scoreType,
        five: scoreType,
        six: scoreType,
    }|undefined,
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
                gather: {
                    one: undefined,
                    two: undefined,
                    three: undefined,
                    four: undefined,
                    five: undefined,
                    six: undefined,
                },
                threeOfAKind: undefined,
                fourOfAKind: undefined,
                fiveOfAKind: undefined,
                fullHouse: undefined,
                smallStraight: undefined,
                largeStraight: undefined,
                chance: undefined,
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