import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import HangmanGame from './HangmanGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import BooleanConfig from '../../framework/modules/configuration/elements/BooleanConfig';
import IntegerConfig from '../../framework/modules/configuration/elements/IntegerConfig';

/*
 * This singleton is used to register the game to the ModuleList
 */
class Hangman implements ModuleInterface {
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
		]);
	}

	getGameInstance(): ModuleGameInterface {
		return new HangmanGame();
	}
}

const hangman = new Hangman();
export default hangman;
