import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ExampleChatGame from './ExampleChatGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import SingleText from '../../framework/modules/configuration/elements/SingleText';

/*
 * This singleton is used to register the game to the ModuleList
 */
class ExampleChat implements ModuleInterface {
	getUniqueId(): string {
		return 'exampleChat';
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([
			new SingleText('example_config', 'Beispieltext', 'ändere mich'),
		]);
	}

	getGameInstance(): ModuleGameInterface {
		return new ExampleChatGame();
	}
}

const exampleChat = new ExampleChat();
export default exampleChat;
