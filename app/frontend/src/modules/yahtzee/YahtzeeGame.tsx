import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import yahtzee from "./Yahtzee";
import Scoreboard from "./components/Scoreboard";
import DiceTable from "./components/DiceTable";
import {gameState, possibleGameStates, YahtzeeScoreboardType} from "@edelgames/types/src/modules/yahtzee/YTypes";

interface IState {
    gameState: gameState,
    scoreboard: YahtzeeScoreboardType,
}

export default class YahtzeeGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly api: ModuleApi;

    state = {
        gameState: {
            state: possibleGameStates.STARTUP,
            activePlayerId: null,
            remainingRolls: 0,
            scores: [],
            diceValues: [1,1,1,1,1],
            diceMask: [false,false,false,false,false]
        },
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
                            allowCellClick={true || this.state.gameState.state === possibleGameStates.PLAYER_SELECTS}/>
                <DiceTable api={this.api}
                           isLocalPlayerActive={true}/>
            </div>
        );
    }
}