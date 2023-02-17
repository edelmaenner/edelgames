import React, {Component} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface IProps {
    remainingJokers: number,
    onJokerUse: {(type: JokerType): void}
}

interface IState {
    usedUpJokers: boolean[]
}


export enum JokerType {
    NUMBER = 'number',
    COLOR = 'color',
}

export default class JokerList extends Component<IProps,IState> {

    state = {
        usedUpJokers: [...Array(10)].fill(false)
    }

    onJokerClicked(index: number): void {
        if(!this.state.usedUpJokers[index]) {

        }
    }

    render() {
        return (
            <div className={"joker-list"}>
                {this.state.usedUpJokers.map(this.renderJoker.bind(this))}
            </div>
        );
    }

    renderJoker(isUsed: boolean, index: number): JSX.Element {
        return (
            <div className={"joker-field"}
                 key={'joker_'+index}>
                <FontAwesomeIcon
                    icon={['fad', isUsed ? 'xmark' : 'circle-exclamation']}
                    size="2x"
                />
            </div>
        );
    }

}