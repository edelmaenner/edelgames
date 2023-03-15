import { ColorGrid } from '@edelgames/types/src/modules/colorChecker/CCTypes';
import User from '../../../framework/User';
import PlayerData from './PlayerData';

export default class PlayerHelper {
	players: PlayerData[] = [];
	readyPlayers: string[] = [];

	initiateNewPlayer(player: User, templateGrid: ColorGrid): PlayerData {
		const newPlayer = new PlayerData(player, templateGrid);
		this.players.push(newPlayer);
		return newPlayer;
	}

	removePlayer(playerId: string): void {
		this.players.filter((playerData) => playerData.playerId !== playerId);
		this.readyPlayers.filter((player) => player !== playerId);
	}

	getDataByPlayerId(playerId: string): PlayerData | undefined {
		return this.players.find((data) => data.playerId === playerId);
	}

	resetAllJokerUsage(): void {
		for (const playerData of this.players) {
			playerData.isUsingColorJoker = false;
			playerData.isUsingNumberJoker = false;
		}
	}

	allPlayersReady(): boolean {
		return this.readyPlayers.length >= this.players.length;
	}

	isPlayerReady(playerId: string): boolean {
		return this.readyPlayers.includes(playerId);
	}

	addReadyPlayer(playerId: string): void {
		this.readyPlayers.push(playerId);
	}

	clearReadyPlayers(): void {
		this.readyPlayers = [];
	}
}
