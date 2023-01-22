import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import YahtzeeGame from "./YahtzeeGame";

/*
 * This singleton is used to register the game to the ModuleList
 */
class Yahtzee implements ModuleInterface {

    getUniqueId(): string {
        return "yahtzee";
    }

    getGameInstance(): ModuleGameInterface {
        return new YahtzeeGame();
    }
}

const yahtzee = new Yahtzee();
export default yahtzee;