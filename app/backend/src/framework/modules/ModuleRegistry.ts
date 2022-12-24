import ModuleInterface from './ModuleInterface';
import ModuleList from '../../modules/ModuleList';
import Room from '../Room';
import debug from '../util/debug';

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
			debug(
				1,
				`Failed to start game with id ${gameId} for room ${room.getRoomId()}`
			);
			return;
		}
	}
}

const moduleRegistry = new ModuleRegistry();
export default moduleRegistry;
