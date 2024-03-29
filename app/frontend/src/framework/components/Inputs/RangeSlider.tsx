import { Component } from 'react';

interface IProps {
	defaultValue: number;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	onChange: (value: number) => void;
	renderPreview?: (value: number) => JSX.Element | string | number;
}

interface IState {
	value: number;
}

// these are just frequently used examples
export const renderPreviewMethods = {
	percent: (value: number) => value + '%',
	seconds: (value: number) => value + 's',
};

export default class RangeSlider extends Component<IProps, IState> {
	static defaultProps = {
		renderPreview: (value: number) => value,
		min: 0,
		max: 100,
		step: 1,
		disabled: false,
	};

	state = {
		value: 0,
	};

	onChangeSlider(value: number): void {
		this.setState({
			value: value,
		});
		this.props.onChange(value);
	}

	componentDidMount() {
		this.setState({
			value: this.props.defaultValue,
		});
	}

	render() {
		let value = this.state?.value ?? this.props.defaultValue;
		value = this.props.disabled ? this.props.defaultValue : value;

		return (
			<div className={'range-slider'}>
				<input
					type={'range'}
					min={this.props.min}
					max={this.props.max}
					step={this.props.step}
					disabled={this.props.disabled}
					value={value}
					onChange={(event) =>
						this.onChangeSlider(parseInt(event.target.value))
					}
				/>

				<span className={'output-preview'}>
					{this.props.renderPreview ? (
						this.props.renderPreview(value)
					) : (
						<span>{value}</span>
					)}
				</span>
			</div>
		);
	}
}
