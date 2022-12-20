import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";
import debug from "../../framework/util/debug";
import AbstractState from "./gameStates/AbstractState";
import InitialState from "./gameStates/InitialState";
import {Team} from "./Team";
import Room from "../../framework/Room";
import {BoardElement, Category} from "./BoardElement";


/*
 * The actual game instance, that controls and manages the game
 */
export default class CodenamesGame implements ModuleGameInterface {

    roomApi: ModuleRoomApi|null = null;
    gameState: AbstractState
    gameMembers: Team[]
    room: Room
    board: BoardElement[] = []

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.room = this.roomApi.getRoom();
        this.roomApi.addUserLeaveHandler(this.onUserLeave.bind(this))
        // TODO: repair on user joined handler
        this.roomApi.addUserJoinedHandler(this.onUserJoin.bind(this))
        this.roomApi.addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
        this.gameState = new InitialState()
        this.gameMembers = [
            new Team("A", 5),
            new Team("B", 5)
        ]
        this.sendCurrentStateOfGame()

        // TODO: add real data
        for (let i = 0; i < 5; i++) {
            this.board.push(new BoardElement("teamA", Category.team, "A"))
        }
        for (let i = 0; i < 5; i++) {
            this.board.push(new BoardElement("teamB", Category.team, "B"))
        }
        this.board.push(new BoardElement("bomb", Category.bomb, ""))
        for (let i = 0; i < 14; i++) {
            this.board.push(new BoardElement("neutral", Category.neutral, ""))
        }
    }

    onUserJoin() {
        this.sendCurrentStateOfGame()
    }

    onUserLeave(eventData: {[key: string]: any}) {
        this.gameState.handleUserLeave(this.gameMembers, eventData.senderId)
        this.sendCurrentStateOfGame()
    }

    onUserMessageReceived(eventData: {[key: string]: any}) {
        debug(0,`User ID ${eventData.senderId} send in message: `, eventData.action);
        this.gameState = this.gameState.onStateChange(eventData, this.gameMembers, this.room, this.board)
        this.sendCurrentStateOfGame()
    }

    sendCurrentStateOfGame(){
        this.roomApi.sendRoomMessage('serverMessageSend', {
            state: this.gameState.getName(),
            teams: this.gameMembers.map(team => ({
                name: team.name,
                spymaster: this.getUserNameById(team.spymaster),
                investigators: team.investigators.map(inv => this.getUserNameById(inv)),
            } as Team))
            // TODO: send boardview for each userRole
        });
        debug(0,`New internal State: `, this.gameMembers, this.gameState.getName());
    }

    getUserNameById(userId: string): string {
        return this.room.getRoomMembers()?.find(member => member.getId() === userId)?.getUsername() ?? ""
    }
}