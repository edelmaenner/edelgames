import React, {Component, ReactNode} from "react";
import {MemoryConfigProps} from "../types";

export default class MemoryConfig extends Component<MemoryConfigProps, {}> {
    private startGame() {
        this.props.api.getEventApi().sendMessageToServer("startGame", {})
    }

    render(): ReactNode {
        return (
            <div>
                <input type={"number"} placeholder={this.props.config.pairCount.toString()}/><br/>
                <input type={"number"} placeholder={this.props.config.countdown.toString()}/><br/>
                <input type={"number"} placeholder={this.props.config.revealInterval.toString()}/><br/>
                <input type={"number"} placeholder={this.props.config.revealPeriod.toString()}/><br/>
                {this.props.isRoommaster && <button onClick={this.startGame.bind(this)}>Spiel Starten</button>}
            </div>
        )
    }
}