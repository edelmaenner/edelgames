import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import HangmanGame from './HangmanGame';
import { ReactNode } from 'react';

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

	renderGame(): ReactNode {
		return <HangmanGame />;
	}
}

const hangman = new Hangman();
export default hangman;
