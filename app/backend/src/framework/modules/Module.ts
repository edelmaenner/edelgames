import ModuleGame from './ModuleGame';
import ModuleConfig from './configuration/ModuleConfig';
import { PlayerRangeDefinition } from '@edelgames/types/src/app/ModuleTypes';

export default abstract class Module {
	abstract getUniqueId(): string;

	abstract getGameInstance(): ModuleGame;

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([]);
	}

	getRequiredPlayersRange(): PlayerRangeDefinition {
		return { min: 1, max: 50 };
	}

	allowLateJoin(): boolean {
		return false;
	}
}
