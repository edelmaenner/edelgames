import React, { Component } from 'react';
import {
	NumberConfig,
	valueChangedCallback,
} from '@edelgames/types/src/app/ConfigurationTypes';
import { onEnterKeyEvent } from '../../../components/Inputs/InputUtils';

interface IProps {
	onValueChanged?: valueChangedCallback;
	onChangeFinished?: valueChangedCallback;
	name: string;
	config: NumberConfig;
	value: number;
	isValidState: boolean;
	allowEdit: boolean;
}

interface IState {
	error: null | string;
}

export default class NumberInput extends Component<IProps, IState> {
	state = {
		error: null,
	};
	elementRef = React.createRef<HTMLInputElement>();

	isNumeric(str: string) {
		return (
			!Number.isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
			!Number.isNaN(parseFloat(str))
		); // ...and ensure strings of whitespace fail
	}

	validateValue(value: number | string): false | number {
		const { step, min, max } = this.props.config;

		let numberValue;
		if (typeof value === 'number') {
			numberValue = value;
		} else {
			if (!this.isNumeric(value)) {
				return false; // ignore this completely
			}

			try {
				numberValue =
					step === 1
						? parseInt(value)
						: Number(parseFloat(value).toFixed(1 / (step || 1)));
			} catch (err) {
				this.setState({
					error: err as string,
				});
				return false;
			}
		}

		if (Number.isNaN(numberValue)) {
			this.setState({
				error: `Cannot read value ${value} as number`,
			});
			return false;
		}

		if (numberValue > max || numberValue < min) {
			this.setState({
				error: `Es sind nur Eingaben zwischen ${min} und ${max} erlaubt`,
			});
			return false;
		}

		this.setState({
			error: null,
		});
		return numberValue;
	}

	onNumberChanged(): void {
		if (!this.props.allowEdit) {
			return;
		}

		const value = this.elementRef.current?.value;

		if (!this.props.onValueChanged) {
			return;
		}

		if (value === undefined || value === null) {
			this.props.onValueChanged(this.props.config.min);
			return;
		}

		const validatedValue = this.validateValue(value);
		if (validatedValue !== false) {
			this.props.onValueChanged(value);
		}
	}

	onChangeFinished(): void {
		if (!this.props.allowEdit) {
			return;
		}

		const value = this.elementRef.current?.value;

		if (!this.props.onChangeFinished) {
			return;
		}

		if (value === undefined || value === null) {
			return;
		}

		const validatedValue = this.validateValue(value);
		if (validatedValue !== false) {
			this.props.onChangeFinished(validatedValue);
		}
	}

	render() {
		let classes = [];
		if (this.state.error) classes.push('has-error');
		if (this.props.isValidState) classes.push('is-valid');
		if (this.props.allowEdit) classes.push('is-disabled');

		return (
			<div className={'number-input-config'}>
				{this.state.error ? (
					<div className={'config-error-message'}>{this.state.error}</div>
				) : null}
				<input
					type={'number'}
					disabled={!this.props.allowEdit}
					min={this.props.config.min}
					max={this.props.config.max}
					step={this.props.config.step}
					ref={this.elementRef}
					className={classes.join(' ')}
					name={this.props.name}
					value={this.props.value || this.props.config.min}
					onChange={this.onNumberChanged.bind(this)}
					onKeyDown={onEnterKeyEvent.bind(
						null,
						this.onChangeFinished.bind(this)
					)}
				/>
			</div>
		);
	}
}
