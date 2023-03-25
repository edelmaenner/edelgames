import React, {Component} from "react";
import {BooleanConfig, valueChangedCallback} from "@edelgames/types/src/app/ConfigurationTypes";
import {onEnterKeyEvent} from "../../../components/Inputs/InputUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface IProps {
    onValueChanged?: valueChangedCallback;
    onChangeFinished: valueChangedCallback;
    name: string;
    config: BooleanConfig;
    initialValue: boolean;
}

interface IState {
    value: boolean;
}

export default class BooleanInput extends Component<IProps, IState> {

    state = {
        value: false
    }
    elementRef = React.createRef<HTMLInputElement>();

    componentDidMount() {
        this.setState({
            value: this.props.initialValue
        });
    }

    onStatusChanged(): void {
        const value = !!this.elementRef.current?.checked;

        this.setState({
            value: value
        })
        if(this.props.onValueChanged) {
            this.props.onValueChanged(value);
        }
    }

    onChangeFinished(): void {
        const value = this.elementRef.current?.value === 'ON';

        this.setState({
            value: value
        })
        if(this.props.onChangeFinished(value)) {
            // do nothing, a boolean input does not have to be reset
        }
    }

    render() {
        return (
            <div className={'bool-input-config'}>
                <input type={'checkbox'}
                       ref={this.elementRef}
                       className={'d-none'}
                       id={'bool_input_' + this.props.name}
                       name={this.props.name}
                       checked={this.state.value}
                       value={'ON'}
                       onChange={this.onStatusChanged.bind(this)}
                       onKeyDown={onEnterKeyEvent.bind(null, this.onChangeFinished.bind(this))}
                />
                <label
                    htmlFor={'bool_input_' + this.props.name}
                    className={'bool-input-type-'+this.props.config.style}>
                    <FontAwesomeIcon
                        icon={['fad', 'check']}
                        size="2x"
                        scale={1}
                        transform={'0,0'}
                        height={'2rem'}
                    />
                </label>
            </div>
        );
    }

}