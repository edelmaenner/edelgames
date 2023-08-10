import Module from '../../framework/modules/Module';
import ModuleGame from '../../framework/modules/ModuleGame';
import HangmanGame from './HangmanGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import BooleanConfig from '../../framework/modules/configuration/elements/BooleanConfig';
import IntegerConfig from '../../framework/modules/configuration/elements/IntegerConfig';

/*
 * This singleton is used to register the game to the ModuleList
 */
class Hangman extends Module {
	getUniqueId(): string {
		return 'hangman';
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([
			new BooleanConfig(
				'automated_words',
				'Wörter automatisch generieren',
				false,
				'checkbox'
			),
			new IntegerConfig('min_word_length', 'Mindestlänge für Wörter', 1, 99, 5),
			new IntegerConfig(
				'max_word_length',
				'Maximallänge für Wörter',
				1,
				99,
				15
			),
			new IntegerConfig(
				'max_wrong_guesses',
				'Maximale Anzahl falsche Versuche (0 für keine Grenze)',
				0,
				999,
				10
			),
			new IntegerConfig(
				'score_winning_threshold',
				'Sieg ab ... Punkten (0 für Endlosspiel):',
				0,
				999,
				50
			),
			new IntegerConfig(
				'turn_winning_threshold',
				'Spielende nach ... Runden (0 für Endlosspiel):',
				0,
				999,
				10
			),
		]);
	}

	getGameInstance(): ModuleGame {
		return new HangmanGame();
	}
}

const hangman = new Hangman();
export default hangman;
