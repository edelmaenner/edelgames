import React, {ReactNode} from "react";
import ModuleApi from "../../../framework/modules/ModuleApi";
import DiceBox from "../../../framework/components/DiceBox/DiceBox";


interface IProps {
    api: ModuleApi,
    isLocalPlayerActive: boolean,
    diceValues: number[],
    lastRollTimeStamp: number|string,
    remoteSelectedDice: boolean[],
    remainingRolls: number,
    onDiceRollClicked: {(diceSelection: boolean[]): void}
    onSelectedDiceChanged: {(newDiceSelection: boolean[]): void}
}

export default class DiceTable extends React.Component<IProps, {}> {

    rollIndex: number = 0;
    lastRollTimeStamp: number|string = -1;

    /* Locale Events */
    onDiceClicked(diceId: number): void {
        if(!this.props.isLocalPlayerActive) {
            return;
        }

        let diceSelectionTemp = [...this.props.remoteSelectedDice];
        diceSelectionTemp[diceId] = !diceSelectionTemp[diceId];
        if(diceSelectionTemp.every((mask) => mask)) {
            return;
        }

        this.props.onSelectedDiceChanged(diceSelectionTemp);
        this.setState({});
    }

    onRollRequested(): void {
        if(!this.props.isLocalPlayerActive) {
            return;
        }

        this.props.onDiceRollClicked(this.props.remoteSelectedDice);
    }

    /* Rendering */
    render(): ReactNode {
        if(this.props.lastRollTimeStamp !== this.lastRollTimeStamp) {
            this.lastRollTimeStamp = this.props.lastRollTimeStamp;
            this.rollIndex++;
        }

        return (
            <div className={"yahtzee-dice-table"}>
                <DiceBox rollIndex={this.rollIndex}
                         nextRollResults={this.props.diceValues}
                         highlightColors={this.props.remoteSelectedDice.map((el) => el ? '#bb33ff' : undefined)}
                         diceToRollMask={this.props.remoteSelectedDice.map((el) => !el)}
                         onDicesClicked={this.onDiceClicked.bind(this)}
                />
                <button disabled={!this.props.isLocalPlayerActive || this.props.remainingRolls <= 0}
                        onClick={this.onRollRequested.bind(this)}>Würfeln (noch {this.props.remainingRolls} mal)</button>
            </div>
        );
    }

}