import React, { ReactNode } from 'react';
import ProfileImage from '../ProfileImage/ProfileImage';
import roomManager, { RoomEventNames } from '../../util/RoomManager';
import User from '../../util/User';
import profileManager from '../../util/ProfileManager';
import eventManager from '../../util/EventManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PopUp from "../PopUp/PopUp";
import socketManager from "../../util/SocketManager";

interface IProps {
	renderMemberFunction?: { (member: User): JSX.Element };
	renderMemberRightFunction?: { (member: User): JSX.Element }; // will be replaced by the render function above, if both are set
	renderMemberLeftFunction?: { (member: User): JSX.Element }; // will be replaced by the render function above, if both are set
	renderMemberMiddleFunction?: { (member: User): JSX.Element }; // will be replaced by the render function above, if both are set
	allowRenderHostFunctions?: boolean;
}

interface IState {
	hostMemberMenuOpen: User|undefined;
}

export default class PlayerList extends React.Component<IProps, IState> {
	roomUpdatedHandler: { (): void };
	memberMenuPosition: {x: number, y: number} = {x: 0, y: 0};

	state: IState = {
		hostMemberMenuOpen: undefined
	}

	constructor(props: any) {
		super(props);
		this.roomUpdatedHandler = this.onRoomUpdated.bind(this);
	}

	componentDidMount() {
		eventManager.subscribe(RoomEventNames.roomUpdated, this.roomUpdatedHandler);
	}

	componentWillUnmount() {
		eventManager.unsubscribe(
			RoomEventNames.roomUpdated,
			this.roomUpdatedHandler
		);
	}

	onRoomUpdated(): void {
		this.setState({});
	}

	onMemberPanelToggled(member: User, event: React.MouseEvent): void {
		if (!this.props.allowRenderHostFunctions) {
			return;
		}

		this.memberMenuPosition.x = event.clientX;
		this.memberMenuPosition.y = event.clientY;
		this.setState({
			hostMemberMenuOpen: member
		});
		event.stopPropagation();
		event.preventDefault();
	}

	render(): ReactNode {
		return (
			<div id="memberList">
				{roomManager
					.getRoomMembers()
					.map(this.props.renderMemberFunction || this.renderMember.bind(this))}

				{this.state.hostMemberMenuOpen && this.renderHostMemberMenu()}
			</div>
		);
	}

	renderMember(member: User): JSX.Element {
		const isSelected = member === this.state.hostMemberMenuOpen;

		return (
			<div className={"member-list-row " + (isSelected ? 'menu-opened' : '')}
				 key={member.getId()}
				 onContextMenu={this.onMemberPanelToggled.bind(this, member)}
			>
				{this.props.renderMemberLeftFunction
					? this.props.renderMemberLeftFunction(member)
					: this.renderMemberLeft(member)}
				<div className="member-data">
					{this.props.renderMemberMiddleFunction
						? this.props.renderMemberMiddleFunction(member)
						: this.renderMemberMiddle(member)}
					{this.props.renderMemberRightFunction
						? this.props.renderMemberRightFunction(member)
						: this.renderMemberRight()}
				</div>
			</div>
		);
	}

	renderMemberLeft(member: User): JSX.Element {
		return (
			<ProfileImage
				picture={member.getPicture()}
				username={member.getUsername()}
				id={member.getId()}
			/>
		);
	}

	renderMemberMiddle(member: User): JSX.Element {
		return (
			<span>
				<span className="member-name">{member.getUsername()}</span>
				{profileManager.getId() === member.getId() ? (
					<span>&nbsp;(You)</span>
				) : null}
				{member.isRoomMaster() ? (
					<span className="error-text">
						&nbsp;
						<FontAwesomeIcon
							icon={['fad', 'crown']}
							size="1x"
							title={'Dungeonmaster'}
						/>
					</span>
				) : null}
			</span>
		);
	}

	renderMemberRight(): JSX.Element {
		return <span></span>;
	}

	onHostMemberMenuAction(action: 'declareHost'): void {
		if (!this.state.hostMemberMenuOpen) {
			return;
		}

		switch (action) {
			case "declareHost": {
				socketManager.sendEvent(RoomEventNames.changeRoomHost, {
					newHostID: this.state.hostMemberMenuOpen.getId()
				});
				break;
			}
		}
	}

	renderHostMemberMenu(): JSX.Element {
		const showHostChangeButton: boolean =
			profileManager.isRoomMaster() &&
			this.state.hostMemberMenuOpen?.getId() !== profileManager.getId();

		return (
			<PopUp onClose={this.setState.bind(this, {hostMemberMenuOpen: undefined})}
				   closeWithoutFocus={true}
				   position={'fixed'}
				   coordinates={this.memberMenuPosition}
			>
				<div className={'popup-header'}>
					{this.state.hostMemberMenuOpen?.getUsername()}
				</div>

				{showHostChangeButton && <div>
					<button onClick={(event) => {
						event.stopPropagation();
						event.nativeEvent.stopImmediatePropagation();
						this.onHostMemberMenuAction('declareHost');
					}}>
						Zum Host ernennen
					</button>
				</div>}

				{!showHostChangeButton && <div>
					Derzeit sind hier keine Aktionen für dich verfügbar
				</div>}

			</PopUp>
		);
	}
}