import React, {Component} from "react";

const LoadingMessages = [
    'Der Entwickler holt sich gerade einen Kaffee. Wir bauen die Seite gleich für dich auf!',
    'Wenn du diese Seite länger siehst, hau bitte einen Entwickler deiner Wahl an!',
    'You spin my line right round, right round',
    'Das Minispiel Erlebnis des Jahrtausends!',
    'Sortiere Indices, generiere zufällige Zahlen, kopiere Code, ...',
    'Wenn du hier deine eigene Nachricht sehen möchtest, kannst du uns gerne spenden! (Wir schreiben deine Nachricht dann trotzdem nicht hin)',
    'Building tree stumps since 2014'
];
const LoadingMessageTimer = 8000;

interface IState {
    messageTimer: NodeJS.Timeout|null,
    message: string
}

export default class LoadingSpinner extends Component<{},IState> {

    state = {
        messageTimer: null,
        message: ""
    }

    componentDidMount() {
        this.afterMessageTimeout();
    }

    componentWillUnmount() {
        this.clearTimeout();
    }

    clearTimeout(): void {
        if(this.state.messageTimer) {
            clearTimeout(this.state.messageTimer);
        }
    }

    afterMessageTimeout(): void {
        this.clearTimeout();
        const messageId = Math.floor(Math.random() * LoadingMessages.length);

        this.setState({
            messageTimer: setTimeout(this.afterMessageTimeout.bind(this), LoadingMessageTimer),
            message: LoadingMessages[messageId]
        });
    }

    render(): JSX.Element {
        return (
            <div>
                <div className="loadingSpinner"></div>
                <div className="loadingHint">{this.state.message}</div>
            </div>
        );
    }
}