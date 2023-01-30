import AbstractState from './AbstractState';
import { Team } from '../Team';
import InitialState from './InitialState';
import Room from '../../../framework/Room';
import ModuleApi from '../../../framework/modules/ModuleApi';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

export default class EndState extends AbstractState {
	onStateChange(
		eventData: EventDataObject,
		gameMembers: Team[],
		room: Room
	): AbstractState {
		if (
			eventData.action &&
			eventData.action === 'restartGame' &&
			eventData.senderId === room.getRoomMaster().getId()
		) {
			gameMembers.length = 0;
			gameMembers.push(new Team('A', 5), new Team('B', 5));
			return new InitialState(this.gameApi);
		} else {
			this.gameApi.getLogger().warning('illegal restart of game tryed');
		}
		return this;
	}

	getName(): string {
		return 'end';
	}

	constructor(gameApi: ModuleApi) {
		super(gameApi);
	}

	handleUserLeave(gameMembers: Team[], userid: string): void {
		gameMembers.forEach((team) => team.removePlayer(userid));
	}
}
