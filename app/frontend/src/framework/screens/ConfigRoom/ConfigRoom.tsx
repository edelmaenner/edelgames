import React from 'react';
import {
	BooleanConfig,
	ConfigurationTypes,
	NativeConfiguration,
	NativeConfigurationElement,
	NumberConfig,
	StringConfig,
	valueChangedCallback,
} from '@edelgames/types/src/app/ConfigurationTypes';
import roomManager from '../../util/RoomManager';
import StringInput from './elements/StringInput';
import NumberInput from './elements/NumberInput';
import MultiElementWrapper from './elements/MultiElementWrapper';
import BooleanInput from './elements/BooleanInput';

interface IProps {
	configuration: NativeConfiguration;
}

export default class ConfigRoom extends React.Component<IProps, {}> {
	canBeEdited: boolean = false;

	onValueChanged(
		element: NativeConfigurationElement,
		newValue: ConfigurationTypes
	): boolean {
		console.log(element.name, newValue);
		return false;
	}

	render() {
		const isRoomMaster = !!roomManager.getRoomMaster()?.isRoomMaster();
		this.canBeEdited =
			isRoomMaster || this.props.configuration.isPublicEditable;

		return (
			<div id="screenConfigRoom">
				<div className={'config-title'}>Konfiguration</div>

				<div className={'config-elements'}>
					{this.props.configuration.elements.map(this.renderElement.bind(this))}
				</div>

				{isRoomMaster ? (
					<div className={'config-footer btn'}>
						<button>Anwenden und Spiel beginnen</button>
					</div>
				) : null}
			</div>
		);
	}

	renderElement(
		element: NativeConfigurationElement,
		index: number
	): JSX.Element {
		const isMultiElement = element.maxElements > 1;

		return (
			<div
				key={'config_element_' + element.name + '_' + index}
				className={
					'config-element config-element-' +
					(isMultiElement ? 'multi' : 'single')
				}
			>
				<div className={'config-element-label'}>{element.label}</div>
				<div className={'config-element-body'}>
					{isMultiElement ? (
						<MultiElementWrapper
							valueChangedCallback={this.onValueChanged.bind(this, element)}
							elementRenderCallback={this.renderConfigurationForType.bind(this)}
							element={element}
						/>
					) : (
						this.renderConfigurationForType(
							element,
							this.onValueChanged.bind(this, element),
							true
						)
					)}
				</div>
			</div>
		);
	}

	renderConfigurationForType(
		element: NativeConfigurationElement,
		onValueChangedCallback: valueChangedCallback,
		reactToBlur: boolean
	): JSX.Element {
		switch (element.type) {
			case 'string':
				return (
					<StringInput
						onChangeFinished={onValueChangedCallback}
						onValueChanged={reactToBlur ? onValueChangedCallback : undefined}
						name={element.name}
						config={element.config as StringConfig}
						initialValue={element.value as string}
					/>
				);
			case 'float':
				return (
					<NumberInput
						onChangeFinished={onValueChangedCallback}
						onValueChanged={reactToBlur ? onValueChangedCallback : undefined}
						name={element.name}
						config={element.config as NumberConfig}
						initialValue={element.value as number}
					/>
				);
			case 'int':
				return (
					<NumberInput
						onChangeFinished={onValueChangedCallback}
						onValueChanged={reactToBlur ? onValueChangedCallback : undefined}
						name={element.name}
						config={element.config as NumberConfig}
						initialValue={element.value as number}
					/>
				);
			case 'bool':
				return (
					<BooleanInput
						onChangeFinished={onValueChangedCallback}
						onValueChanged={reactToBlur ? onValueChangedCallback : undefined}
						name={element.name}
						config={element.config as BooleanConfig}
						initialValue={element.value as boolean}
					/>
				);
			default:
				return (
					<span>Could not find matching element for type {element.type}</span>
				);
		}
	}
}
