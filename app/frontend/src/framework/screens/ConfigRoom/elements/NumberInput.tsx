import React, {Component} from "react";
import {NumberConfig, valueChangedCallback} from "@edelgames/types/src/app/ConfigurationTypes";
import {onEnterKeyEvent} from "../../../components/Inputs/InputUtils";

interface IProps {
    onValueChanged?: valueChangedCallback;
    onChangeFinished: valueChangedCallback;
    name: string;
    config: NumberConfig;
    initialValue: number;
}

interface IState {
    value: number;
    error: null | string;
}

export default class NumberInput extends Component<IProps, IState> {

    state = {
        value: 0,
        error: null
    }
    elementRef = React.createRef<HTMLInputElement>();

    componentDidMount() {
        this.setState({
            value: this.props.initialValue
        });
    }

    isNumeric(str: string) {
        return !Number.isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !Number.isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }

    validateValue(value: number|string): false|number {
        const {step, min, max} = this.props.config;

        let numberValue;
        if(typeof value === 'number') {
            numberValue = value;
        }
        else {
            if(!this.isNumeric(value)) {
                return false; // ignore this completely
            }

            try {
                numberValue = step === 1 ?
                    parseInt(value) :
                    Number(parseFloat(value).toFixed(1/(step || 1)));
            }
            catch (err) {
                this.setState({
                    error: err as string,
                });
                return false;
            }
        }

        if(Number.isNaN(numberValue)) {
            this.setState({
                error: `Cannot read value ${value} as number`
            });
            return false;
        }

        if (numberValue > max || numberValue < min)
        {
            this.setState({
                error: `Es sind nur Eingaben zwischen ${min} und ${max} erlaubt`
            });
            return false;
        }

        this.setState({
            error: null
        });
        return numberValue;
    }

    onNumberChanged(): void {
        const value = this.elementRef.current?.value;

        if (value === undefined || value === null) {
            this.setState({
                value: 0
            })
            return;
        }

        const validatedValue = this.validateValue(value);
        if(validatedValue !== false) {
            this.setState({
                value: validatedValue
            })
            if(this.props.onValueChanged) {
                this.props.onValueChanged(validatedValue);
            }
        }
    }

    onChangeFinished(): void {
        const value = this.elementRef.current?.value;

        if (value === undefined || value === null) {
            return;
        }

        const validatedValue = this.validateValue(value);
        if(validatedValue !== false && this.props.onChangeFinished(validatedValue)) {
            // do nothing, a number input does not have to be reset
        }
    }

    render() {
        return (
            <div className={'number-input-config'}>
                {
                    this.state.error ?
                        <div className={'config-error-message'}>
                            {this.state.error}
                        </div> : null
                }
                <input type={'number'}
                       min={this.props.config.min}
                       max={this.props.config.max}
                       step={this.props.config.step}
                       ref={this.elementRef}
                       className={this.state.error ? 'has-error' : ''}
                       name={this.props.name}
                       value={this.state.value}
                       onChange={this.onNumberChanged.bind(this)}
                       onKeyDown={onEnterKeyEvent.bind(null, this.onChangeFinished.bind(this))}
                />
            </div>
        );
    }

}