import React from 'react';
import {
	BooleanConfig,
	ConfigurationTypes,
	NativeConfiguration,
	NativeConfigurationElement,
	NumberConfig, SelectOneConfig,
	StringConfig,
	valueChangedCallback,
} from '@edelgames/types/src/app/ConfigurationTypes';
import roomManager from '../../util/RoomManager';
import StringInput from './elements/StringInput';
import NumberInput from './elements/NumberInput';
import MultiElementWrapper from './elements/MultiElementWrapper';
import BooleanInput from './elements/BooleanInput';
import socketManager from '../../util/SocketManager';
import ProfileManager from '../../util/ProfileManager';
import eventManager from '../../util/EventManager';
import SelectOneInput from "./elements/SelectOneInput";

interface IProps {
	configuration: NativeConfiguration;
}

export default class ConfigRoom extends React.Component<IProps, {}> {
	onConfigurationFinished(): void {
		if (!this.props.configuration.isFullyConfigured) {
			return;
		}

		socketManager.sendEvent('gameConfigFinished', {});
	}

	onValueChanged(
		element: NativeConfigurationElement,
		newValue: ConfigurationTypes
	): void {
		if (!roomManager.isInConfigEditingMode()) {
			return;
		}

		if (
			!ProfileManager.isRoomMaster() &&
			!this.props.configuration.isPublicEditable
		) {
			return;
		}

		this.props.configuration.elements = this.props.configuration.elements.map(
			(configElement) => {
				if (configElement.name === element.name) {
					configElement.value = newValue;
				}
				return configElement;
			}
		);
		this.setState({});

		socketManager.sendEvent('gameConfigEdited', {
			changedValueName: element.name,
			newValue: newValue,
		});
	}

	onPubliclyChanged(newState: ConfigurationTypes): void {
		this.props.configuration.isPublicEditable = true;

		socketManager.sendEvent('gameConfigPubliclyStateChanged', {
			newVisibilityState: !!newState
		});
	}

	render() {
		const isRoomMaster = ProfileManager.isRoomMaster();
		// const canBeEdited = isRoomMaster || this.props.configuration.isPublicEditable;

		return (
			<div id="screenConfigRoom">

				<div className={'config-header'}>
					<div className={'config-title'}>Konfiguration</div>

					{isRoomMaster ? (
						<div
							className={'config-public-switch'}
							title={'Erlaube anderen Spielern, selbst die Konfiguration zu bearbeiten'}
						>
							<BooleanInput
								onValueChanged={this.onPubliclyChanged.bind(this)}
								name={''}
								config={{style: "switch"}}
								value={this.props.configuration.isPublicEditable}
								allowEdit={true}
							/>
						</div>
					) : null}
				</div>

				<div className={'config-elements'}>
					{this.props.configuration.elements.map(this.renderElement.bind(this))}
				</div>

				{isRoomMaster ? (
					<div className={'config-footer btn'}>
						<button
							onClick={this.onConfigurationFinished.bind(this)}
							disabled={!this.props.configuration.isFullyConfigured}
						>
							Anwenden und Spiel beginnen
						</button>
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
		const allowEdit =
			this.props.configuration.isPublicEditable ||
			ProfileManager.isRoomMaster();

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
							allowEdit={allowEdit}
						/>
					) : (
						this.renderConfigurationForType(
							element,
							this.onValueChanged.bind(this, element),
							this.onValueChanged.bind(this, element),
							allowEdit
						)
					)}
				</div>
			</div>
		);
	}

	renderConfigurationForType(
		element: NativeConfigurationElement,
		onValueChangedCallback: valueChangedCallback,
		onChangeFinishedCallback: valueChangedCallback | undefined,
		allowEdit: boolean
	): JSX.Element {
		switch (element.type) {
			case 'string':
				return (
					<StringInput
						onChangeFinished={onChangeFinishedCallback}
						onValueChanged={onValueChangedCallback}
						name={element.name}
						config={element.config as StringConfig}
						value={element.value as string}
						isValidState={element.isValidState}
						allowEdit={allowEdit}
					/>
				);
			case 'float':
				return (
					<NumberInput
						onChangeFinished={onChangeFinishedCallback}
						onValueChanged={onValueChangedCallback}
						name={element.name}
						config={element.config as NumberConfig}
						value={element.value as number}
						isValidState={element.isValidState}
						allowEdit={allowEdit}
					/>
				);
			case 'int':
				return (
					<NumberInput
						onChangeFinished={onChangeFinishedCallback}
						onValueChanged={onValueChangedCallback}
						name={element.name}
						config={element.config as NumberConfig}
						value={element.value as number}
						isValidState={element.isValidState}
						allowEdit={allowEdit}
					/>
				);
			case 'bool':
				return (
					<BooleanInput
						onValueChanged={onValueChangedCallback}
						name={element.name}
						config={element.config as BooleanConfig}
						value={element.value as boolean}
						allowEdit={allowEdit}
					/>
				);
			case 'select':
				return (
					<SelectOneInput
						onValueChanged={onValueChangedCallback}
						name={element.name}
						config={element.config as SelectOneConfig}
						value={element.value as string}
						isValidState={element.isValidState}
						allowEdit={allowEdit}
					/>
				);
			case 'custom':
				const renderData = {
					render: null,
				};

				if (element.customConfigName) {
					const customRenderType = element.customConfigName as string;
					// send an event to fill in the render property
					eventManager.publish(
						'game_config_render_' + customRenderType,
						renderData
					);
					// display the rendered object or a fallback text
					if (renderData.render) {
						return renderData.render;
					}
				}
				return (
					<span>Could not find matching element for type {element.type}</span>
				);
			default:
				return (
					<span>Could not find matching element for type {element.type}</span>
				);
		}
	}
}
