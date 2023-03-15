import { GridColorOptions } from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { SelectableColors } from '../ColorCheckerGame';

export default class DiceHelper {
	diceValues: number[] = [1, 1, 1, 1, 1, 1];
	reservedNumberDiceIndex = -1;
	reservedColorDiceIndex = -1;
	lastRollTimestamp = -1;

	roll(): void {
		this.diceValues[0] = this.getRandomDiceValue();
		this.diceValues[1] = this.getRandomDiceValue();
		this.diceValues[2] = this.getRandomDiceValue();
		this.diceValues[3] = this.getRandomDiceValue();
		this.diceValues[4] = this.getRandomDiceValue();
		this.diceValues[5] = this.getRandomDiceValue();
		this.lastRollTimestamp = Date.now();
	}

	getRandomDiceValue(min = 1, max = 6) {
		const range = max - min;
		return min + Math.floor(Math.random() * (range + 1));
	}

	resetDiceReservation(): void {
		this.reservedNumberDiceIndex = -1;
		this.reservedColorDiceIndex = -1;
	}

	getReservedDiceIndices(): number[] {
		return [this.reservedNumberDiceIndex, this.reservedColorDiceIndex].filter(
			(value) => value !== -1
		);
	}

	reserveDicesByValues(
		num: numberDiceIdentifier,
		col: colorDiceIdentifierSecure
	): void {
		const numValueRepresentation = num === 'joker' ? 6 : num;
		const colValueRepresentation =
			col === 'joker' ? 6 : SelectableColors.indexOf(col) + 1;

		this.reservedNumberDiceIndex = this.diceValues
			.slice(0, 3)
			.indexOf(numValueRepresentation);

		this.reservedColorDiceIndex = this.diceValues.indexOf(
			colValueRepresentation,
			3
		);
	}

	/*
        Checks, if the given number can be used by a player
     */
	isNumberAvailable(num: numberDiceIdentifier): boolean {
		if (num === 'joker') {
			num = 6;
		}

		return (
			(this.diceValues[0] === num && this.reservedNumberDiceIndex !== 0) ||
			(this.diceValues[1] === num && this.reservedNumberDiceIndex !== 1) ||
			(this.diceValues[2] === num && this.reservedNumberDiceIndex !== 2)
		);
	}

	/*
        Checks, if the given color can be used by a player
     */
	isColorAvailable(col: colorDiceIdentifier): boolean {
		if (col === '#fff') {
			return false;
		}

		const valueRepresentation =
			col === 'joker' ? 6 : SelectableColors.indexOf(col) + 1;
		return (
			(this.diceValues[3] === valueRepresentation &&
				this.reservedColorDiceIndex !== 3) ||
			(this.diceValues[4] === valueRepresentation &&
				this.reservedColorDiceIndex !== 4) ||
			(this.diceValues[5] === valueRepresentation &&
				this.reservedColorDiceIndex !== 5)
		);
	}
}

type numberDiceIdentifier = number | 'joker';
type colorDiceIdentifier = colorDiceIdentifierSecure | '#fff';
type colorDiceIdentifierSecure = GridColorOptions | 'joker';
