import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import YahtzeeGame from './YahtzeeGame';
import { ReactNode } from 'react';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class Yahtzee implements ModuleInterface {
	getPreviewImage(): string | undefined {
		return preview;
	}

	getTitle(): string {
		return 'Kniffel';
	}

	getUniqueId(): string {
		return 'yahtzee';
	}

	getPlayerRequirements(): PlayerRangeDefinition {
		return {min: 1, max: 10}
	}

	renderGame(): ReactNode {
		return <YahtzeeGame />;
	}
}

const exampleChat = new Yahtzee();
export default exampleChat;
