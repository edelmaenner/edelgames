import { Team } from '../Team';
import Room from '../../../framework/Room';
import ModuleApi from '../../../framework/modules/ModuleApi';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import { Hint } from '@edelgames/types/src/modules/codenames/CNTypes';
import { BoardElement } from '../BoardElement';

export default abstract class AbstractState {
	protected gameApi: ModuleApi;

	constructor(gameApi: ModuleApi) {
		this.gameApi = gameApi;
	}

	abstract getName(): string;

	//TODO2: refactor all parameters to new class "gameparts" or such
	abstract onStateChange(
		eventData: EventDataObject,
		gameMembers: Team[],
		room: Room,
		board: BoardElement[],
		hint: Hint[]
	): AbstractState;

	abstract handleUserLeave(gameMembers: Team[], userid: string): void;

	doesEventPropertyExist(
		eventData: EventDataObject,
		propertyName: string
	): boolean {
		if (Object.prototype.hasOwnProperty.call(eventData, propertyName)) {
			return true;
		} else {
			this.gameApi
				.getLogger()
				.warning(
					`User ID ${eventData.senderId} made illegal request, property ` +
						propertyName +
						' is missing'
				);
			return false;
		}
	}

	debugIllegalPropertyValue(
		senderId: string,
		propertyName: string,
		value: string
	) {
		this.gameApi
			.getLogger()
			.warning(
				`User ID ${senderId} made illegal request, no such property: ` +
					propertyName +
					' with value: ' +
					value
			);
	}
}
