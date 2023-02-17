import Dice from "./Dice";
import React from "react";

const ColoredDiceMap = [
    '#b42020',
    '#2cc52c',
    '#1a49b9',
    '#bdbd20',
    '#f0f',
    '#ee7500',
];

export default class ColoredDice extends Dice {

    diceType: string = 'colored';

    renderSide(dotCount: number): JSX.Element {
        return (
            <li
                className={'die-item'}
                data-side={dotCount}
                key={'dice_side_' + dotCount}
            >
                <span className="dot" style={{
                    backgroundColor: ColoredDiceMap[dotCount-1]
                }}></span>
            </li>
        );
    }

}