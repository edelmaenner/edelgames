import React, {ReactNode} from "react";
import {ColorGrid} from "@edelgames/types/src/modules/colorChecker/CCTypes";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


interface IProps {
    colorGrid: ColorGrid;
    onCellClicked: {(x: number,y: number): void};
    selectedColor?: string;
}

export default class ColorGridBox extends React.Component<IProps, {}> {

    render(): ReactNode {
        return (
            <div className={"color-checker-grid"}>
                {[...Array(15)].map((el, index) => this.renderColumn(index))}
            </div>
        );
    }

    renderColumn(x: number): JSX.Element {
        return (
            <div className={"color-checker-grid-column"}>
                <div className={"color-checker-grid-cell"}>
                    {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O',][x]}
                </div>

                {[...Array(7)].map((el, index) => this.renderCell(x, index))}
            </div>
        );
    }

    renderCell(x: number, y: number): JSX.Element {
        let cell = this.props.colorGrid[x][y] || {
            color: '#fff',
            isSpecial: false,
            checked: false
        };

        return (
            <div className={"color-checker-grid-cell " + (!cell.checked ? 'clickable' : '')}
                 onClick={() => this.props.onCellClicked(x,y)}
                 style={{
                     backgroundColor: cell.color
                 }}>
                {
                    cell.checked ?
                        <FontAwesomeIcon
                            icon={['fad', 'xmark']}
                            size="1x"
                        /> : null
                }
                {
                    cell.isSpecial && !cell.checked ?
                        <FontAwesomeIcon
                            icon={['fad', 'star']}
                            size="1x"
                        /> : null
                }
            </div>
        );
    }
}