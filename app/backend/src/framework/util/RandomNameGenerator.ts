const namePrefixes: string[] = [
	'colorful',
	'happy',
	'cheerful',
	'lucky',
	'ambitious',
	'awesome',
	'beautiful',
	'big',
	'calm',
	'careful',
	'clever',
	'confident',
	'faithful',
	'friendly',
	'funny',
	'honest',
	'helpful',
	'powerful',
	'smart',
];

const nameWords: string[] = [
	'unicorn',
	'dragon',
	'gnome',
	'fairy',
	'demon',
	'angel',
	'giant',
	'ordinary human',
	'knight',
	'guardian',
	'emperor',
	'fighter',
	'participant',
	'tactician',
	'tree-stump',
	'alien',
	'wizard',
	'witch',
	'hero',
	'villain',
	'astronaut',
	'wolf',
	'dog',
	'cat',
	'horse',
	'spider',
	'snake',
	'ant',
	'bear',
	'penguin',
	'bird',
	'mouse',
	'elephant',
	'lion',
];

function randInt(max: number): number {
	return Math.floor(Math.random() * max);
}

export default class RandomNameGenerator {
	public static generate(): string {
		return (
			namePrefixes[randInt(namePrefixes.length)] +
			' ' +
			nameWords[randInt(nameWords.length)]
		);
	}
}
