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
			reactToBlur: boolean
		): JSX.Element;
	};
	element: NativeConfigurationElement;
}

interface IState {
	elements: ConfigurationTypesSingle[];
	currentElement: ConfigurationTypesSingle;
}

/**
 * When creating a custom object type configuration, make sure it implements a "render" property or method,
 * so it can be displayed correctly by the multi element wrapper
 */
export default class MultiElementWrapper extends Component<IProps, IState> {
	state = {
		elements: [] as ConfigurationTypesSingle[],
		currentElement: null,
	};

	onSingleValueRemoved(index: number): void {
		let elementList = this.state.elements;
		elementList.splice(index, 1);
		this.setState({
			elements: elementList,
		});
		this.props.valueChangedCallback(elementList);
	}

	onSingleValueChanged(value: ConfigurationTypesSingle): boolean {
		let elementList = this.state.elements;
		elementList.push(value);

		this.setState({
			elements: elementList,
		});
		this.props.valueChangedCallback(elementList);
		return true;
	}

	render() {
		return (
			<div className={'multi-element-wrapper'}>
				<div className={'multi-element-input'}>
					{this.props.elementRenderCallback(
						this.props.element,
						this.onSingleValueChanged.bind(this),
						false
					)}
				</div>
				<div className={'multi-element-list'}>
					{this.state.elements.map((element, index) => (
						<span
							key={'multi_element_item_' + index}
							className={'multi-element-item'}
						>
							{this.valueToJsx(element)}

							<FontAwesomeIcon
								icon={['fad', 'xmark']}
								size="1x"
								className={'clickable'}
								onClick={this.onSingleValueRemoved.bind(this, index)}
							/>
						</span>
					))}
					{this.state.elements.length === 0 ? (
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

		if (typeof value === 'object') {
			if (!Object.hasOwn(value, 'render')) {
				return JSON.stringify(value);
			}
			value = value as displayableObject;

			if (typeof value.render === 'function') {
				return value.render();
			}
			return value.render;
		}

		if (typeof value === 'boolean') {
			return value ? 'ON' : 'OFF';
		}

		return value;
	}
}

export type displayableObject = anyObject & {
	render: { (): JSX.Element | string | number } | string | number;
};
