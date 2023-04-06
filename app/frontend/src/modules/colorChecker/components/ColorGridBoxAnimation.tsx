import { Component } from 'react';
import {
	ColorGrid,
	ColorGridCell,
	ColorGridColumn,
	Coordinate,
} from '@edelgames/types/src/modules/colorChecker/CCTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
	grid: ColorGrid;
	animationSteps?: Coordinate[];
	animationSpeed: number;
}

interface IState {
	animationFrame: number;
	animationCells: Coordinate[];
	playAnimation: boolean;
}

export default class ColorGridBoxAnimation extends Component<IProps, IState> {
	placeholderCoordinate: Coordinate = { x: -1, y: -1 };
	animationInterval: NodeJS.Timer | undefined = undefined;
	state = {
		animationFrame: 0,
		animationCells: [this.placeholderCoordinate],
		playAnimation: false,
	};

	componentDidMount() {
		if (this.props.animationSteps && this.props.animationSteps.length > 0) {
			this.animationInterval = setInterval(
				this.onAnimationTimerTick.bind(this),
				Math.min(100, this.props.animationSpeed)
			);
			this.setState({
				playAnimation: true,
			});
		}
	}

	componentWillUnmount() {
		clearInterval(this.animationInterval);
		this.animationInterval = undefined;
	}

	onAnimationTimerTick(): void {
		if (!this.props.animationSteps || !this.state.playAnimation) {
			return;
		}

		if (this.state.animationFrame >= this.props.animationSteps.length) {
			clearInterval(this.animationInterval);
			this.animationInterval = undefined;
			return;
		}

		this.setState({
			animationFrame: this.state.animationFrame + 1,
			animationCells: this.props.animationSteps.slice(
				0,
				this.state.animationFrame
			),
		});
	}

	render() {
		return (
			<div className={'color-grid-box-animation'}>
				<div className={'animated-grid'}>
					{this.props.grid.map(this.renderColumn.bind(this))}
				</div>
			</div>
		);
	}

	renderColumn(column: ColorGridColumn, x: number): JSX.Element {
		return (
			<div className={'animated-column'} key={'animated-column-' + x}>
				{column.map(this.renderCell.bind(this, x))}
			</div>
		);
	}

	renderCell(x: number, cell: ColorGridCell, y: number): JSX.Element {
		const isChecked = this.state.playAnimation
			? this.state.animationCells.find((el) => el.x === x && el.y === y) !==
			  undefined
			: cell.checked;

		return (
			<div
				className={'animated-cell'}
				key={`animated-cell-${x}-${y}`}
				style={{
					backgroundColor: cell.color,
				}}
			>
				{isChecked ? (
					<FontAwesomeIcon icon={['fad', 'xmark']} size="1x" />
				) : cell.isSpecial ? (
					<FontAwesomeIcon icon={['fad', 'star']} size="1x" />
				) : null}
			</div>
		);
	}
}
