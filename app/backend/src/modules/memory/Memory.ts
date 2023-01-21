import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import MemoryGame from "./MemoryGame";

class Memory implements ModuleInterface {

    getGameInstance(): ModuleGameInterface {
        return new MemoryGame();
    }

    getUniqueId(): string {
        return "memory";
    }

}

const memory = new Memory()

export default memory