import React, { ReactNode } from 'react';
import eventManager from "../../util/EventManager";
import {ListenerFunction} from "@edelgames/types/src/app/ApiTypes";

interface IProps {
    onClose: {(): void};
    closeWithoutFocus?: boolean;
    showCloseButton?: boolean;
    coordinates?: {x: number, y: number};
    position?: 'fixed'|'absolute'|'relative'|'sticky';
    children?: ReactNode|ReactNode[]|null;
    style?: React.CSSProperties;
}

export default class PopUp extends React.Component<IProps, {}> {
    pageClickedHandler: ListenerFunction;

    constructor(props: IProps) {
        super(props);
        this.pageClickedHandler = this.onPageClicked.bind(this);
    }

    componentDidMount() {
        eventManager.subscribe('page-clicked', this.pageClickedHandler);
    }

    componentWillUnmount() {
        eventManager.unsubscribe('page-clicked', this.pageClickedHandler);
    }

    onPageClicked(): void {
        if (this.props.closeWithoutFocus) {
            this.props.onClose();
        }
    }

    render(): ReactNode {
        return (
            <div className={'popup'}
                 onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                 }} // prevent click events from bubbling to the outside
                 style={{...{
                         position: this.props.position,
                         top: this.props.coordinates?.y,
                         left: this.props.coordinates?.x
                 }, ...this.props.style}}
            >
                {this.props.children}

                {this.props.showCloseButton &&
                    <div className={'popup-close'}
                         onClick={() => this.props.onClose()}
                    >
                        X
                    </div>}
            </div>
        );
    }
}