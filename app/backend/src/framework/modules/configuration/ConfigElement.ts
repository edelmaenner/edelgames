import {
	ConfigurationTypes,
	ConfigurationTypesDefs,
	ConfigurationTypesSingle,
	NativeConfigurationElement,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';

export default abstract class ConfigElement {
	private value: ConfigurationTypes = null;
	private name: string;
	private label: string;

	constructor(
		configName: string,
		label: string,
		initialValue: ConfigurationTypes = null
	) {
		this.name = configName;
		this.value = initialValue;
		this.label = label;
	}

	public setValue(value: ConfigurationTypes): void {
		const validationResult = this.validateValue(value, true);
		// ensure multiple value elements always contain an array
		if (this.canHaveMultipleValues() && !Array.isArray(value)) {
			value = [value];
		}

		if (validationResult === true) {
			this.value = value;
			return;
		}
		throw new Error(validationResult);
	}

	public getValue(): ConfigurationTypes {
		return this.value;
	}

	public getName(): string {
		return this.name;
	}

	public getLabel(): string {
		return this.label;
	}

	private validateValue(
		value: ConfigurationTypes,
		allowArray: boolean
	): true | string {
		if (value === null) {
			return this.allowEmptySelection()
				? true
				: 'Cannot assign null to non empty field';
		}

		if (Array.isArray(value)) {
			if (!allowArray) {
				return 'Cannot have nested array as config value';
			}

			if (value.length === 0 && this.allowEmptySelection()) {
				return true; // empty array
			}
			return this.validateValue(value[0], false);
		}

		switch (this.getValueType()) {
			case 'bool':
				return (
					typeof value === 'boolean' ||
					'Cannot assign non boolean value to bool config'
				);
			case 'string':
				return (
					typeof value === 'string' ||
					'Cannot assign non string value to string config'
				);
			case 'int':
				return (
					Number.isInteger(value) || 'Cannot assign non int value to int config'
				);
			case 'float':
				return (
					!Number.isNaN(value) ||
					'Cannot assign non numeric value to float config'
				);
			case 'object':
				return (
					typeof value === 'object' ||
					'Cannot assign non object value to object config'
				);
		}

		return `Config element ${this.name} has an invalid value type!`;
	}

	public isConfigured(): boolean {
		return !!this.getValue() || this.allowEmptySelection();
	}

	public toNativeObject(): NativeConfigurationElement {
		return {
			type: this.getValueType(),
			name: this.getName(),
			label: this.getLabel(),
			value: this.getValue(),
			multiple: this.canHaveMultipleValues(),
			isConfigured: this.isConfigured(),
			allowEmpty: this.allowEmptySelection(),
			config: this.getElementConfig(),
		};
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return null;
	}

	public abstract getValueType(): ConfigurationTypesDefs;

	public abstract allowEmptySelection(): boolean;

	public abstract canHaveMultipleValues(): boolean;
}
