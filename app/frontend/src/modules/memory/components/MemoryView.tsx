import React, {Component, ReactNode} from "react";
import {MemoryViewProps} from "../types";

export default class MemoryView extends Component<MemoryViewProps, {}> {
    private renderBoard() {
        const boardElements = []

        for (const boardElement of this.props.board) {
            boardElements.push(<div>{boardElement.pairIndex}</div>)
        }

        return <>{boardElements}</>
    }

    render(): ReactNode {
        return (
            <div>
                {this.renderBoard()}
            </div>
        )
    }
}