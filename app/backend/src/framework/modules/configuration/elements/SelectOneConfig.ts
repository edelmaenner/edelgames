import ConfigElement from '../ConfigElement';
import {
	ConfigurationTypes,
	ConfigurationTypesDefs,
	NativeConfigurationElementConfig,
	SelectOption,
} from '@edelgames/types/src/app/ConfigurationTypes';

export default class SelectOneConfig extends ConfigElement {
	options: SelectOption[];

	constructor(
		configName: string,
		label: string,
		options: SelectOption[],
		initialOptionIndex = 0
	) {
		if (options.length < 1) {
			throw new Error(
				'At least one option is required for a select one config'
			);
		}

		let initialValue = options[0].value;
		if (initialOptionIndex < options.length) {
			initialValue = options[initialOptionIndex].value;
		}

		super(configName, label, initialValue);
		this.options = options;
	}

	public getValueType(): ConfigurationTypesDefs {
		return 'select';
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return {
			options: this.options,
		};
	}

	public isValueMatchingConfig(value: ConfigurationTypes): boolean {
		if (typeof value !== 'string') {
			return false;
		}

		return this.options.find((el) => el.value === value) !== undefined;
	}

	public allowElementQuantityChanges() {
		return false;
	}
}
