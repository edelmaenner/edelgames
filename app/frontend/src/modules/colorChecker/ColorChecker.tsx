import ModuleInterface from "../../framework/modules/ModuleInterface";
import preview from "./preview.png";
import {ReactNode} from "react";
import ColorCheckerGame from "./ColorCheckerGame";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class ColorChecker implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Color-Checker";
    }

    getUniqueId(): string {
        return "colorChecker";
    }

    renderGame(): ReactNode {
        return (<ColorCheckerGame />);
    }

}

const colorChecker = new ColorChecker();
export default colorChecker;