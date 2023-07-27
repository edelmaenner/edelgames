import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import { ReactNode } from 'react';
import DrawAndGuessGame from './DrawAndGuessGame';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class DrawAndGuess implements ModuleInterface {
	getPreviewImage(): string | undefined {
		return preview;
	}

	getTitle(): string {
		return 'Montagsmaler';
	}

	getUniqueId(): string {
		return 'drawAndGuess';
	}

	getPlayerRequirements(): PlayerRangeDefinition {
		return {min: 2, max: 50}
	}

	renderGame(): ReactNode {
		return <DrawAndGuessGame />;
	}
}

const drawAndGuess = new DrawAndGuess();
export default drawAndGuess;
