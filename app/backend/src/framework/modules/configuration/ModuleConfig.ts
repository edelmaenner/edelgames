import ConfigElement from './ConfigElement';
import {
	ConfigurationTypes,
	NativeConfiguration,
} from '@edelgames/types/src/app/ConfigurationTypes';
import { systemLogger } from '../../util/Logger';

export default class ModuleConfig {
	configElements: ConfigElement[];
	isPubliclyEditable: boolean;

	constructor(configElements: ConfigElement[]) {
		this.configElements = configElements;
		this.isPubliclyEditable = false;
	}

	/**
	 * @internal
	 * @private
	 * @param elementName
	 * @param value
	 */
	setValueByName(
		elementName: string,
		value: ConfigurationTypes
	): true | string {
		const element = this.getElementByName(elementName);
		if (element) {
			try {
				element.setValue(value);
				return true;
			} catch (err) {
				if (!err.message || typeof err.message !== 'string') {
					systemLogger.debug(err);
					return 'Unknown error';
				}
				return err.message;
			}
		}
		return `Could not set value for missing element "${elementName}"`;
	}

	getElementByName(elementName: string): ConfigElement | undefined {
		return this.configElements.find((el) => el.getName() === elementName);
	}

	/**
	 * @internal
	 * @private
	 */
	getNativeConfiguration(): NativeConfiguration {
		return {
			elements: this.configElements.map((el) => el.toNativeObject()),
			isFullyConfigured: this.isFullyConfigured(),
			isPublicEditable: this.isPublicEditable(),
		};
	}

	/**
	 * @internal
	 * @private
	 */
	isPublicEditable(): boolean {
		return this.isPubliclyEditable;
	}

	/**
	 * @internal
	 * @private
	 */
	setPubliclyEditable(newState: boolean): void {
		this.isPubliclyEditable = newState;
	}

	hasConfig(): boolean {
		return this.configElements.length > 0;
	}

	/**
	 * @internal
	 * @private
	 */
	isFullyConfigured(): boolean {
		return this.configElements.every((el) => el.isValidState());
	}
}
