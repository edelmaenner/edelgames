import React from 'react';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import codenames from './Codenames';
import InitialStateComponent from './components/initialState/InitialStateComponent';
import HintStateComponent from './components/hintState/HintStateComponent';
import GuessStateComponent from './components/guessState/GuessStateComponent';
import EndStateComponent from './components/endState/EndStateComponent';
import {
	IBoardElement,
	Hint,
	ITeam,
} from '@edelgames/types/src/modules/codenames/CNTypes';

interface IState {
	teams: ITeam[];
	board: IBoardElement[][];
	hint: Hint;
	stateName: string;
}

let teamColors: string[] = [
	'#8f2b1c',
	'#3284a3',
	'#1e6f24',
	'#5f2dad',
	'#b0aa18',
	'#ab4909',
];

export default class CodenamesGame
	extends React.Component<{}, IState>
	implements ModuleGameInterface
{
	private readonly gameApi: ModuleApi;

	// state is an inherited property from React.Component
	state = {
		teams: [] as ITeam[],
		board: [] as IBoardElement[][],
		hint: {} as Hint,
		stateName: 'initial',
	};

	constructor(props: any) {
		super(props);
		this.gameApi = new ModuleApi(codenames, this);
	}

	mapToBoardElement(boardElement: any): IBoardElement {
		return {
			word: boardElement.word,
			category: boardElement.category,
			teamId:
				this.state.teams.find((team) => team.name === boardElement.teamName)
					?.id ?? -1,
			categoryVisibleForEveryone: boardElement.categoryVisibleForEveryone,
			marks: boardElement.marks,
		} as IBoardElement;
	}

	mapBoardArrayToBoard(
		board: any[],
		rowCount: number,
		columnCount: number
	): IBoardElement[][] {
		let newBoard: IBoardElement[][] = [];

		if (board && board.length > 0) {
			for (let i = 0; i < rowCount; i++) {
				newBoard[i] = [];
				for (let j = 0; j < columnCount; j++) {
					newBoard[i].push(this.mapToBoardElement(board[i * columnCount + j]));
				}
			}
		}

		return newBoard;
	}

	// this method is called, once the component is ready and setState can be used
	componentDidMount() {
		this.gameApi
			.getEventApi()
			.addEventHandler('serverMessageSend', this.onReceiveMessage.bind(this));
		this.gameApi
			.getEventApi()
			.addEventHandler(
				'userSpecificBoardViewSent',
				this.onReceiveBoard.bind(this)
			);
		this.gameApi.getEventApi().sendMessageToServer('requestGameState', {});
	}

	onReceiveBoard(eventData: { [key: string]: any }) {
		this.setState({
			board: this.mapBoardArrayToBoard(eventData.board, 5, 5),
		});
	}

	onReceiveMessage(eventData: { [key: string]: any }) {
		this.setState({
			teams: eventData.teams.map(
				(team: any, index: number) =>
					({
						id: index,
						name: team.name,
						investigators: team.investigators,
						wordsLeft: team.wordsLeft,
						spymaster: team.spymaster,
						active: team.active,
						teamColor: teamColors[index],
					} as ITeam)
			),
			stateName: eventData.state,
			hint: eventData.hint ?? { word: '?', amnt: 0 },
		});
	}

	render() {
		switch (this.state.stateName) {
			case 'initial':
				return <div>Waiting</div>;
			case 'start':
				return (
					<InitialStateComponent
						gameApi={this.gameApi}
						teams={this.state.teams}
					/>
				);
			case 'hint':
				return (
					<HintStateComponent
						gameApi={this.gameApi}
						teams={this.state.teams}
						board={this.state.board}
					/>
				);
			case 'guess':
				return (
					<GuessStateComponent
						gameApi={this.gameApi}
						teams={this.state.teams}
						board={this.state.board}
						amount={this.state.hint.amnt}
						hint={this.state.hint.word}
					/>
				);
			case 'end':
				return (
					<EndStateComponent
						gameApi={this.gameApi}
						teams={this.state.teams}
						board={this.state.board}
						amount={this.state.hint.amnt}
						hint={this.state.hint.word}
					/>
				);
			default:
				return <div>Error</div>;
		}
	}

	// TODO 2: history
}
