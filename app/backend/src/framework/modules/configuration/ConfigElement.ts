import {
	ConfigurationTypes,
	ConfigurationTypesDefs,
	NativeConfigurationElement,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';

export default abstract class ConfigElement {
	private readonly name: string;
	private readonly label: string;
	private value: ConfigurationTypes = null;
	private minElements = 1;
	private maxElements = 1;

	protected constructor(
		configName: string,
		label: string,
		initialValue: ConfigurationTypes = null
	) {
		this.name = configName;
		this.value = initialValue;
		this.label = label;
	}

	public changeAllowedQuantities(min: number, max: number): this {
		if (!this.allowElementQuantityChanges()) {
			throw new Error(
				`Cannot change quantity of the element "${this.getName()}"`
			);
		}

		if (min > max) {
			throw new Error('Cannot have higher minimum than maximum');
		}
		this.minElements = min;
		this.maxElements = max;
		return this;
	}

	public setValue(value: ConfigurationTypes): void {
		let validationResult;
		if (this.canHaveMultipleValues()) {
			// ensure multiple value elements always contain an array
			if (!Array.isArray(value)) {
				value = [value];
			}

			validationResult = this.validateMultipleValue(value);
		} else {
			validationResult = this.validateSingleValue(value);
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

	private validateMultipleValue(value: ConfigurationTypes): true | string {
		if (!Array.isArray(value)) {
			return 'Cannot assign single value to multi element configuration';
		}

		if (value.length < this.minElements) {
			return 'Cannot store less elements than required';
		}

		if (value.length > this.maxElements) {
			return 'Cannot store more elements than allowed';
		}

		// validate every child element
		for (const element of value) {
			const elementValidation = this.validateSingleValue(element);
			if (elementValidation !== true) {
				return elementValidation;
			}
		}

		return true;
	}

	private validateSingleValue(value: ConfigurationTypes): true | string {
		if (value === null) {
			return this.isValueMatchingConfig(value)
				? true
				: 'Cannot assign null to non empty field';
		}

		if (Array.isArray(value)) {
			return 'Cannot have array as single config value';
		}

		if (!this.isValueMatchingConfig(value)) {
			return 'Cannot assign value conflicting with individual configuration';
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

	public isValidState(): boolean {
		if (this.canHaveMultipleValues()) {
			return this.validateMultipleValue(this.value) === true;
		}
		return this.validateSingleValue(this.value) === true;
	}

	public toNativeObject(): NativeConfigurationElement {
		return {
			type: this.getValueType(),
			name: this.getName(),
			label: this.getLabel(),
			value: this.getValue(),
			minElements: this.minElements,
			maxElements: this.maxElements,
			isValidState: this.isValidState(),
			config: this.getElementConfig(),
		};
	}

	public canBeEmpty(): boolean {
		return this.minElements === 0;
	}

	public canHaveMultipleValues(): boolean {
		return this.maxElements > 1;
	}

	public allowElementQuantityChanges(): boolean {
		return true;
	}

	public abstract getElementConfig(): NativeConfigurationElementConfig;

	public abstract getValueType(): ConfigurationTypesDefs;

	public abstract isValueMatchingConfig(value: ConfigurationTypes): boolean;
}
