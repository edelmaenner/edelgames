export type NativeConfiguration = {
	isFullyConfigured: boolean;
	isPublicEditable: boolean;
	elements: NativeConfigurationElement[];
};

export type NativeConfigurationElement = {
	type: ConfigurationTypesDefs;
	name: string;
	label: string;
	multiple: boolean;
	allowEmpty: boolean;
	value: ConfigurationTypes;
	isConfigured: boolean;
	config: NativeConfigurationElementConfig;
};

export type NativeConfigurationElementConfig =
	| null
	| NumberRangeConfig
	| StringConfig;

export type NumberRangeConfig = {
	min: number;
	max: number;
	step: number;
};

export type StringConfig = {
	allowedChars: string[];
	forbiddenChars: string[];
	minLength: number;
	maxLength: number;
};

export type ConfigurationTypesDefs =
	| 'string'
	| 'int'
	| 'float'
	| 'bool'
	| 'object';
export type ConfigurationTypesSingle = null | string | number | object;
export type ConfigurationTypes =
	| ConfigurationTypesSingle
	| ConfigurationTypesSingle[]
	| null;
