import Module from '../../framework/modules/Module';
import ModuleGame from '../../framework/modules/ModuleGame';
import StadtLandFlussGame, { defaultSLFCategories } from './StadtLandFlussGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import StringConfig from '../../framework/modules/configuration/elements/StringConfig';
import IntegerConfig from '../../framework/modules/configuration/elements/IntegerConfig';
import {
	alphabet,
	baseNumbers,
	punctuation,
} from '../../framework/modules/configuration/elements/Collections';

class StadtLandFluss extends Module {
	getGameInstance(): ModuleGame {
		return new StadtLandFlussGame();
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([
			new StringConfig(
				'slf_categories',
				'Kategorien',
				[...alphabet, ...punctuation, ...baseNumbers.map((n) => '' + n), ' '],
				[],
				4,
				40
			).changeAllowedQuantities(3, 20, defaultSLFCategories),
			new IntegerConfig('slf_num_rounds', 'Anzahl der Runden', 1, 30, 10),
		]);
	}

	getUniqueId(): string {
		return 'stadtLandFluss';
	}
}

const stadtLandFluss = new StadtLandFluss();

export default stadtLandFluss;
