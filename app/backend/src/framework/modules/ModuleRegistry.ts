import Module from './Module';
import ModuleList from '../../modules/ModuleList';
import Room from '../Room';
import { systemLogger } from '../util/Logger';
import ModuleApi from './ModuleApi';

class ModuleRegistry {
	public getModuleList(): Module[] {
		return ModuleList;
	}

	public getModuleById(id: string): Module | null {
		return (
			this.getModuleList().find((module) => module.getUniqueId() === id) || null
		);
	}

	public createGame(room: Room, gameId: string) {
		const module = this.getModuleById(gameId);

		if (!module) {
			systemLogger.warning(
				`Failed to start undefined game with id ${gameId} for room ${room.getRoomId()}`
			);
			return;
		}

		if (!this.checkModuleRequirements(room, module)) {
			// the requirements are not fulfilled
			systemLogger.warning(
				`Failed to start game with id ${gameId} for room ${room.getRoomId()} because requirements are not fulfilled`
			);
			return;
		}

		const gameInstance = module.getGameInstance();
		const moduleApi = new ModuleApi(module, gameInstance, room);
		room.setCurrentGame(moduleApi);
		if (!room.isInConfigEditMode()) {
			// if this game does not trigger the config edit mode, we continue to start the game
			gameInstance.onGameInitialize(moduleApi);
		}
	}

	private checkModuleRequirements(room: Room, module: Module): boolean {
		const memberCount = room.getMemberCount();
		const requiredPlayers = module.getRequiredPlayersRange();

		// only one check: number of players
		return typeof requiredPlayers === 'number'
			? memberCount === requiredPlayers
			: memberCount >= requiredPlayers.min &&
					memberCount <= requiredPlayers.max;
	}
}

const moduleRegistry = new ModuleRegistry();
export default moduleRegistry;
