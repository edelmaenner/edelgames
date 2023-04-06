import React, { Component } from 'react';
import {
	StringConfig,
	valueChangedCallback,
} from '@edelgames/types/src/app/ConfigurationTypes';
import { onEnterKeyEvent } from '../../../components/Inputs/InputUtils';

interface IProps {
	onValueChanged?: valueChangedCallback;
	onChangeFinished?: valueChangedCallback;
	name: string;
	config: StringConfig;
	value: string;
	isValidState: boolean;
	allowEdit: boolean;
}

interface IState {
	error: null | string;
}

export default class StringInput extends Component<IProps, IState> {
	state = {
		error: null,
	};

	elementRef = React.createRef<HTMLInputElement>();

	validateValue(value: string, finalCheck: boolean): boolean {
		const { minLength, maxLength, forbiddenChars, allowedChars, regexMatch } =
			this.props.config;

		if (value.length < minLength) {
			// its ok to start typing with less characters than required (will be checked serverside again)
			const errorMessage =
				maxLength === minLength
					? `Es sind nur Eingaben mit ${minLength} Zeichen erlaubt`
					: `Es sind nur Eingaben zwischen ${minLength} und ${maxLength} Zeichen erlaubt`;
			this.setState({
				error: errorMessage,
			});
			return !finalCheck;
		}

		if (value.length > maxLength) {
			const errorMessage =
				maxLength === minLength
					? `Es sind nur Eingaben mit ${minLength} Zeichen erlaubt`
					: `Es sind nur Eingaben zwischen ${minLength} und ${maxLength} Zeichen erlaubt`;

			this.setState({
				error: errorMessage,
			});
			return false;
		}

		if (forbiddenChars.length) {
			const match = value.match(`[${forbiddenChars.join()}]+`);

			if (match) {
				this.setState({
					error: `Der Text "${match[0]}" ist nicht erlaubt`,
				});
				return false;
			}
		}

		if (allowedChars.length) {
			const match = value.match(`[^${allowedChars.join()}]+`);

			if (match) {
				this.setState({
					error: `Der Text "${match[0]}" ist nicht erlaubt`,
				});
				return false;
			}
		}

		if (regexMatch !== null && value.match(regexMatch) === null) {
			this.setState({
				error: `Der Text entspricht nicht dem Format "${regexMatch}"`,
			});
			return false;
		}

		this.setState({
			error: null,
		});
		return true;
	}

	onTextChanged(): void {
		if (!this.props.allowEdit) {
			return;
		}

		const value = this.elementRef.current?.value;

		if (
			value === undefined ||
			value === null ||
			!this.props.onValueChanged ||
			!this.validateValue(value, false)
		) {
			return;
		}

		this.props.onValueChanged(value);
	}

	onChangeFinished(): void {
		if (!this.props.allowEdit) {
			return;
		}

		const value = this.elementRef.current?.value;

		if (
			value === undefined ||
			value === null ||
			!this.props.onChangeFinished ||
			!this.validateValue(value, true)
		) {
			return;
		}

		this.props.onChangeFinished(value);
	}

	render() {
		const hasValue = this.props.value !== null;
		const hasError = hasValue && this.state.error !== null;

		let classes = [];
		if (hasError) classes.push('has-error');
		if (this.props.isValidState) classes.push('is-valid');
		if (!this.props.allowEdit) classes.push('is-disabled');

		return (
			<div className={'string-input-config'}>
				{hasError ? (
					<div className={'config-error-message'}>{this.state.error}</div>
				) : null}
				<input
					type={'text'}
					ref={this.elementRef}
					disabled={!this.props.allowEdit}
					className={classes.join(' ')}
					name={this.props.name}
					value={this.props.value || ''}
					onKeyDown={onEnterKeyEvent.bind(
						null,
						this.onChangeFinished.bind(this)
					)}
					onBlur={this.onChangeFinished.bind(this)}
					onChange={this.onTextChanged.bind(this)}
				/>
			</div>
		);
	}
}
