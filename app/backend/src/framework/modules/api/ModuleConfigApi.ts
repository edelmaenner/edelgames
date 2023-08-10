import ModuleConfig from '../configuration/ModuleConfig';
import { anyObject } from '@edelgames/types/src/app/BasicTypes';
import { ConfigurationTypes } from '@edelgames/types/src/app/ConfigurationTypes';

/**
 * @description This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleConfigApi {
	private readonly moduleConfig: ModuleConfig;

	constructor(moduleConfig: ModuleConfig) {
		this.moduleConfig = moduleConfig;
	}

	/**
	 * Returns the complete internal representation of the configuration context
	 * @internal
	 */
	getInternalConfiguration(): ModuleConfig {
		return this.moduleConfig;
	}

	/**
	 * Returns the configured value for elements, regardless of the type
	 * @param name
	 * @param fallback
	 */
	public getConfigValue(
		name: string,
		fallback: string | number | anyObject | undefined = undefined
	): ConfigurationTypes | undefined {
		const element = this.moduleConfig.getElementByName(name);
		return element ? element.getValue() : fallback;
	}

	/**
	 * Returns the configured value for elements with a single number
	 * @param name
	 * @param fallback
	 */
	public getSingleNumberConfigValue(
		name: string,
		fallback: number | undefined = undefined
	): number | undefined {
		const element = this.moduleConfig.getElementByName(name);
		if (!element || element.canHaveMultipleValues()) {
			return fallback;
		}

		switch (element.getValueType()) {
			case 'int':
				return parseInt(element.getValue() as string);
			case 'float':
				return parseFloat(element.getValue() as string);
			default:
				return fallback;
		}
	}

	/**
	 * Returns the configured value for elements with multiple numbers
	 * @param name
	 * @param fallback
	 */
	public getMultipleNumberConfigValue(
		name: string,
		fallback: number[] | undefined = undefined
	): number[] | undefined {
		const element = this.moduleConfig.getElementByName(name);
		if (!element || !element.canHaveMultipleValues()) {
			return fallback;
		}

		const values: string[] = element.getValue() as string[];

		switch (element.getValueType()) {
			case 'int':
				return values.map(parseInt);
			case 'float':
				return values.map(parseFloat);
			default:
				return fallback;
		}
	}

	/**
	 * Returns the configured value for elements with a single string
	 * @param name
	 * @param fallback
	 */
	public getSingleStringConfigValue(
		name: string,
		fallback: string | undefined = undefined
	): string | undefined {
		const element = this.moduleConfig.getElementByName(name);
		if (!element || element.canHaveMultipleValues()) {
			return fallback;
		}
		return '' + element.getValue();
	}

	/**
	 * Returns the configured value for elements with multiple strings
	 * @param name
	 * @param fallback
	 */
	public getMultipleStringConfigValue(
		name: string,
		fallback: string[] | undefined = undefined
	): string[] | undefined {
		const element = this.moduleConfig.getElementByName(name);
		if (!element || !element.canHaveMultipleValues()) {
			return fallback;
		}
		return element.getValue() as string[];
	}

	/**
	 * Returns the configured value for elements with a boolean
	 * @param name
	 * @param fallback
	 */
	public getBooleanConfigValue(
		name: string,
		fallback: boolean | undefined = undefined
	): boolean | undefined {
		const element = this.moduleConfig.getElementByName(name);
		if (!element) {
			return fallback;
		}
		return !!element.getValue();
	}
}
