import React, { ReactNode } from 'react';
import ProfileImage from '../ProfileImage/ProfileImage';
import roomManager, { RoomEventNames } from '../../util/RoomManager';
import User from '../../util/User';
import profileManager from '../../util/ProfileManager';
import eventManager from '../../util/EventManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
	renderMemberFunction?: { (member: User): JSX.Element };
	renderMemberRightFunction?: { (member: User): JSX.Element }; // will be replaced by the render function above, if both are set
	renderMemberLeftFunction?: { (member: User): JSX.Element }; // will be replaced by the render function above, if both are set
	renderMemberMiddleFunction?: { (member: User): JSX.Element }; // will be replaced by the render function above, if both are set
}

export default class PlayerList extends React.Component<IProps, {}> {
	roomUpdatedHandler: { (): void };

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

	render(): ReactNode {
		return (
			<div id="memberList">
				{roomManager
					.getRoomMembers()
					.map(this.props.renderMemberFunction || this.renderMember.bind(this))}
			</div>
		);
	}

	renderMember(member: User): JSX.Element {
		return (
			<div className="member-list-row" key={member.getId()}>
				{this.props.renderMemberLeftFunction ? this.props.renderMemberLeftFunction(member) : this.renderMemberLeft(member)}
				<div className="member-data">
					{this.props.renderMemberMiddleFunction ? this.props.renderMemberMiddleFunction(member) : this.renderMemberMiddle(member)}
					{this.props.renderMemberRightFunction ? this.props.renderMemberRightFunction(member) : this.renderMemberRight()}
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
				{profileManager.getId() === member.getId() ? <span>&nbsp;(You)</span> : null}
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
		return (
			<span></span>
		);
	}
}
