import React, { ReactNode } from 'react';
import ModuleInterface from '../../../modules/ModuleInterface';
import roomManager from '../../../util/RoomManager';
import profileManager from '../../../util/ProfileManager';
import socketManager from '../../../util/SocketManager';
import moduleRegistry from '../../../modules/ModuleRegistry';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const GameSelectionEvents = {
	startGame: 'startGame',
};

export default class GameSelection extends React.Component {
	onSelectGame(gameId: string): void {
		let roomMaster = roomManager.getRoomMaster();
		if (roomMaster && roomMaster.getId() === profileManager.getId()) {
			// only the administrator should be able to select a game
			socketManager.sendEvent(GameSelectionEvents.startGame, {
				gameId: gameId,
			});
		}
	}

	render(): ReactNode {
		let gameList = moduleRegistry.getModuleList();

		return (
			<div id="gameSelection" className={'no-scrollbar'}>
				{gameList.map(this.renderGameIcon.bind(this))}
			</div>
		);
	}

	renderGameIcon(module: ModuleInterface): ReactNode {
		const requirements = module.getPlayerRequirements();
		return (
			<div
				className={'game-preview ' + (this.isPlayerRequirementFulfilled(requirements) ? '' : 'game-unavailable')}
				key={module.getUniqueId()}
				onClick={this.onSelectGame.bind(this, module.getUniqueId())}
			>
				<img
					src={module.getPreviewImage()}
				 	alt={module.getTitle()}
				/>

				<div className={'preview-hover'}>
					{module.getTitle()}
					{this.renderPlayerRequirements(requirements)}
				</div>
			</div>
		);
	}

	renderPlayerRequirements(condition: PlayerRangeDefinition): JSX.Element {
		const playerCondition = typeof condition === 'number' ?
			condition :
			`${condition.min}-${condition.max}`;

		return (
			<span>
				(
				{playerCondition}
				&nbsp;
				<FontAwesomeIcon
					icon={['fad', 'people-group']}
					size="1x"
				/>
				)
			</span>
		);
	}

	isPlayerRequirementFulfilled(condition: PlayerRangeDefinition) {
		const numPlayers = roomManager.getRoomMembers().length;
		return (typeof condition === 'number') ?
			numPlayers === condition :
			(numPlayers >= condition.min && numPlayers <= condition.max);
	}
}
