import ModuleApi from '../../../framework/modules/ModuleApi';
import {
	Guesses,
	Players,
	PointOverrides,
	Points,
} from '@edelgames/types/src/modules/stadtLandFluss/SLFTypes';

export type RoundResultProps = {
	isRoomMaster: boolean;
	gameApi: ModuleApi;
	round: number;
	max_rounds: number;
	letter: string;
	players: Players;
	guesses: Guesses;
	categories: string[];
	points: Points;
	point_overrides: PointOverrides;
};

export type ConfigProps = {
	isRoomMaster: boolean;
	gameApi: ModuleApi;
	config: {
		rounds: number;
		categories: string[];
	};
};

export type EndResultProps = {
	points: Points;
	isRoomMaster: boolean;
	gameApi: ModuleApi;
};

export type GuessingProps = {
	isRoomMaster: boolean;
	gameApi: ModuleApi;
	categories: string[];
	letter: string;
	guesses: Guesses;
	round: number;
	max_rounds: number;
	ready_users: string[];
	user_count: number;
};
