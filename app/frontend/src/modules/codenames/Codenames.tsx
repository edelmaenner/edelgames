import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import { ReactNode } from 'react';
import CodenamesGame from './CodenamesGame';

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

	renderGame(): ReactNode {
		return <CodenamesGame />;
	}
}

const codenames = new Codenames();
export default codenames;
