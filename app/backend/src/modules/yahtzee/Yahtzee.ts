import Module from '../../framework/modules/Module';
import ModuleGame from '../../framework/modules/ModuleGame';
import YahtzeeGame from './YahtzeeGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import { PlayerRangeDefinition } from '@edelgames/types/src/app/ModuleTypes';

/*
 * This singleton is used to register the game to the ModuleList
 */
class Yahtzee extends Module {
	getUniqueId(): string {
		return 'yahtzee';
	}

	getRequiredPlayersRange(): PlayerRangeDefinition {
		return { min: 1, max: 10 };
	}

	getGameInstance(): ModuleGame {
		return new YahtzeeGame();
	}
}

const yahtzee = new Yahtzee();
export default yahtzee;
