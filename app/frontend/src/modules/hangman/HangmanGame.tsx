import React, { ReactNode } from 'react';
import ModuleGameInterface from '../../framework/modules/ModuleGameInterface';
import ModuleApi from '../../framework/modules/ModuleApi';
import hangman from "./Hangman";

interface IState {

}

export default class Hangman
	extends React.Component<{}, IState>
	implements ModuleGameInterface
{
	private readonly api: ModuleApi;

	state = {

	};

	constructor(props: {}) {
		super(props);
		this.api = new ModuleApi(hangman, this);
	}

	componentDidMount() {

	}

	componentWillUnmount() {}

	render(): ReactNode {
		return (
			<div id={'hangman'}>
				helloworld
			</div>
		);
	}
}
