import React, {ReactNode} from "react";
import ModuleGameInterface from "../../../framework/modules/ModuleGameInterface";
import { YahtzeeScoreboardType, YahtzeeScoreObject} from "../YahtzeeGame";
import ModuleApi from "../../../framework/modules/ModuleApi";
import ProfileImage from "../../../framework/components/ProfileImage/ProfileImage";


interface IProps {
    api: ModuleApi,
    scoreboard: YahtzeeScoreboardType,
    activePlayerId?: string,
    allowCellClick?: boolean,
    onCellClicked?: {(cellType: scoreCellIDs): void}
}

export enum scoreCellIDs {
    ONE = 'one',
    TWO = 'two',
    THREE = 'three',
    FOUR = 'four',
    FIVE = 'five',
    SIX = 'six',
    THREE_OF_A_KIND = 'threeOfAKind',
    FOUR_OF_A_KIND = 'fourOfAKind',
    FIVE_OF_A_KIND = 'fiveOfAKind',
    FULL_HOUSE = 'fullHouse',
    SMALL_STRAIGHT = 'smallStraight',
    LARGE_STRAIGHT = 'largeStraight',
    CHANCE = 'chance',
}

export default class Scoreboard extends React.Component<IProps, {}> implements ModuleGameInterface {



    render(): ReactNode {
        return (
            <div className={"yahtzee-scoreboard"}>
                {this.renderIndex()}
                {this.props.scoreboard.map(this.renderColumn.bind(this))}
                {this.props.scoreboard.map(this.renderColumn.bind(this))}
                {this.props.scoreboard.map(this.renderColumn.bind(this))}
            </div>
        );
    }

    renderIndex(): JSX.Element {
        return (
            <div className={"yahtzee-scoreboard-index-column"}>
                <div className={"yahtzee-tcell"}>{/* Playername*/}</div>
                <div className={"yahtzee-tcell"} title={"Nur Einser zählen"}>1er</div>
                <div className={"yahtzee-tcell"} title={"Nur Zweier zählen"}>2er</div>
                <div className={"yahtzee-tcell"} title={"Nur Dreier zählen"}>3er</div>
                <div className={"yahtzee-tcell"} title={"Nur Vierer zählen"}>4er</div>
                <div className={"yahtzee-tcell"} title={"Nur Fünfer zählen"}>5er</div>
                <div className={"yahtzee-tcell"} title={"Nur Sechser zählen"}>6er</div>
                <div className={"yahtzee-tcell"} title={"+35"}>Bonus bei &gt;= 63</div>
                <div className={"yahtzee-tcell"} title={"Alle Augen Zählen"}>Dreierpasch</div>
                <div className={"yahtzee-tcell"} title={"Alle Augen Zählen"}>Viererpasch</div>
                <div className={"yahtzee-tcell"} title={"+25"}>Full House</div>
                <div className={"yahtzee-tcell"} title={"+30"}>Kleine Straße</div>
                <div className={"yahtzee-tcell"} title={"+40"}>Große Straße</div>
                <div className={"yahtzee-tcell"} title={"+50"}>Kniffel</div>
                <div className={"yahtzee-tcell"} title={"alle "}>Chance</div>
                <div className={"yahtzee-tcell"}>{/* placeholder */}</div>
                <div className={"yahtzee-tcell"}>Gesamt</div>
            </div>
        );
    }

    renderColumn(playerScore: YahtzeeScoreObject): JSX.Element {
        const {playerId} = playerScore;

        let playerApi = this.props.api.getPlayerApi();
        let player = playerApi.getPlayerById(playerId);
        if(!player) {
            return (<span></span>);
        }
        let isLocalePlayer = playerApi.getLocalePlayer().getId() === player.getId();
        let isActivePlayer = this.props.activePlayerId === player.getId();

        let totalFirstPart: number = playerScore.gather ? (Object.values(playerScore.gather).reduce(
            (prev, curr) => (prev || 0) + (curr || 0)
        ) || 0) : 0;

        let clickListener = isLocalePlayer ? this.props.onCellClicked : undefined;

        let className = 'yahtzee-scoreboard-column' +
            (isLocalePlayer ? ' yahtzee-local-col' : '') +
            (isActivePlayer ? ' yahtzee-active-col' : '');

        return (
            <div className={className}>
                <div className={"yahtzee-tcell"}>
                    <ProfileImage picture={player.getPicture()} username={player.getUsername()} id={player.getId()} />
                </div>
                {this.renderCell(playerScore.gather?.one,playerScore.gather?.one === undefined, undefined,
                    clickListener, scoreCellIDs.ONE)}
                {this.renderCell(playerScore.gather?.two,playerScore.gather?.two === undefined, undefined,
                    clickListener, scoreCellIDs.TWO)}
                {this.renderCell(playerScore.gather?.three,playerScore.gather?.three === undefined, undefined,
                    clickListener, scoreCellIDs.THREE)}
                {this.renderCell(playerScore.gather?.four,playerScore.gather?.four === undefined, undefined,
                    clickListener, scoreCellIDs.FOUR)}
                {this.renderCell(playerScore.gather?.five,playerScore.gather?.five === undefined, undefined,
                    clickListener, scoreCellIDs.FIVE)}
                {this.renderCell(playerScore.gather?.six,playerScore.gather?.six === undefined, undefined,
                    clickListener, scoreCellIDs.SIX)}
                {this.renderCell(totalFirstPart >= 63 ? 35 : 0,false)}
                {this.renderCell(playerScore.threeOfAKind,playerScore.threeOfAKind === undefined, undefined,
                    clickListener, scoreCellIDs.THREE_OF_A_KIND)}
                {this.renderCell(playerScore.fourOfAKind,playerScore.fourOfAKind === undefined, undefined,
                    clickListener, scoreCellIDs.FOUR_OF_A_KIND)}
                {this.renderCell(playerScore.fullHouse,playerScore.fullHouse === undefined, undefined,
                    clickListener, scoreCellIDs.FULL_HOUSE)}
                {this.renderCell(playerScore.smallStraight,playerScore.smallStraight === undefined, undefined,
                    clickListener, scoreCellIDs.SMALL_STRAIGHT)}
                {this.renderCell(playerScore.largeStraight,playerScore.largeStraight === undefined, undefined,
                    clickListener, scoreCellIDs.LARGE_STRAIGHT)}
                {this.renderCell(playerScore.fiveOfAKind,playerScore.fiveOfAKind === undefined, undefined,
                    clickListener, scoreCellIDs.FIVE_OF_A_KIND)}
                {this.renderCell(playerScore.chance,playerScore.chance === undefined, undefined,
                    clickListener, scoreCellIDs.CHANCE)}
                {this.renderCell('',false)}
                {this.renderCell(playerScore.total,false)}
            </div>
        );
    }


    renderCell(value: number|string|undefined,
               isAvailable: boolean,
               title: string|undefined = undefined,
               onClick: Function|undefined = undefined,
               cellIdentifier: number|string|undefined = undefined,
    ): JSX.Element {
        let className = "yahtzee-tcell" +
            (isAvailable && this.props.allowCellClick ? ' is-available-cell' : '');
        return (
            <div className={className}
                title={title}
                onClick={() => (onClick && isAvailable) ? onClick(cellIdentifier) : null}
            >{value}</div>
        );
    }

}