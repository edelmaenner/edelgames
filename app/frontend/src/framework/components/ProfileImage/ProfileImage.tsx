import React, { ReactNode } from 'react';

type IProps = {
	picture: string | null;
	username: string;
	id: string;
	className?: string;
	onClick?: { (): void };
	onHover?: { (): void };
	onHoverEnd?: { (): void };
	sizeMultiplier?: number;
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

		let overrideStyle = undefined;
		if(this.props.sizeMultiplier) {
			overrideStyle = {
				width: (2 * this.props.sizeMultiplier) + 'rem',
				height: (2 * this.props.sizeMultiplier) + 'rem',
			};
		}

		return (
			<div
				className={'profile-picture ' + (this.props.className || '')}
				title={this.props.username}
				onClick={this.props.onClick}
				onMouseEnter={this.props.onHover}
				onMouseLeave={this.props.onHoverEnd}
				style={overrideStyle}
			>
				{this.props.picture && !this.state.hasPictureError ? (
					<img
						src={this.props.picture}
						alt={this.props.username}
						onError={this.onPictureError.bind(this)}
					/>
				) : (
					<div
						className="profile-picture-anonymous"
						style={{
							...{ backgroundColor: `hsl(${fallbackColorHue},60%,60%)` },
							...(overrideStyle || {})
						}}
					>
						?
					</div>
				)}
			</div>
		);
	}
}
