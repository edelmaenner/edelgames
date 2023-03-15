import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
	remainingJokers: number;
	onJokerUse: { (isNumber: boolean): void };
	usingNumberJoker: boolean;
	usingColorJoker: boolean;
	canUseNumberJoker: boolean;
	canUseColorJoker: boolean;
}

interface IState {
	usedUpJokers: boolean[];
	currentJokerSelection: number;
}

export default class JokerList extends Component<IProps, IState> {
	state = {
		usedUpJokers: [...Array(10)].fill(false),
		currentJokerSelection: -1,
	};

	pageClickListener = this.onPageClicked.bind(this);
	jokerListRef = React.createRef<HTMLDivElement>();

	componentDidMount(): void {
		document.addEventListener('click', this.pageClickListener);
	}

	componentWillUnmount(): void {
		document.removeEventListener('click', this.pageClickListener);
	}

	onPageClicked(event: MouseEvent): void {
		let jokerList = this.jokerListRef.current;
		if (!jokerList || !(event.target instanceof Node)) {
			return;
		}
		let isJokerListClick = jokerList.contains(event.target);

		if (!isJokerListClick) {
			this.setState({
				currentJokerSelection: -1,
			});
		}
	}

	onJokerSelected(index: number, isNumber: boolean): void {
		let jokers = this.state.usedUpJokers;
		jokers[index] = true;
		this.setState({
			usedUpJokers: jokers,
			currentJokerSelection: -1
		});
		this.props.onJokerUse(isNumber);
	}

	onJokerClicked(index: number): void {
		const canUseJoker =
			this.props.canUseColorJoker || this.props.canUseNumberJoker;

		if (!this.state.usedUpJokers[index] && canUseJoker) {
			this.setState({
				currentJokerSelection: index,
			});
		}
	}

	render() {
		const isUsingJoker =
			this.props.usingColorJoker || this.props.usingNumberJoker;

		return (
			<div className={'joker-list'} ref={this.jokerListRef}>
				<div className={'joker-list-summary'}>
					{this.props.remainingJokers} /
					{this.state.usedUpJokers.length}
				</div>
				{this.state.usedUpJokers.map(this.renderJoker.bind(this))}
			</div>
		);
	}

	renderJoker(isUsed: boolean, index: number): JSX.Element {
		let classes = ['joker-field'];
		if (isUsed) {
			classes.push('joker-used');
			classes.push('clickable');
		} else if (this.props.canUseNumberJoker || this.props.canUseColorJoker) {
			classes.push('clickable');
		}

		return (
			<div
				className={classes.join(' ')}
				key={'joker_' + index}
				onClick={this.onJokerClicked.bind(this, index)}
			>
				{this.state.currentJokerSelection === index
					? this.renderJokerTypeSelection(index)
					: null}

				<FontAwesomeIcon icon={['fad', 'circle-exclamation']} size="2x" />
				{isUsed ? (
					<FontAwesomeIcon
						className={'joker-used-mark'}
						icon={['fad', 'xmark']}
						size="2x"
					/>
				) : null}
			</div>
		);
	}

	renderJokerTypeSelection(index: number): JSX.Element {
		return (
			<div className={'joker-type-selection'}>
				{this.props.canUseNumberJoker ? (
					<button
						className={'btn btn-secondary'}
						onClick={this.onJokerSelected.bind(this, index, true)}
					>
						Zahl
					</button>
				) : null}
				{this.props.canUseColorJoker ? (
					<button
						className={'btn btn-secondary'}
						onClick={this.onJokerSelected.bind(this, index, false)}
					>
						Farbe
					</button>
				) : null}
			</div>
		);
	}
}
