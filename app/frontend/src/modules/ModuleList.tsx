import ModuleInterface from "../framework/modules/ModuleInterface";
import exampleChat from "./exampleChat/ExampleChat";
import drawAndGuess from "./drawAndGuess/DrawAndGuess";
import stadtLandFluss from "./stadtLandFluss/StadtLandFluss";
import codenames from "./codenames/Codenames";

export const ModuleList: ModuleInterface[] = [
    exampleChat,
    drawAndGuess,
    stadtLandFluss,
    codenames
];
