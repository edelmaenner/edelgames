import Room from '../Room';
import ModuleGameInterface from './ModuleGameInterface';
import { Logger } from '../util/Logger';
import ModulePlayerApi from './api/ModulePlayerApi';
import ModuleEventApi from './api/ModuleEventApi';
import ModuleConfig from './configuration/ModuleConfig';
import ModuleInterface from './ModuleInterface';
import { ConfigurationTypes } from '@edelgames/types/src/app/ConfigurationTypes';
import { anyObject } from '@edelgames/types/src/app/BasicTypes';

/*
 * This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleApi {
	private readonly game: ModuleGameInterface;
	private readonly gameId: string;
	private readonly gameConfig: ModuleConfig;
	private readonly playerApi: ModulePlayerApi;
	private readonly eventApi: ModuleEventApi;
	private readonly logger: Logger;

	constructor(
		gameDefinition: ModuleInterface,
		game: ModuleGameInterface,
		room: Room
	) {
		this.game = game;
		this.gameId = gameDefinition.getUniqueId();
		this.gameConfig = gameDefinition.getGameConfig();

		this.logger = new Logger(this.gameId);
		this.eventApi = new ModuleEventApi(this);
		this.playerApi = new ModulePlayerApi(room, this);
	}

	public getConfig(): ModuleConfig {
		return this.gameConfig;
	}

	public getConfigValue(
		name: string,
		fallback: string | number | anyObject | null = null
	): ConfigurationTypes | undefined {
		const element = this.gameConfig.getElementByName(name);
		return element ? element.getValue() : fallback;
	}

	public getGameId(): string {
		return this.gameId;
	}

	public getGame(): ModuleGameInterface {
		return this.game;
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

	// this will cancel / stop / end the current game instance and return the members back to the game select (idle) room
	public cancelGame(): void {
		this.playerApi.getRoom().setCurrentGame(null);
	}
}
