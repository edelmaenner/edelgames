import ModuleInterface from '../../framework/modules/ModuleInterface';
import { ReactNode } from 'react';
import preview from './preview.png';
import StadtLandFlussGame from './StadtLandFlussGame';
import {PlayerRangeDefinition} from "@edelgames/types/src/app/ModuleTypes";

class StadtLandFluss implements ModuleInterface {
	getPreviewImage(): string | undefined {
		return preview;
	}

	getTitle(): string {
		return 'Stadt Land Fluss';
	}

	getUniqueId(): string {
		return 'stadtLandFluss';
	}

	getPlayerRequirements(): PlayerRangeDefinition {
		return {min: 1, max: 20}
	}

	renderGame(): ReactNode {
		return <StadtLandFlussGame />;
	}
}

const stadtLandFluss = new StadtLandFluss();

export default stadtLandFluss;
