import React, { Component } from 'react';
import {
	ConfigurationTypesSingle,
	NativeConfigurationElement,
	valueChangedCallback,
} from '@edelgames/types/src/app/ConfigurationTypes';
import { anyObject } from '@edelgames/types/src/app/BasicTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
	valueChangedCallback: valueChangedCallback;
	elementRenderCallback: {
		(
			element: NativeConfigurationElement,
			callback: valueChangedCallback,
			finishedCallback: valueChangedCallback,
			allowEdit: boolean
		): JSX.Element;
	};
	element: NativeConfigurationElement;
	allowEdit: boolean;
}

interface IState {
	currentElement: ConfigurationTypesSingle;
}

/**
 * When creating a custom object type configuration, make sure it implements a "render" property or method,
 * so it can be displayed correctly by the multi element wrapper
 */
export default class MultiElementWrapper extends Component<IProps, IState> {
	state = {
		currentElement: null,
	};

	onSingleValueRemoved(index: number): void {
		if(!this.props.allowEdit) {
			return;
		}

		const oldList = Array.isArray(this.props.element.value) ? this.props.element.value : [];

		let elementList = [...(oldList as ConfigurationTypesSingle[])];
		elementList.splice(index, 1);

		if(elementList.length >= this.props.element.minElements && elementList.length <= this.props.element.maxElements) {
			this.props.element.value = elementList;
			this.props.valueChangedCallback(elementList);
		}
	}

	onSingleValueAdded(value: ConfigurationTypesSingle): void {
		if(!this.props.allowEdit) {
			return;
		}

		const oldList = Array.isArray(this.props.element.value) ? this.props.element.value : [];

		let elementList = [...(oldList  as ConfigurationTypesSingle[])];
		elementList.push(value);

		if(elementList.length >= this.props.element.minElements && elementList.length <= this.props.element.maxElements) {
			this.props.element.value = elementList;
			this.props.valueChangedCallback(elementList);
			this.setState({
				currentElement: null
			});
		}
	}

	onCurrentValueChanged(value: ConfigurationTypesSingle): void {
		if(!this.props.allowEdit) {
			return;
		}

		this.setState({
			currentElement: value,
		});
	}


	render() {
		let tempElement = {
			...this.props.element
		};
		tempElement.value = this.state.currentElement;

		const elements = Array.isArray(this.props.element.value) ? this.props.element.value as ConfigurationTypesSingle[] : [];

		return (
			<div className={'multi-element-wrapper'}>
				<div className={'multi-element-input'}>
					{this.props.elementRenderCallback(
						tempElement,
						this.onCurrentValueChanged.bind(this),
						this.onSingleValueAdded.bind(this),
						this.props.allowEdit
					)}
				</div>
				<div className={'multi-element-list'}>
					{elements.map((element, index) => (
						<span
							key={'multi_element_item_' + index}
							className={'multi-element-item'}
						>
							{this.valueToJsx(element)}

							<FontAwesomeIcon
								icon={['fad', 'xmark']}
								size="1x"
								className={'clickable ' + (this.props.allowEdit ? '' : 'd-none')}
								onClick={this.onSingleValueRemoved.bind(this, index)}
							/>
						</span>
					))}
					{elements.length === 0 ? (
						<span className={'multi-element-item'}>Nichts ausgewählt</span>
					) : null}
				</div>
			</div>
		);
	}

	valueToJsx(
		value: ConfigurationTypesSingle
	): JSX.Element | string | number | null {

		if (value === null) {
			return '???';
		}

		switch (typeof value) {
			case "string":
			case "number":
			case "undefined":
				return value;
			case "object":
				if (!Object.hasOwn(value, 'render')) {
					return JSON.stringify(value);
				}
				value = value as displayableObject;

				if (typeof value.render === 'function') {
					return value.render();
				}
				return value.render;
			case "boolean":
				return value ? 'ON' : 'OFF';
			default:
				return '???';
		}
	}
}

export type displayableObject = anyObject & {
	render: { (): JSX.Element | string | number } | string | number;
};
