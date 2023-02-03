import {DiceDotCollection, ScoreCellIDs} from "./YTypes";

export function getPointsFromDices(scoreType: ScoreCellIDs, diceValues: number[]): number {
    const diceCollection = getDiceDotCollections(diceValues);

    switch(scoreType) {
        case ScoreCellIDs.ONE:
            const ones = diceCollection.find((entry) => entry.value === 1);
            return ones !== undefined ? ones.count : 0;
        case ScoreCellIDs.TWO:
            const twos = diceCollection.find((entry) => entry.value === 2);
            return twos !== undefined ? twos.count * 2 : 0;
        case ScoreCellIDs.THREE:
            const threes = diceCollection.find((entry) => entry.value === 3);
            return threes !== undefined ? threes.count * 3: 0;
        case ScoreCellIDs.FOUR:
            const fours = diceCollection.find((entry) => entry.value === 4);
            return fours !== undefined ? fours.count * 4: 0;
        case ScoreCellIDs.FIVE:
            const fives = diceCollection.find((entry) => entry.value === 5);
            return fives !== undefined ? fives.count * 5: 0;
        case ScoreCellIDs.SIX:
            const sixes = diceCollection.find((entry) => entry.value === 6);
            return sixes !== undefined ? sixes.count * 6: 0;
        case ScoreCellIDs.THREE_OF_A_KIND:
            const hasThreeOfAKind = diceCollection.find((entry => entry.count >= 3));
            return hasThreeOfAKind ? diceValues.reduce((prev, eyes) => prev + eyes) : 0;
        case ScoreCellIDs.FOUR_OF_A_KIND:
            const hasFourOfAKind = diceCollection.length <= 2 && diceCollection.find((entry => entry.count >= 4));
            return hasFourOfAKind ? diceValues.reduce((prev, eyes) => prev + eyes) : 0;
        case ScoreCellIDs.FIVE_OF_A_KIND:
            const hasFiveOfAKind = diceCollection.length === 1;
            return hasFiveOfAKind ? 50 : 0;
        case ScoreCellIDs.LARGE_STRAIGHT:
            const hasLargeStraight = diceCollection.length === 5;
            return hasLargeStraight ? 40 : 0;
        case ScoreCellIDs.SMALL_STRAIGHT:
            const hasSmallStraight = diceCollection.length === 5 || (
                diceCollection.length === 4 &&
                diceCollection.find((entry => {
                    return entry.count === 1 && (
                        entry.value === 1 ||
                        entry.value === 6
                    )
                }))
            );
            return hasSmallStraight ? 30 : 0;
        case ScoreCellIDs.FULL_HOUSE:
            const hasFullHouse = diceValues.length === 2 && diceCollection.find((entry => entry.count === 3));
            return hasFullHouse ? 25 : 0;
        case ScoreCellIDs.CHANCE:
            return diceValues.reduce((prev, eyes) => prev + eyes);
    }

    return 0;
}

export function getDiceDotCollections(diveValues: number[]): DiceDotCollection {
    let diceDots: DiceDotCollection = [];
    for(let value of diveValues) {
        let entry = diceDots.find((entry) => entry.value === value);
        if(entry) {
            entry.count = entry.count + 1;
        }
        else {
            diceDots.push({
                value: value,
                count: 1
            });
        }
    }
    return diceDots;
}