import React, { Component } from 'react';
import {
	SelectOneConfig,
	valueChangedCallback,
} from '@edelgames/types/src/app/ConfigurationTypes';

interface IProps {
	onValueChanged: valueChangedCallback;
	name: string;
	config: SelectOneConfig;
	value: string;
	isValidState: boolean;
	allowEdit: boolean;
}

export default class SelectOneInput extends Component<IProps, {}> {
	elementRef = React.createRef<HTMLSelectElement>();

	onSelectionChanged(): void {
		if (!this.props.allowEdit) {
			return;
		}

		const value = this.elementRef.current?.value;
		if (value) {
			this.props.onValueChanged(value);
		}
	}

	render() {
		let classes = [];
		if (this.props.isValidState) classes.push('is-valid');
		if (!this.props.allowEdit) classes.push('is-disabled');

		return (
			<div className={'select-one-input-config'}>
				<select
					ref={this.elementRef}
					disabled={!this.props.allowEdit}
					name={this.props.name}
					className={classes.join(' ')}
					onChange={this.onSelectionChanged.bind(this)}
					value={this.props.value}
				>
					{this.props.config.options.map((option) => (
						<option value={option.value}>{option.label}</option>
					))}
				</select>
			</div>
		);
	}
}
