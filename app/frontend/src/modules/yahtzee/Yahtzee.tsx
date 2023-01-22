import ModuleInterface from "../../framework/modules/ModuleInterface";
import preview from "./preview.png";
import YahtzeeGame from "./YahtzeeGame";
import {ReactNode} from "react";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class Yahtzee implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Kniffel";
    }

    getUniqueId(): string {
        return "yahtzee";
    }

    renderGame(): ReactNode {
        return (<YahtzeeGame/>);
    }

}

const exampleChat = new Yahtzee();
export default exampleChat;