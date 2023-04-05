import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import CodenamesGame from './CodenamesGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';

/*
 * This singleton is used to register the game to the ModuleList
 */
class Codenames implements ModuleInterface {
	getUniqueId(): string {
		return 'codenames';
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([]);
	}

	getGameInstance(): ModuleGameInterface {
		return new CodenamesGame();
	}
}

const codenames = new Codenames();
export default codenames;
