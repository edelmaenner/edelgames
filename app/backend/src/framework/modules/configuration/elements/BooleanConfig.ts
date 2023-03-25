import ConfigElement from '../ConfigElement';
import {
	CheckboxStyleType,
	ConfigurationTypes,
	ConfigurationTypesDefs,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';

export default class BooleanConfig extends ConfigElement {
	style: CheckboxStyleType;

	constructor(
		configName: string,
		label: string,
		initialValue = false,
		style: CheckboxStyleType = 'switch'
	) {
		super(configName, label, initialValue);
		this.style = style;
	}

	public getValueType(): ConfigurationTypesDefs {
		return 'bool';
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return {
			style: this.style,
		};
	}

	public isValueMatchingConfig(value: ConfigurationTypes): boolean {
		return typeof value !== 'boolean';
	}

	public allowElementQuantityChanges() {
		return false;
	}
}
