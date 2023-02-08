import React, { ReactNode } from 'react';
import ModulePlayerApi from '../../../framework/modules/api/ModulePlayerApi';
import ProfileImage from '../../../framework/components/ProfileImage/ProfileImage';

interface IProps {
	playerApi: ModulePlayerApi;
	winnerId: string | null;
}

export default class WinningScreen extends React.Component<IProps, {}> {
	render(): ReactNode {
		if (!this.props.winnerId) {
			return this.renderTie();
		}

		let winner = this.props.playerApi.getPlayerById(this.props.winnerId);
		if (!winner) {
			return <>An error occurred</>;
		}

		return (
			<div className={'winning-screen'}>
				<h4>Herzlichen Glückwunsch!</h4>
				<ProfileImage
					picture={winner.getPicture()}
					username={winner.getUsername()}
					id={winner.getId()}
				/>
				<h2>{winner.getUsername()}</h2>
			</div>
		);
	}

	renderTie(): ReactNode {
		return (
			<div className={'winning-screen'}>
				<h3>Unentschieden!</h3>
			</div>
		);
	}
}
