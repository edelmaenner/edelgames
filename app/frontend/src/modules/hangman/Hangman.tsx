import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import HangmanGame from './HangmanGame';
import { ReactNode } from 'react';
import { PlayerRangeDefinition } from '@edelgames/types/src/app/ModuleTypes';

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class Hangman implements ModuleInterface {
	getPreviewImage(): string | undefined {
		return preview;
	}

	getTitle(): string {
		return 'Galgenmännchen';
	}

	getUniqueId(): string {
		return 'hangman';
	}

	getPlayerRequirements(): PlayerRangeDefinition {
		return { min: 1, max: 20 };
	}

	renderGame(): ReactNode {
		return <HangmanGame />;
	}
}

const hangman = new Hangman();
export default hangman;
