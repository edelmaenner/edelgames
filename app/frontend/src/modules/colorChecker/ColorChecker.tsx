import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import { ReactNode } from 'react';
import ColorCheckerGame from './ColorCheckerGame';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class ColorChecker implements ModuleInterface {
	getPreviewImage(): string | undefined {
		return preview;
	}

	getTitle(): string {
		return 'Farb-Check';
	}

	getUniqueId(): string {
		return 'colorChecker';
	}

	getPlayerRequirements(): PlayerRangeDefinition {
		return {min: 1, max: 50}
	}

	renderGame(): ReactNode {
		return <ColorCheckerGame />;
	}
}

const colorChecker = new ColorChecker();
export default colorChecker;
