import ModuleInterface from "../../framework/modules/ModuleInterface";
import {ReactNode} from "react";
import preview from './preview.png'
import MemoryGame from "./MemoryGame";

class Memory implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Memory";
    }

    getUniqueId(): string {
        return "memory";
    }

    renderGame(): ReactNode {
        return (<MemoryGame/>);
    }

}

const memory = new Memory()

export default memory