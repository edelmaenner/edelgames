import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";

/*
 * The actual game instance, that controls and manages the game
 */
export default class YahtzeeGame implements ModuleGameInterface {

    api: ModuleApi = null;

    onGameInitialize(api: ModuleApi): void {
        this.api = api;
    }

}