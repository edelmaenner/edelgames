import ConfigElement from './ConfigElement';
import { NativeConfiguration } from '@edelgames/types/src/app/ConfigurationTypes';

export default class ModuleConfig {
	configElements: ConfigElement[];

	constructor(configElements: ConfigElement[]) {
		this.configElements = configElements;
	}

	getNativeConfiguration(): NativeConfiguration {
		return {
			elements: this.configElements.map((el) => el.toNativeObject()),
			isFullyConfigured: this.isFullyConfigured(),
			isPublicEditable: this.isPublicEditable(),
		};
	}

	isPublicEditable(): boolean {
		return false;
	}

	hasConfig(): boolean {
		return this.configElements.length > 0;
	}

	isFullyConfigured(): boolean {
		return this.configElements.every((el) => el.isConfigured());
	}
}
