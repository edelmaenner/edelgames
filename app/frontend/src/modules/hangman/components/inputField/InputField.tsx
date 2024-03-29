import React, { Component } from 'react';
import {
	GameState,
	PlayerGuessedEventData,
	PlayerSubmittedWordEventData,
} from '@edelgames/types/src/modules/hangman/HMTypes';
import ModulePlayerApi from '../../../../framework/modules/api/ModulePlayerApi';
import ModuleEventApi from '../../../../framework/modules/api/ModuleEventApi';

interface IProps {
	gameState: GameState;
	playerApi: ModulePlayerApi;
	eventApi: ModuleEventApi;
	playerGuessCharCallback: { (char: string): void };
	playerGuessWordCallback: { (char: string): void };
}

interface IState {
	currentCharValue: string;
	currentWordValue: string;
	errorText?: string;
}

export default class InputField extends Component<IProps, IState> {
	state = {
		currentCharValue: '',
		currentWordValue: '',
		errorText: '',
	};

	wordSubmitInput = React.createRef<HTMLInputElement>();

	onGuessCharKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
		if (event.key === 'Enter' && this.state.currentCharValue.length === 1) {
			this.props.eventApi.sendMessageToServer('playerGuessed', {
				char: this.state.currentCharValue,
			} as PlayerGuessedEventData);

			this.setState({
				currentCharValue: '',
			});
			return;
		}

		if (
			!alphabet.includes(event.key) &&
			!specialCharacters.includes(event.key)
		) {
			return;
		}

		this.setState({
			currentCharValue: event.key,
		});
	}

	onSubmitWordKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
		if (event.key === 'Enter') {
			const word = this.state.currentWordValue.trim();
			const wordLength = word.length;
			const config = this.props.gameState.configuration;

			if (
				wordLength < config.minWordLength ||
				wordLength > config.maxWordLength
			) {
				this.setState({
					errorText: `Das Wort muss zwischen ${config.minWordLength} und ${config.maxWordLength} Zeichen lang sein!`,
				});
				return;
			}

			this.props.eventApi.sendMessageToServer('playerSubmittedWord', {
				word: word,
			} as PlayerSubmittedWordEventData);

			this.setState({
				currentWordValue: '',
			});
			return;
		}
	}

	onSubmitWordChange(): void {
		if (!this.wordSubmitInput.current) {
			return;
		}

		const newValue = this.wordSubmitInput.current.value;

		let wordContainsLetters = false;

		for (const char of newValue.split('')) {
			let isValidLetter =
				alphabet.includes(char) || specialCharacters.includes(char);

			if (!isValidLetter && !syntaxCharacters.includes(char)) {
				this.setState({
					errorText: `Das Zeichen "${char}" ist ungültig!`,
				});
				return;
			}

			if (isValidLetter) {
				wordContainsLetters = true;
			}
		}

		if (!wordContainsLetters && newValue.length > 0) {
			this.setState({
				errorText: 'Der Text muss Buchstaben enthalten!',
			});
			return;
		}

		this.setState({
			errorText: '',
		});

		this.setState({
			currentWordValue: newValue,
		});
	}

	render() {
		const currentUserId = this.props.playerApi.getLocalePlayer().getId();

		const phase = this.props.gameState.phase;
		const activeGuesserId = this.props.gameState.activeGuesserId;
		const currentHostId = this.props.gameState.currentHostId;

		return (
			<div className={'hangman-user-input-container'}>
				<div className={'error-text'}>{this.state.errorText}</div>

				{phase === 'guessing' &&
					(activeGuesserId === currentUserId
						? this.renderGuessChar()
						: `${this.props.playerApi
								.getPlayerById(activeGuesserId)
								?.getUsername()} rät gerade einen Buchstaben`)}

				{phase === 'spelling' &&
					(currentHostId === currentUserId
						? this.renderSubmitWord()
						: `${this.props.playerApi
								.getPlayerById(currentHostId)
								?.getUsername()} überlegt sich gerade ein neues Wort`)}

				{this.props.gameState.phase === 'guessing' && (
					<div className={'wrong-character-list'}>
						{this.props.gameState.wrongChars.sort().map((char) => (
							<span key={'char_' + char} className={'wrong-char'}>
								{char}
							</span>
						))}
					</div>
				)}
			</div>
		);
	}

	renderGuessChar(): JSX.Element {
		return (
			<>
				<input
					className={'guess-input'}
					value={this.state.currentCharValue}
					onKeyDown={this.onGuessCharKeyDown.bind(this)}
					onChange={() => {}} // to prevent react from sending error messages
					placeholder={'?'}
					autoFocus={true}
				/>
			</>
		);
	}

	renderSubmitWord(): JSX.Element {
		return (
			<>
				<input
					ref={this.wordSubmitInput}
					className={'submit-input'}
					value={this.state.currentWordValue}
					onChange={this.onSubmitWordChange.bind(this)}
					onKeyDown={this.onSubmitWordKeyDown.bind(this)}
					placeholder={'...'}
					autoFocus={true}
				/>
			</>
		);
	}
}

const alphabet = [
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'E',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
];
const syntaxCharacters = [' ', ',', '.', '-', '?', '!'];
const specialCharacters = ['ü', 'Ü', 'ä', 'Ä', 'ö', 'Ö'];
