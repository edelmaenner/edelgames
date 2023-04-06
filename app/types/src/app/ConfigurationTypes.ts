import { anyObject } from './BasicTypes';

export type NativeConfiguration = {
	isFullyConfigured: boolean;
	isPublicEditable: boolean;
	elements: NativeConfigurationElement[];
};

export type NativeConfigurationElement = {
	type: ConfigurationTypesDefs;
	customConfigName?: string;
	name: string;
	label: string;
	isValidState: boolean;
	minElements: number;
	maxElements: number;
	value: ConfigurationTypes;
	config: NativeConfigurationElementConfig;
};

export type NativeConfigurationElementConfig =
	| null
	| BooleanConfig
	| ColorConfig
	| NumberConfig
	| NumberRangeConfig
	| StringConfig
	| SelectOneConfig
	| anyObject;

export type SelectOneConfig = {
	options: SelectOption[];
};

export type ColorConfig = StringConfig & {
	allowedHexColors: string[];
};

export type BooleanConfig = {
	style: CheckboxStyleType;
};
export type CheckboxStyleType = 'checkbox' | 'switch';

export type NumberConfig = {
	min: number;
	max: number;
	step: number;
};

export type NumberRangeConfig = {
	min1: number;
	max1: number;
	min2: number;
	max2: number;
	step: number;
};

export type StringConfig = {
	allowedChars: string[];
	forbiddenChars: string[];
	minLength: number;
	maxLength: number;
	regexMatch: string | null;
};

export type ColorValue = {
	hex: string;
	rgb?: { r: number; g: number; b: number };
	rgba?: { r: number; g: number; b: number; a: number };
	hsl?: { h: number; s: number; l: number };
};

export type SelectOption = {
	label: string;
	value: string;
};

export type ConfigurationTypesDefs =
	| 'color'
	| 'string'
	| 'int'
	| 'float'
	| 'bool'
	| 'select'
	| 'custom';

export type ConfigurationTypesSingle =
	| null
	| string
	| number
	| boolean
	| anyObject;

export type ConfigurationTypes =
	| ConfigurationTypesSingle
	| ConfigurationTypesSingle[]
	| null;

export type valueChangedCallback = { (value: ConfigurationTypes): void };
