import ModuleApi from './ModuleApi';

export default abstract class ModuleGame {
	abstract onGameInitialize(roomApi: ModuleApi): void;

	onPlayerLateJoin(): void {
		// update a player, that late-joins the game
	}
}
