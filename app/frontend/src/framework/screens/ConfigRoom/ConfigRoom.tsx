import React from 'react';
import {NativeConfiguration, NativeConfigurationElement} from "@edelgames/types/src/app/ConfigurationTypes";
import roomManager from "../../util/RoomManager";

interface IProps {
    configuration: NativeConfiguration
}

export default class ConfigRoom extends React.Component<IProps, {}> {

    canBeEdited: boolean = false;

    render() {
        const isRoomMaster = !!roomManager.getRoomMaster()?.isRoomMaster();
        this.canBeEdited = isRoomMaster || this.props.configuration.isPublicEditable;

        return (
            <div id="screenConfigRoom">
                <h1>config!</h1>
                {this.props.configuration.elements.map(this.renderElement.bind(this))}

                {
                    isRoomMaster ?
                        <div>
                            <button>Anwenden und Spiel beginnen</button>
                        </div> : null
                }
            </div>
        );
    }

    renderElement(element: NativeConfigurationElement, index: number): JSX.Element {
        return (
            <div key={'config_element_'+element.name}>
                {element.label}
            </div>
        );
    }
}
