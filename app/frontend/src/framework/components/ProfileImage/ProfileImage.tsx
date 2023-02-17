import React, { ReactNode } from 'react';

type IProps = {
	picture: string | null;
	username: string;
	id: string;
};

interface IState {
	hasPictureError: boolean;
}

export default class ProfileImage extends React.Component<IProps, IState> {
	state = {
		hasPictureError: false,
	};

	onPictureError(): void {
		this.setState({ hasPictureError: true });
	}

	render(): ReactNode {
		let fallbackColorHue = parseInt(this.props.id, 36) % 360;

		return (
			<div className="profile-picture" title={this.props.username}>
				{this.props.picture && !this.state.hasPictureError ? (
					<img
						src={this.props.picture}
						alt={this.props.username}
						onError={this.onPictureError.bind(this)}
					/>
				) : (
					<div
						className="profile-picture-anonymous"
						style={{ backgroundColor: `hsl(${fallbackColorHue},60%,60%)` }}
					>
						?
					</div>
				)}
			</div>
		);
	}
}
