import React from 'react';
import PlayerList from '../../components/PlayerList/PlayerList';
import GameSelection from './GameSelection/GameSelection';

export default class IdleRoom extends React.Component {
	render() {
		return (
			<div id="screenIdleRoom">
				<div className={'idle-room-overview'}>
					<PlayerList allowRenderHostFunctions={true} />
				</div>

				<div className={'idle-game-selection'}>
					<GameSelection />
				</div>
			</div>
		);
	}
}