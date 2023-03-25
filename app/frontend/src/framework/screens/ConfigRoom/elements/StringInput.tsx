import React, {Component} from "react";
import {StringConfig, valueChangedCallback} from "@edelgames/types/src/app/ConfigurationTypes";
import {onEnterKeyEvent} from "../../../components/Inputs/InputUtils";

interface IProps {
    onValueChanged?: valueChangedCallback
    onChangeFinished: valueChangedCallback
    name: string;
    config: StringConfig;
    initialValue: string;
}

interface IState {
    value: string;
    error: null | string;
}

export default class StringInput extends Component<IProps, IState> {

    state = {
        value: '',
        error: null
    }
    elementRef = React.createRef<HTMLInputElement>();

    componentDidMount() {
        this.setState({
            value: this.props.initialValue
        });
    }

    validateValue(value: string): boolean {
        const {minLength, maxLength, forbiddenChars, allowedChars, regexMatch} = this.props.config;

        if (value.length > maxLength || value.length < minLength)
        {
            const errorMessage = maxLength === minLength ?
                `Es sind nur Eingaben mit ${minLength} Zeichen erlaubt` :
                `Es sind nur Eingaben zwischen ${minLength} und ${maxLength} Zeichen erlaubt`;

            this.setState({
                error: errorMessage
            });
            return false;
        }

        if (forbiddenChars.length) {
            const match = value.match(`[${forbiddenChars.join()}]+`);

            if(match) {
                this.setState({
                    error: `Der Text "${match[0]}" ist nicht erlaubt`
                });
                return false;
            }
        }

        if(allowedChars.length) {
            const match = value.match(`[^${allowedChars.join()}]+`);

            if(match) {
                this.setState({
                    error: `Der Text "${match[0]}" ist nicht erlaubt`
                });
                return false;
            }
        }

        if(regexMatch !== null && value.match(regexMatch) === null) {
            this.setState({
                error: `Der Text entspricht nicht dem Format "${regexMatch}"`
            });
            return false;
        }

        this.setState({
            error: null
        });
        return true;
    }

    onTextChanged(): void {
        const value = this.elementRef.current?.value;

        if (value === undefined || value === null) {
            return;
        }

        this.setState({
            value: value,
        });

        if(this.validateValue(value) && this.props.onValueChanged) {
            this.props.onValueChanged(value);
        }
    }

    onChangeFinished(): void {
        const value = this.elementRef.current?.value;
        if (!value) {
            return;
        }

        if(this.validateValue(value) && this.props.onChangeFinished(value)) {
            this.setState({
                value: ''
            })
        }
    }

    render() {
        return (
            <div className={'string-input-config'}>
                {
                    this.state.error ?
                        <div className={'config-error-message'}>
                            {this.state.error}
                        </div> : null
                }
                <input type={'text'}
                       ref={this.elementRef}
                       className={this.state.error ? 'has-error' : ''}
                       name={this.props.name}
                       value={this.state.value}
                       onKeyDown={onEnterKeyEvent.bind(null, this.onChangeFinished.bind(this))}
                       onChange={this.onTextChanged.bind(this)}
                />
            </div>
        );
    }

}