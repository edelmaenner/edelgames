import { Component, ReactNode } from 'react';
import { RoundResultProps } from '../types/SLFTypes';

/**
 * Component for round results.
 */
export default class SLFRoundResults extends Component<RoundResultProps, {}> {
	/**
	 * Start the next round.
	 */
	private onNextRound(): void {
		this.props.gameApi.getEventApi().sendMessageToServer('nextRound', {});
	}

	/**
	 * Calculate the point total per player for this round.
	 */
	private sumPointsPerPlayer(): number[] {
		let summed: { [userId: string]: number } = {};

		for (let usersPointList of Object.values(
			this.props.points[this.props.letter]
		)) {
			for (let [userId, pointAmount] of Object.entries(usersPointList)) {
				if (!summed.hasOwnProperty(userId)) {
					summed[userId] = 0;
				}
				summed[userId] += pointAmount;
			}
		}

		return Object.values(summed);
	}

	/**
	 * Update the "downvote" for a given answer by a specific user.
	 *
	 * @param {string} userId
	 * @param {string} category
	 */
	private toggleDownvote(userId: string, category: string): void {
		let newState: boolean;
		let button = document.getElementById(
			`toggleDownvote_${userId}_${category}`
		);
		if (button) {
			if (button.classList.contains('active')) {
				newState = false;
				button.classList.remove('active');
			} else {
				newState = true;
				button.classList.add('active');
			}

			this.props.gameApi.getEventApi().sendMessageToServer('setDownvote', {
				userId: userId,
				category: category,
				isActive: newState,
			});
		}
	}

	private showDownvoteButton(userId: string, category: string): boolean {
		let userPoints = this.props.points[this.props.letter][category][userId];

		return (
			userId !== this.props.gameApi.getPlayerApi().getLocalePlayer().getId() &&
			(userPoints > 0 ||
				(this.props.point_overrides &&
					this.props.point_overrides[userId] &&
					this.props.point_overrides[userId][category] &&
					Object.keys(this.props.point_overrides[userId][category]).length ===
						Object.keys(this.props.players).length - 1))
		);
	}

	private renderPlayerNames() {
		let elements = [] as JSX.Element[];

		for (let player in this.props.players) {
			elements.push(<th key={`player`}>{this.props.players[player]}</th>);
		}

		return <>{elements}</>;
	}

	private renderPlayerCategories(category: string) {
		console.warn(this.props.point_overrides);
		console.warn(this.props.players);

		let elements = [] as JSX.Element[];
		for (let player in this.props.players) {
			elements.push(
				<td
					className={
						'points_' + this.props.points[this.props.letter][category][player]
					}
					key={`guess_${player}_${this.props.letter}_${category}`}
				>
					{this.props.guesses[player][this.props.letter][category]}&nbsp;
					{this.showDownvoteButton(player, category) ? (
						<button
							id={`toggleDownvote_${player}_${category}`}
							className={
								'downvoteButton' +
								(this.doesPointOverridesIncludeLocalPlayer(player, category)
									? ' active'
									: '')
							}
							onClick={this.toggleDownvote.bind(this, player, category)}
						>
							Downvote (
							{this.props.point_overrides &&
								this.props.point_overrides[player] &&
								this.props.point_overrides[player][category] &&
								(Object.keys(this.props.point_overrides[player][category])
									?.length ??
									0)}
							/{Object.keys(this.props.players).length - 1})
						</button>
					) : (
						''
					)}
				</td>
			);
		}

		return <>{elements}</>;
	}

	private doesPointOverridesIncludeLocalPlayer(
		player: string,
		category: string
	): boolean {
		if (
			this.props.point_overrides &&
			this.props.point_overrides[player] &&
			this.props.point_overrides[player][category]
		) {
			//FIXME
			return this.props.point_overrides[player][category]?.includes(
				this.props.gameApi.getPlayerApi().getLocalePlayer().getId()
			);
		}

		return false;
	}

	/**
	 * Renders the component.
	 */
	render(): ReactNode {
		return (
			<div id={'slfRoundResults'}>
				<p>
					Ergebnisse für Runde {this.props.round} von {this.props.max_rounds} |
					Buchstabe: {this.props.letter}
				</p>
				<br />
				<table>
					<thead>
						<tr>
							<th>Kategorie</th>
							{this.renderPlayerNames()}
						</tr>
					</thead>
					<tbody>
						{this.props.categories.map((c) => (
							<tr>
								<td>{c}</td>
								{this.renderPlayerCategories(c)}
							</tr>
						))}
						<tr className={'boldChildren'}>
							<td>Punkte</td>
							{this.sumPointsPerPlayer().map((p) => (
								<td>{p}</td>
							))}
						</tr>
					</tbody>
				</table>
				<br />
				{this.props.isRoomMaster ? (
					<button onClick={this.onNextRound.bind(this)}>
						{this.props.round === this.props.max_rounds
							? 'Zum Endergebnis'
							: 'Nächste Runde'}
					</button>
				) : (
					''
				)}
			</div>
		);
	}
}
