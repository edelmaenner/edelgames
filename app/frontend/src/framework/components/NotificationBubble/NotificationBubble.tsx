import React, { ReactNode } from 'react';
import eventManager from '../../util/EventManager';
import { BubbleMessage } from '@edelgames/types/src/app/components/NotificationBubbleTypes';
import { EventDataObject } from '@edelgames/types/src/app/ApiTypes';

interface IState {
	bubbles: BubbleMessage[];
}

export default class NotificationBubble extends React.Component<{}, IState> {
	state = {
		bubbles: [],
	};

	componentDidMount() {
		// event listener for react internal events
		eventManager.subscribe('showNotificationBubble', this.addBubble.bind(this));
		// event listener for server events
		eventManager.subscribe(
			'showNotificationBubbleEventNotified',
			this.addBubble.bind(this)
		);
	}

	addBubble(data?: EventDataObject) {
		if (!data) {
			return;
		}

		let bubbles: BubbleMessage[] = [...this.state.bubbles];
		bubbles.push(data as BubbleMessage);

		this.setState({
			bubbles: bubbles,
		});

		setTimeout(this.removeBubble.bind(this, data as BubbleMessage), 3000);
	}

	removeBubble(data: EventDataObject): void {
		let bubbles = this.state.bubbles;
		bubbles = bubbles.filter((el) => el !== data);
		this.setState({
			bubbles: bubbles,
		});
	}

	renderBubble(data: BubbleMessage, index: number): ReactNode {
		return (
			<div key={index} className={'bubble-notification bubble-' + data.type}>
				<span>{data.message}</span>
			</div>
		);
	}

	render(): ReactNode {
		return (
			<div id={'bubbleNotificationContainer'}>
				{this.state.bubbles.map(this.renderBubble.bind(this))}
			</div>
		);
	}
}
