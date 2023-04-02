import React, { Component } from 'react';
import {
	BooleanConfig,
	valueChangedCallback,
} from '@edelgames/types/src/app/ConfigurationTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
	onValueChanged?: valueChangedCallback;
	name: string;
	config: BooleanConfig;
	value: boolean;
	allowEdit: boolean;
}

export default class BooleanInput extends Component<IProps, {}> {
	elementRef = React.createRef<HTMLInputElement>();

	onStatusChanged(): void {
		if (!this.props.allowEdit) {
			return;
		}

		const value = !!this.elementRef.current?.checked;

		if (this.props.onValueChanged) {
			this.props.onValueChanged(value);
		}
	}

	render() {
		return (
			<div className={'bool-input-config'}>
				<input
					type={'checkbox'}
					ref={this.elementRef}
					disabled={!this.props.allowEdit}
					className={'d-none'}
					id={'bool_input_' + this.props.name}
					name={this.props.name}
					checked={this.props.value || false}
					value={'ON'}
					onChange={this.onStatusChanged.bind(this)}
				/>
				<label
					htmlFor={'bool_input_' + this.props.name}
					className={'bool-input-type-' + this.props.config.style}
				>
					<FontAwesomeIcon
						icon={['fad', 'check']}
						size="2x"
						scale={1}
						transform={'0,0'}
						height={'2rem'}
					/>
				</label>
			</div>
		);
	}
}
