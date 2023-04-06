import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import YahtzeeGame from './YahtzeeGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';

/*
 * This singleton is used to register the game to the ModuleList
 */
class Yahtzee implements ModuleInterface {
	getUniqueId(): string {
		return 'yahtzee';
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([]);
	}

	getGameInstance(): ModuleGameInterface {
		return new YahtzeeGame();
	}
}

const yahtzee = new Yahtzee();
export default yahtzee;
