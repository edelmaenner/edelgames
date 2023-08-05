import Module from '../../framework/modules/Module';
import ModuleGame from '../../framework/modules/ModuleGame';
import CodenamesGame from './CodenamesGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import { PlayerRangeDefinition } from '@edelgames/types/src/app/ModuleTypes';

/*
 * This singleton is used to register the game to the ModuleList
 */
class Codenames extends Module {
	getUniqueId(): string {
		return 'codenames';
	}

	getGameInstance(): ModuleGame {
		return new CodenamesGame();
	}

	getRequiredPlayersRange(): PlayerRangeDefinition {
		return { min: 4, max: 30 };
	}
}

const codenames = new Codenames();
export default codenames;
