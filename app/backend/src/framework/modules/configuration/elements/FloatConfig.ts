import ConfigElement from '../ConfigElement';
import {
	ConfigurationTypes,
	ConfigurationTypesDefs,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';

export default class FloatConfig extends ConfigElement {
	min: number;
	max: number;
	step: number;

	constructor(
		configName: string,
		label: string,
		min: number,
		max: number,
		step = 0.1,
		initialValue = 0
	) {
		super(configName, label, initialValue);
		this.min = min;
		this.max = max;
		this.step = step;
	}

	public getValueType(): ConfigurationTypesDefs {
		return 'float';
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return {
			min: this.min,
			max: this.max,
			step: this.step,
		};
	}

	public isValueMatchingConfig(value: ConfigurationTypes): boolean {
		if (typeof value !== 'number') {
			return false;
		}

		return value >= this.min && value <= this.max;
	}
}
