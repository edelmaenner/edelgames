import { ITeam } from '@edelgames/types/src/modules/codenames/CNTypes';

export class PlayerUtils {
	public static isSpymaster(playerName: string, teams: ITeam[]): boolean {
		return !!(
			playerName &&
			teams.findIndex((team) => team.spymaster === playerName) !== -1
		);
	}

	public static isInActiveTeam(playerName: string, teams: ITeam[]): boolean {
		return !!(
			playerName &&
			!!teams.find(
				(team) =>
					team.spymaster === playerName ||
					team.investigators.includes(playerName)
			)?.active
		);
	}
}
