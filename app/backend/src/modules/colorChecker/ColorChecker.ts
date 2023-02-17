import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ColorCheckerGame from './ColorCheckerGame';

/*
 * This singleton is used to register the game to the ModuleList
 */
class ColorChecker implements ModuleInterface {
	getUniqueId(): string {
		return 'colorChecker';
	}

	getGameInstance(): ModuleGameInterface {
		return new ColorCheckerGame();
	}
}

const colorChecker = new ColorChecker();
export default colorChecker;
