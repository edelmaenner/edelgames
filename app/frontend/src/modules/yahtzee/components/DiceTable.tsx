import React, {ReactNode} from "react";
import ModuleGameInterface from "../../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../../framework/modules/ModuleApi";
import DiceBox, {getRandomDiceValue} from "../../../framework/components/DiceBox/DiceBox";


interface IProps {
    api: ModuleApi,
    isLocalPlayerActive: boolean
}

interface IState {
    rollIndex: number,
    diceValues: number[],
    selectedDice: boolean[],
    remainingRolls: number,
}

export default class DiceTable extends React.Component<IProps, IState> implements ModuleGameInterface {

    state = {
        rollIndex: 0,
        selectedDice: [false,false,false,false,false],
        diceValues: [1,1,1,1,1],
        remainingRolls: 3
    }

    componentDidMount() {
        this.props.api.getEventApi().addEventHandler('diceValuesChanged', this.onDiceValuesChanged.bind(this));
    }

    componentWillUnmount() {
        this.props.api.getEventApi().removeEvent('diceValuesChanged');
    }

    /* Remote Events */
    onDiceValuesChanged(eventData: any): void {
        this.setState({
            rollIndex: (this.state.rollIndex + 1),
            remainingRolls: 3,
            diceValues: this.state.selectedDice.map((sel, index) => sel ? this.state.diceValues[index] : getRandomDiceValue())
        })
        // todo: if player is not active, also load the selected dice from the event
    }

    /* Locale Events */

    onDiceClicked(diceId: number): void {
        if(!this.props.isLocalPlayerActive) {
            return;
        }

        let oldSelection = this.state.selectedDice;
        oldSelection[diceId] = !oldSelection[diceId];
        this.setState({
            selectedDice: oldSelection
        });

        // todo tell server and other players
    }

    onRollButtonClicked(): void {
        this.onDiceValuesChanged({}); // todo: instead tell server to roll the dices
    }


    /* Rendering */

    render(): ReactNode {
        return (
            <div className={"yahtzee-dice-table"}>
                <DiceBox rollIndex={this.state.rollIndex}
                         nextRollResults={this.state.diceValues}
                         highlightColors={this.state.selectedDice.map((el) => el ? 'red' : undefined)}
                         diceToRollMask={this.state.selectedDice.map((el) => !el)}
                         onDicesClicked={this.onDiceClicked.bind(this)}
                />
                <button disabled={!this.props.isLocalPlayerActive}
                        onClick={this.onRollButtonClicked.bind(this)}>Würfeln (noch {this.state.remainingRolls} mal)</button>
            </div>
        );
    }

}