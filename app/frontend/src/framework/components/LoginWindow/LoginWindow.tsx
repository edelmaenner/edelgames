import logo_em from '../../../media/images/logo_em.png';
import React, { KeyboardEvent, MouseEventHandler } from 'react';
import profileManager from '../../util/ProfileManager';

type IProps = {
	show: boolean;
	closeFunction: MouseEventHandler;
};

export default class LoginWindow extends React.Component<IProps, {}> {
	tryLogin() {
		// username: HTMLInputElement
		let loginScreen = document.getElementById('login-backdrop') as HTMLElement,
			username = (
				loginScreen.querySelector('input[type=text]') as HTMLInputElement
			)?.value,
			password = (
				loginScreen.querySelector('input[type=password]') as HTMLInputElement
			)?.value;

		if (!username || !password) {
			let errorMessage = loginScreen.querySelector(
				'.error-message'
			) as HTMLInputElement;
			errorMessage.innerText = 'Benutzername oder Password ungültig!';
			return;
		}

		profileManager.attemptAuthentication(false, username, password);
	}

	onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
		if (event.code === 'Enter') {
			this.tryLogin();
		}
	}

	render() {
		if (!this.props.show) {
			return null;
		}

		return (
			<div id="login-backdrop" onClick={this.props.closeFunction}>
				<div className="frame" onClick={(event) => event.stopPropagation()}>
					<img src={logo_em} alt={'Edelmänner Logo'} />

					<div className="error-message"></div>

					<input
						type="text"
						placeholder="Benutzername"
						onKeyDown={this.onKeyDown.bind(this)}
					/>
					<input
						type="password"
						placeholder="Passwort"
						onKeyDown={this.onKeyDown.bind(this)}
					/>

					<div className="text-align-right">
						<button onClick={this.tryLogin.bind(this)}>Login</button>
					</div>
				</div>
			</div>
		);
	}
}
