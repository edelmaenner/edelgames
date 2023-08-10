import ModuleApi from './ModuleApi';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

export default abstract class ModuleGame {
	protected api: ModuleApi;

	abstract onGameInitialize(): void;

	/**
	 * This method is called automatically and should not be overwritten by subclasses
	 * @param roomApi
	 * @final
	 */
	public __initialize(roomApi: ModuleApi): void {
		this.api = roomApi;
		this.onGameInitialize();

		const eventApi = this.api.getEventApi();
		eventApi.addEventHandler('userJoined', this.onPlayerJoin.bind(this));
		eventApi.addEventHandler(
			'userReconnected',
			this.onPlayerReconnect.bind(this)
		);
		eventApi.addEventHandler(
			'userDisconnected',
			this.onPlayerDisconnect.bind(this)
		);
		eventApi.addEventHandler('userLeft', this.onPlayerLeave.bind(this));
		eventApi.addEventHandler('gameStopped', this.onGameStopped.bind(this));
	}

	/**
	 * @description Method-stub as a placeholder to override in a child class. Is called whenever a new player joins
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onPlayerJoin(eventData: EventDataObject | null): void {
		// update a player, that newly joins the game
	}

	/**
	 * @description Method-stub as a placeholder to override in a child class. Is called whenever a disconnected player reconnects
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onPlayerReconnect(eventData: EventDataObject | null): void {
		// update a player, that reconnected to the game
	}

	/**
	 * @description Method-stub as a placeholder to override in a child class. Is called whenever a player disconnects
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onPlayerDisconnect(eventData: EventDataObject | null): void {
		// update the room, after a player disconnects (not leaving!)
	}

	/**
	 * @description Method-stub as a placeholder to override in a child class. Is called whenever a player leaves the room
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onPlayerLeave(eventData: EventDataObject | null): void {
		// update the game, after a player leaves the room
	}

	/**
	 * @description Method-stub as a placeholder to override in a child class. Is called whenever the game will be closed
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onGameStopped(eventData: EventDataObject | null): void {
		// clean up some resources, before the game is stopped
	}
}
