import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import CodenamesGame from "./CodenamesGame";

/*
 * This singleton is used to register the game to the ModuleList
 */
class Codenames implements ModuleInterface {

    getUniqueId(): string {
        return "codenames";
    }

    getGameInstance(): ModuleGameInterface {
        return new CodenamesGame();
    }


}

const codenames = new Codenames();
export default codenames;