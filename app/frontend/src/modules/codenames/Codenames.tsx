import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import { ReactNode } from 'react';
import CodenamesGame from './CodenamesGame';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class Codenames implements ModuleInterface {
	getPreviewImage(): string | undefined {
		return preview;
	}

	getTitle(): string {
		return 'Codenames';
	}

	getUniqueId(): string {
		return 'codenames';
	}

	getPlayerRequirements(): PlayerRangeDefinition {
		return {min: 4, max: 30}
	}

	renderGame(): ReactNode {
		return <CodenamesGame />;
	}
}

const codenames = new Codenames();
export default codenames;
