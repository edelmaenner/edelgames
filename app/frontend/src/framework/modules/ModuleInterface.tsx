import { ReactNode } from 'react';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";

export default interface ModuleInterface {
	getTitle(): string;

	getUniqueId(): string;

	getPreviewImage(): string | undefined;

	getPlayerRequirements(): PlayerRangeDefinition;

	renderGame(): ReactNode;
}
