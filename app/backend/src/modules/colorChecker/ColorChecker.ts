import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ColorCheckerGame from './ColorCheckerGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import SelectOneConfig from '../../framework/modules/configuration/elements/SelectOneConfig';
import BooleanConfig from '../../framework/modules/configuration/elements/BooleanConfig';

/*
 * This singleton is used to register the game to the ModuleList
 */
class ColorChecker implements ModuleInterface {
	getUniqueId(): string {
		return 'colorChecker';
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([
			new SelectOneConfig('grid_template_name', 'Farbmuster: ', [
				{ label: 'Standard', value: 'default' },
				{ label: 'Variante 1', value: 'variant_1' },
				{ label: 'Variante 2', value: 'variant_2' },
				{ label: 'Variante 3', value: 'variant_3' },
				{ label: 'Zufällig', value: 'random' },
				{ label: 'Jeder Spieler zufällig', value: 'random_everyone' },
			]),
			new BooleanConfig(
				'show_opponents_grids',
				'Spieler können andere Spielbretter ansehen',
				false,
				'checkbox'
			),
		]);
	}

	getGameInstance(): ModuleGameInterface {
		return new ColorCheckerGame();
	}
}

const colorChecker = new ColorChecker();
export default colorChecker;
