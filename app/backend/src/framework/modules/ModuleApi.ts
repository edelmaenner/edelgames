import Room from '../Room';
import ModuleGame from './ModuleGame';
import { Logger } from '../util/Logger';
import ModulePlayerApi from './api/ModulePlayerApi';
import ModuleEventApi from './api/ModuleEventApi';
import Module from './Module';
import ModuleConfigApi from './api/ModuleConfigApi';

/*
 * This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleApi {
	private readonly game: ModuleGame;
	private readonly gameDefinition: Module;
	private readonly playerApi: ModulePlayerApi;
	private readonly eventApi: ModuleEventApi;
	private readonly configApi: ModuleConfigApi;
	private readonly logger: Logger;

	constructor(gameDefinition: Module, game: ModuleGame, room: Room) {
		this.game = game;
		this.gameDefinition = gameDefinition;

		this.logger = new Logger(this.getGameId());
		this.eventApi = new ModuleEventApi(this);
		this.playerApi = new ModulePlayerApi(room, this);
		this.configApi = new ModuleConfigApi(gameDefinition.getGameConfig());
	}

	public getGameId(): string {
		return this.gameDefinition.getUniqueId();
	}

	public getGame(): ModuleGame {
		return this.game;
	}

	public getGameDefinition(): Module {
		return this.gameDefinition;
	}

	public getLogger(): Logger {
		return this.logger;
	}

	public getPlayerApi(): ModulePlayerApi {
		return this.playerApi;
	}

	public getEventApi(): ModuleEventApi {
		return this.eventApi;
	}

	public getConfigApi(): ModuleConfigApi {
		return this.configApi;
	}

	// this will cancel / stop / end the current game instance and return the members back to the game select (idle) room
	public cancelGame(): void {
		this.playerApi.getRoom().setCurrentGame(null);
	}
}
