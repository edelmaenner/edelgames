import ModuleInterface from '../../framework/modules/ModuleInterface';
import preview from './preview.png';
import ExampleChatGame from './ExampleChatGame';
import { ReactNode } from 'react';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class ExampleChat implements ModuleInterface {
	getPreviewImage(): string | undefined {
		return preview;
	}

	getTitle(): string {
		return 'Beispiel Chat';
	}

	getUniqueId(): string {
		return 'exampleChat';
	}

	getPlayerRequirements(): PlayerRangeDefinition {
		return {min: 1, max: 1000}
	}

	renderGame(): ReactNode {
		return <ExampleChatGame />;
	}
}

const exampleChat = new ExampleChat();
export default exampleChat;
