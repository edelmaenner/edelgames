import ModuleInterface from './ModuleInterface';
import ModuleList from '../../modules/ModuleList';
import Room from '../Room';
import { systemLogger } from '../util/Logger';
import ModuleApi from './ModuleApi';

class ModuleRegistry {
	public getModuleList(): ModuleInterface[] {
		return ModuleList;
	}

	public getModuleById(id: string): ModuleInterface | null {
		return (
			this.getModuleList().find((module) => module.getUniqueId() === id) || null
		);
	}

	public createGame(room: Room, gameId: string) {
		const module = this.getModuleById(gameId);

		if (!module) {
			systemLogger.warning(
				`Failed to start game with id ${gameId} for room ${room.getRoomId()}`
			);
			return;
		}

		const gameInstance = module.getGameInstance();
		const moduleApi = new ModuleApi(module, gameInstance, room);
		room.setCurrentGame(moduleApi);
	}
}

const moduleRegistry = new ModuleRegistry();
export default moduleRegistry;
