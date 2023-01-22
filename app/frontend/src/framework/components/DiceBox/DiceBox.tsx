import React, {Component} from "react";
import Dice from "./Dice";

interface IProps {
    rollIndex: number, // if this changed, the dices should be updated with an animation (dont change it for a slow turn)
    nextRollResults: number[], // determines the value of the dices
    diceToRollMask?: boolean[], // determines which of the dices should roll
    highlightColors?: (string|undefined)[], // determines if and which backdrop color each dice should have
    onEveryDiceRolled?: {(): void} // triggered once for every rolled dice
    onDicesRolled?: {(): void} // triggered once, when any dices changed
    onDicesClicked?: {(diceId: number): void} // triggered once, when any dices is clicked
    fixedDices?: boolean // disables the movement of the dice
}

export function getRandomDiceValue(min: number = 1, max: number = 6) {
    let range = max - min;
    return min + Math.floor(Math.random() * (range+1));
}

// massive credit and thank you for this incredible dice roll WITH PLAIN CSS and as little JavaScript as imaginable
// to https://codesandbox.io/u/ryancperry
export default class DiceBox extends Component<IProps, {}> {

    // prevent unintended animations or doubled renders with this number
    lastRollIndex: number = 0;
    // keep track to correctly animate the roll
    numberOfRollsPerDice: number[] = [];

    dicePositions: {x: number, y: number}[] = [];

    diceBoxRef = React.createRef<HTMLDivElement>();

    generateNewDicePositions(dicesToRoll: boolean[]): void {
        let newDicePositions = [];

        const minDist = 4.5 * 16;
        const boxDimensions = {
            x: (this.diceBoxRef.current?.scrollWidth || 200) - minDist,
            y: (this.diceBoxRef.current?.scrollHeight || 200) - minDist
        };

        for(let i = 0; i < dicesToRoll.length; i++) {
            newDicePositions.push(this.dicePositions[i] ?
                this.dicePositions[i] :
                {
                    x: minDist,
                    y: minDist * (i+1)
                }
            );
        }

        for(let i = 0; i < dicesToRoll.length; i++) {
            if(!dicesToRoll[i]) {
                continue;
            }

            let dicePos = {x: 0, y: 0};
            let isEnoughDistanceToOtherDice = false;
            let maxIterations = 20; // to prevent infinite loops
            while(!isEnoughDistanceToOtherDice && maxIterations > 0) {
                dicePos.x = Math.floor(Math.random() * boxDimensions.x)+minDist/2;
                dicePos.y = Math.floor(Math.random() * boxDimensions.y)+minDist/2;
                maxIterations--;
                isEnoughDistanceToOtherDice = newDicePositions.every((pos, index) => {
                    if(index === i) return true;
                    let dist = Math.sqrt(Math.pow(pos.x-dicePos.x,2) + Math.pow(pos.y-dicePos.y,2));
                    return dist > minDist;
                });
            }

            newDicePositions[i] = dicePos;
        }

        this.dicePositions = newDicePositions;
    }

    render() {
        let diceCount = this.props.nextRollResults.length;

        if(this.lastRollIndex !== this.props.rollIndex) {
            this.lastRollIndex = this.props.rollIndex;

            // update dice roll counters to trigger an animation
            let dicesToRoll = this.props.diceToRollMask ? this.props.diceToRollMask : Array(diceCount).fill(true);
            dicesToRoll.forEach((rollDice, index) => {
                if(rollDice) {
                    let oldNum = this.numberOfRollsPerDice[index]===undefined ? 0 : this.numberOfRollsPerDice[index];
                    this.numberOfRollsPerDice[index] = oldNum + 1;
                }
            })

            // generate new dice x/y positions
            if(!this.props.fixedDices) {
                this.generateNewDicePositions(dicesToRoll);
            }

            if(this.props.onDicesRolled) {
                // @ts-ignore
                setTimeout(() => this.props.onDicesRolled(dicesToRoll, this.props.nextRollResults), 1500);
            }
        }

        // generate initial dice positions
        if(this.dicePositions.length === 0) {
            this.generateNewDicePositions(Array(diceCount).fill(false));
        }

        return (
            <div className={"dice-box"} ref={this.diceBoxRef}>
                {[...Array(diceCount)].map(this.renderDice.bind(this))}
            </div>
        );
    }

    renderDice(el: undefined, index: number): JSX.Element {
        return (
            <Dice key={index}
                  id={index}
                  nextRollResult={this.props.nextRollResults[index]}
                  onDiceRolled={this.props.onEveryDiceRolled?.bind(index)}
                  rollCount={this.numberOfRollsPerDice[index]||0}
                  onDiceClicked={this.props.onDicesClicked}
                  backdropColor={this.props.highlightColors ? this.props.highlightColors[index] : undefined}
                  style={{
                      top: this.dicePositions[index].y + 'px',
                      left: this.dicePositions[index].x + 'px',
                      position: this.props.fixedDices ? 'static' : 'absolute'
                  }}
            />
        );
    }
}