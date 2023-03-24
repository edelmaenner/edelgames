import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import StadtLandFlussGame from './StadtLandFlussGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';

class StadtLandFluss implements ModuleInterface {
	getGameInstance(): ModuleGameInterface {
		return new StadtLandFlussGame();
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([]);
	}

	getUniqueId(): string {
		return 'stadtLandFluss';
	}
}

const stadtLandFluss = new StadtLandFluss();

export default stadtLandFluss;
