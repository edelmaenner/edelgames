import profileManager, { ProfileEventNames } from '../../util/ProfileManager';
import ProfileImage from '../ProfileImage/ProfileImage';
import LoginWindow from '../LoginWindow/LoginWindow';
import eventManager from '../../util/EventManager';
import roomManager from '../../util/RoomManager';
import React, { ReactNode } from 'react';
import RoomActionPanel from './RoomActionPanel';
import PopUp from "../PopUp/PopUp";

type IState = {
	showLoginWindow: boolean;
	showRoomActionWindow: boolean;
};

export default class PageHeader extends React.Component<{}, IState> {
	state = {
		showLoginWindow: false,
		showRoomActionWindow: false,
	};

	profileUpdatedListener = this.onProfileDataChanged.bind(this);

	componentDidMount() {
		eventManager.subscribe(
			ProfileEventNames.profileUpdated,
			this.profileUpdatedListener
		);
	}

	componentWillUnmount() {
		eventManager.unsubscribe(
			ProfileEventNames.profileUpdated,
			this.profileUpdatedListener
		);
	}

	onProfileDataChanged(): void {
		this.setState({});
	}

	onOpenLoginWindow(): void {
		this.setState({
			showLoginWindow: true,
		});
	}

	onCloseLoginWindow(): void {
		this.setState({
			showLoginWindow: false,
		});
	}

	toggleRoomActionPanel(): void {
		this.setState({
			showRoomActionWindow: !this.state.showRoomActionWindow,
		});
	}

	renderRoomData(): ReactNode {
		return (
			<div className={'room-data'}
				 onClick={event => {
					 event.stopPropagation();
					 this.toggleRoomActionPanel();
				 }}
			>
				<div className={'room-name'}>{roomManager.getRoomName()}</div>

				{this.state.showRoomActionWindow ? (
					<PopUp
						closeWithoutFocus={true}
						onClose={this.toggleRoomActionPanel.bind(this)}
						position={'absolute'}
						style={{
							left: '50%',
							top: '100%',
							transform: 'translateX(-50%)',
						}}
					>
						<RoomActionPanel
							panelRemoteCloseCallback={this.toggleRoomActionPanel.bind(this)}
						/>
					</PopUp>
				) : null}
			</div>
		);
	}

	render(): ReactNode {
		return (
			<div id="pageHeader">
				<div className="text-align-left">
					<span
						id="userProfileInfoShort"
						onClick={this.onOpenLoginWindow.bind(this)}
					>
						<ProfileImage
							picture={profileManager.getPicture()}
							username={profileManager.getUsername()}
							id={profileManager.getId()}
						/>

						<div className="profile-name">{profileManager.getUsername()}</div>
					</span>
				</div>

				<div className="text-align-center">
					{roomManager.getRoomId() === 'lobby' ? null : this.renderRoomData()}
				</div>

				<div className="text-align-right"></div>

				{profileManager.isVerified() ? null : (
					<LoginWindow
						show={this.state.showLoginWindow}
						closeFunction={this.onCloseLoginWindow.bind(this)}
					/>
				)}
			</div>
		);
	}
}