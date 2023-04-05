import ConfigElement from '../ConfigElement';
import {
	ConfigurationTypes,
	ConfigurationTypesDefs,
	NativeConfigurationElementConfig,
} from '@edelgames/types/src/app/ConfigurationTypes';
import { alphabet, punctuation, whitespace } from './Collections';

export default class StringConfig extends ConfigElement {
	allowedCharacters: string[];
	forbiddenCharacters: string[];
	minLength: number;
	maxLength: number;
	regexMatch: string | null;

	constructor(
		configName: string,
		label: string,
		allowedCharacters: string[] = [...alphabet, ...whitespace],
		forbiddenCharacters: string[] = punctuation,
		minLength = 1,
		maxLength = 99,
		regexMatch: string | null = null,
		initialValue = ''
	) {
		super(configName, label, initialValue);
		this.allowedCharacters = allowedCharacters;
		this.forbiddenCharacters = forbiddenCharacters;
		this.minLength = minLength;
		this.maxLength = maxLength;
		this.regexMatch = regexMatch;
	}

	public getValueType(): ConfigurationTypesDefs {
		return 'string';
	}

	public getElementConfig(): NativeConfigurationElementConfig {
		return {
			allowedChars: this.allowedCharacters,
			forbiddenChars: this.forbiddenCharacters,
			maxLength: this.maxLength,
			minLength: this.minLength,
			regexMatch: this.regexMatch,
		};
	}

	public isValueMatchingConfig(value: ConfigurationTypes): boolean {
		if (typeof value !== 'string') {
			return false;
		}

		return (
			value.length >= this.minLength &&
			value.length <= this.maxLength &&
			(this.regexMatch === null || value.match(this.regexMatch) !== null) &&
			(this.allowedCharacters.length === 0 ||
				value.match(`[^${this.allowedCharacters.join()}]`) === null) &&
			(this.forbiddenCharacters.length === 0 ||
				value.match(`[${this.forbiddenCharacters.join()}]`) === null)
		);
	}
}
