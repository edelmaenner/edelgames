import ModuleApi from '../ModuleApi';
import Timer from './apiUtil/Timer';
import PlayerIterator from './apiUtil/PlayerIterator';

/**
 * @description This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleUtilApi {
	private readonly timer: Timer;
	private readonly playerIterator: PlayerIterator;

	constructor(moduleApi: ModuleApi) {
		this.timer = new Timer(moduleApi);
		this.playerIterator = new PlayerIterator(moduleApi);
	}

	public getTimer(): Timer {
		return this.timer;
	}

	public getPlayerIterator(): PlayerIterator {
		return this.playerIterator;
	}
}
