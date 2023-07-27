import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import DrawAndGuessGame from './DrawAndGuessGame';
import { systemLogger } from '../../framework/util/Logger';
import wordList from './Wordlist';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import { PlayerRangeDefinition } from '@edelgames/types/src/app/ModuleTypes';

/*
 * This singleton is used to register the game to the ModuleList
 */
class DrawAndGuess implements ModuleInterface {
	private wordList: string[] = [];

	getUniqueId(): string {
		return 'drawAndGuess';
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([]);
	}

	getRequiredPlayersRange(): PlayerRangeDefinition {
		return { min: 2, max: 50 };
	}

	getGameInstance(): ModuleGameInterface {
		return new DrawAndGuessGame();
	}

	getWordList(): string[] {
		if (this.wordList.length) {
			return this.wordList;
		}

		try {
			this.wordList = wordList.map((line) => line.trim().toLowerCase());
			this.wordList = this.wordList.filter((line, index, self) => {
				return line !== '' && self.indexOf(line) === index;
			});
			return this.wordList;
		} catch (err) {
			systemLogger.error(err);
		}

		return [];
	}
}

const drawAndGuess = new DrawAndGuess();
export default drawAndGuess;
