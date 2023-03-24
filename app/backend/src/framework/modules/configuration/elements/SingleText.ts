import ConfigElement from '../ConfigElement';
import {
	ConfigurationTypesDefs,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';

export default class SingleText extends ConfigElement {
	public getValueType(): ConfigurationTypesDefs {
		return 'string';
	}

	public allowEmptySelection(): boolean {
		return false;
	}

	public canHaveMultipleValues(): boolean {
		return false;
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return {
			allowedChars: [],
			forbiddenChars: [],
			maxLength: 20,
			minLength: 1,
		};
	}
}
