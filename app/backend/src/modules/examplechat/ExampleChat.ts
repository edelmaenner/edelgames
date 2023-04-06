import ModuleInterface from '../../framework/modules/ModuleInterface';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ExampleChatGame from './ExampleChatGame';
import ModuleConfig from '../../framework/modules/configuration/ModuleConfig';
import StringConfig from '../../framework/modules/configuration/elements/StringConfig';
import { whitespace } from '../../framework/modules/configuration/elements/Collections';
import IntegerConfig from '../../framework/modules/configuration/elements/IntegerConfig';
import FloatConfig from '../../framework/modules/configuration/elements/FloatConfig';
import BooleanConfig from '../../framework/modules/configuration/elements/BooleanConfig';
import SelectOneConfig from '../../framework/modules/configuration/elements/SelectOneConfig';

/*
 * This singleton is used to register the game to the ModuleList
 */
class ExampleChat implements ModuleInterface {
	getUniqueId(): string {
		return 'exampleChat';
	}

	getGameConfig(): ModuleConfig {
		return new ModuleConfig([
			new SelectOneConfig('example_config_select', 'Wähle eine Option', [
				{ label: 'Diese Option 1', value: 'option_1' },
				{ label: 'Diese andere Option 2', value: 'option_2' },
				{ label: 'Keins der vorherigen', value: 'option_3' },
			]),

			new StringConfig('example_config', 'Beispieltext', []),

			new StringConfig(
				'example_config_2',
				'Mehrere Beispieltext',
				[],
				whitespace,
				1
			).changeAllowedQuantities(1, 5),

			new IntegerConfig(
				'example_config_int',
				'Eine beliebige Zahl zwischen 1 und 8!',
				1,
				8,
				1
			),

			new IntegerConfig(
				'example_config_int_2',
				'2-5 Beliebige Zahlen zwischen 1 und 8!',
				1,
				8,
				1
			).changeAllowedQuantities(2, 5),

			new FloatConfig(
				'example_config_float',
				'Eine beliebige Zahl zwischen 0 und 1!',
				0,
				1,
				0.01,
				1
			),

			new FloatConfig(
				'example_config_float_2',
				'0-3 Beliebige Zahlen zwischen 0 und 1!',
				1,
				8,
				0.01,
				1
			).changeAllowedQuantities(0, 3),
			new BooleanConfig(
				'example_config_bool',
				'Aktiviere speziellen Cheat',
				false,
				'checkbox'
			),
		]);
	}

	getGameInstance(): ModuleGameInterface {
		return new ExampleChatGame();
	}
}

const exampleChat = new ExampleChat();
export default exampleChat;
