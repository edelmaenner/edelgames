import React from 'react';
import RoomListBox from '../../components/RoomListBox/RoomListBox';

export default class Lobby extends React.Component {
	state = {
		results: [1, 1, 1],
		dicesToShuffle: [true, true, true],
		rollIndex: 0,
	};

	setNewResult(diceId: number): void {
		let diceCount = 3;
		let newResults: number[] = [...Array(diceCount)].map((el, index) => {
			let rand = Math.floor(Math.random() * 6) + 1;
			if (index === diceId) {
				return rand;
			}
			return this.state.results[index] || rand;
		});
		let newShuffle: boolean[] = [...Array(diceCount)].map(
			(el, index) => index === diceId
		);
		this.setState({
			results: newResults,
			dicesToShuffle: newShuffle,
			rollIndex: this.state.rollIndex + 1,
		});
	}

	render() {
		return (
			<div id="screenLobby">
				<RoomListBox />
			</div>
		);
	}
}
