import React, { Component } from 'react';

interface IProps {
	id: number;
	nextRollResult: number;
	rollCount: number;
	backdropColor?: string;
	onDiceRolled?: { (): void };
	onDiceClicked?: { (diceId: number): void };
	style?: React.CSSProperties;
	customProps?: { [key: string]: any };
}

export default class Dice extends Component<IProps, {}> {
	static defaultProps: Partial<IProps> = {
		onDiceClicked: (diceId: number) => {},
	};

	diceType: string = 'default';

	lastRollCount: number = 0; // how many times the dice value has changed

	onDiceClicked(): void {
		if (this.props.onDiceClicked) {
			this.props.onDiceClicked(this.props.id);
		}
	}

	render() {
		if (this.lastRollCount !== this.props.rollCount) {
			this.lastRollCount = this.props.rollCount;
			if (this.props.onDiceRolled) {
				this.props.onDiceRolled();
			}
		}

		// switch between animations to cause a rapid spinning
		let rollClass = this.lastRollCount % 2 === 0 ? 'even' : 'odd';

		let displayFilter: React.CSSProperties = {
			filter: this.props.backdropColor
				? `drop-shadow(0 0 0.8rem ${this.props.backdropColor})`
				: 'initial',
			borderColor: this.props.backdropColor ? this.props.backdropColor : 'none', // none is not a valid value for borderColor, thus it disables the inline css
		};

		let classes = ['dice', 'dice-type-' + this.diceType];
		if (this.props.onDiceClicked) {
			classes.push('clickable');
		}
		if (this.props.backdropColor) {
			classes.push('is-highlighted');
		}

		return (
			<div
				className={classes.join(' ')}
				style={{
					...this.props.style,
					...displayFilter,
				}}
				onClick={this.onDiceClicked.bind(this)}
			>
				<ol
					className={`die-list ${rollClass}-roll`}
					data-roll={this.props.nextRollResult}
				>
					{[...Array(6)].map((el, index) => this.renderSide(index + 1))}
				</ol>
			</div>
		);
	}

	renderSide(dotCount: number): JSX.Element {
		return (
			<li
				className={'die-item'}
				data-side={dotCount}
				key={'dice_side_' + dotCount}
			>
				{[...Array(dotCount)].map((el, index) => (
					<span
						className="dot"
						key={'dice_side_' + dotCount + '_dot_' + index}
					></span>
				))}
			</li>
		);
	}
}
