import ConfigElement from '../ConfigElement';
import {
	ConfigurationTypes,
	ConfigurationTypesDefs,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';
import FloatConfig from './FloatConfig';

export default class IntegerConfig extends FloatConfig {
	constructor(
		configName: string,
		label: string,
		min: number,
		max: number,
		initialValue = 0
	) {
		super(configName, label, min, max, 1, initialValue);
	}

	public getValueType(): ConfigurationTypesDefs {
		return 'int';
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return {
			min: this.min,
			max: this.max,
			step: 1,
		};
	}

	protected adjustValueBeforeSave(
		value: ConfigurationTypes
	): ConfigurationTypes {
		if (typeof value === 'string') {
			return parseInt(value);
		}
		return value;
	}

	public isValueMatchingConfig(value: ConfigurationTypes): boolean {
		return super.isValueMatchingConfig(value);
	}
}
