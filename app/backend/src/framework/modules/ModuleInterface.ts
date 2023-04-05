import ModuleGameInterface from './ModuleGameInterface';
import ModuleConfig from './configuration/ModuleConfig';

export default interface ModuleInterface {
	getUniqueId(): string;

	getGameConfig(): ModuleConfig;

	getGameInstance(): ModuleGameInterface;
}
