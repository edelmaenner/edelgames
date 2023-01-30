import AbstractState from './AbstractState';
import HintState from './HintState';
import { Team } from '../Team';
import Room from '../../../framework/Room';
import { Words } from '../WordList';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';
import { Category } from '@edelgames/types/src/modules/codenames/CNTypes';
import { BoardElement } from '../BoardElement';

export default class InitialState extends AbstractState {
	handleUserLeave(gameMembers: Team[], userid: string): void {
		gameMembers.forEach((team) => team.removePlayer(userid));
	}

	getName(): string {
		return 'start';
	}

	onStateChange(
		eventData: EventDataObject,
		gameMembers: Team[],
		room: Room,
		board: BoardElement[]
	): AbstractState {
		if (eventData.action) {
			switch (eventData.action) {
				case 'joinInvestigator':
					this.joinInvestigator(eventData, gameMembers);
					break;
				case 'setSpymaster':
					this.setSpymaster(eventData, gameMembers);
					break;
				case 'startGame':
					if (this.isStartGameValid(eventData.senderId, room, gameMembers)) {
						// generate cards on board
						this.setBoard(board);
						this.shuffleBoard(board);
						gameMembers[0].active = true;
						return new HintState(this.gameApi);
					} else {
						this.gameApi
							.getLogger()
							.warning(
								`User ID ${eventData.senderId} send in invalid action: ` +
									eventData.action +
									' due to missing rights'
							);
					}
					break;
				default:
					this.gameApi
						.getLogger()
						.warning(
							`User ID ${eventData.senderId} send in invalid action: `,
							eventData.action
						);
			}
		} else {
			this.gameApi
				.getLogger()
				.warning(
					`User ID ${eventData.senderId} made illegal request, property action missing`
				);
		}
		return this;
	}

	private joinInvestigator(eventData: EventDataObject, gameMembers: Team[]) {
		if (this.doesEventPropertyExist(eventData, 'target')) {
			const team = gameMembers.find((team) => team.name === eventData.target);
			if (team) {
				// leave all teams
				gameMembers.forEach((team) => team.removePlayer(eventData.senderId));
				// join investigators
				team.addInvestigators(eventData.senderId);
			} else {
				this.debugIllegalPropertyValue(
					eventData.senderId,
					'target',
					eventData.target
				);
			}
		}
	}

	private setSpymaster(eventData: EventDataObject, gameMembers: Team[]) {
		if (this.doesEventPropertyExist(eventData, 'target')) {
			const team = gameMembers.find((team) => team.name === eventData.target);
			if (team) {
				// leave all teams
				gameMembers.forEach((team) => team.removePlayer(eventData.senderId));
				// set spymaster
				gameMembers
					.find((team) => team.name === eventData.target)
					.setSpymaster(eventData.senderId);
			} else {
				this.debugIllegalPropertyValue(
					eventData.senderId,
					'target',
					eventData.target
				);
			}
		}
	}

	private isStartGameValid(
		senderId: string,
		room: Room,
		gameMembers: Team[]
	): boolean {
		return (
			senderId === room.getRoomMaster().getId() &&
			gameMembers.find(
				(team) =>
					team.spymaster === undefined ||
					team.investigators === undefined ||
					team.investigators.length === 0
			) === undefined
		);
	}

	private setBoard(board: BoardElement[]) {
		board.length = 0;
		const cardCount = 25;

		for (let i = 0; i < cardCount; i++) {
			let randomWord = Words[Math.floor(Math.random() * Words.length)];

			while (board.findIndex((element) => element.word === randomWord) !== -1) {
				randomWord = Words[Math.floor(Math.random() * Words.length)];
			}

			let randomCategory, randomTeam;

			switch (true) {
				case i >= 0 && i <= 9:
					randomCategory = Category.team;
					break;
				case i == 10:
					randomCategory = Category.bomb;
					break;
				default:
					randomCategory = Category.neutral;
					break;
			}

			switch (true) {
				case i >= 0 && i <= 4:
					randomTeam = 'A';
					break;
				case i >= 5 && i <= 9:
					randomTeam = 'B';
					break;
				default:
					randomTeam = '';
					break;
			}

			board.push(new BoardElement(randomWord, randomCategory, randomTeam));
		}
	}

	private shuffleBoard(board: BoardElement[]) {
		let currentIndex = board.length,
			randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex != 0) {
			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[board[currentIndex], board[randomIndex]] = [
				board[randomIndex],
				board[currentIndex],
			];
		}
	}
}
