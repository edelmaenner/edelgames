import ModuleGameInterface from './ModuleGameInterface';
import ModuleConfig from './configuration/ModuleConfig';
import { PlayerRangeDefinition } from '@edelgames/types/src/app/ModuleTypes';

export default interface ModuleInterface {
	getUniqueId(): string;

	getGameConfig(): ModuleConfig;

	getGameInstance(): ModuleGameInterface;

	getRequiredPlayersRange(): PlayerRangeDefinition;
}
