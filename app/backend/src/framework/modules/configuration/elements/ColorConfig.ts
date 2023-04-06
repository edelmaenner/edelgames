import ConfigElement from '../ConfigElement';
import {
	ColorValue,
	ConfigurationTypes,
	ConfigurationTypesDefs,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';
import { hexadecimal } from './Collections';

export default class ColorConfig extends ConfigElement {
	allowedHexColors: string[];

	constructor(
		configName: string,
		label: string,
		allowedHexColors: string[] = [],
		initialValue = '#ffffff'
	) {
		super(configName, label, initialValue);
		this.allowedHexColors = allowedHexColors;
	}

	public getValueType(): ConfigurationTypesDefs {
		return 'string';
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return {
			allowedChars: [...hexadecimal, '#'],
			forbiddenChars: [],
			minLength: 7,
			maxLength: 7,
			regexMatch: null,
			allowedHexColors: this.allowedHexColors,
		};
	}

	public isValueMatchingConfig(value: ConfigurationTypes): boolean {
		if (typeof value !== 'string') {
			return false;
		}

		if (
			this.allowedHexColors.length &&
			!this.allowedHexColors.includes(value)
		) {
			return false;
		}

		return !(value.length !== 7 && value[0] !== '#');
	}
}
