import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";
import debug from "../../framework/util/debug";
import AbstractState from "./gameStates/AbstractState";
import InitialState from "./gameStates/InitialState";
import {Team} from "./Team";
import Room from "../../framework/Room";
import {BoardElement, Category} from "./BoardElement";
import {Hint} from "./Hint";

/*
 * The actual game instance, that controls and manages the game
 */
export default class CodenamesGame implements ModuleGameInterface {
    roomApi: ModuleRoomApi|null = null;
    gameState: AbstractState
    gameMembers: Team[]
    room: Room
    board: BoardElement[] = []
    hint: Hint

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.room = this.roomApi.getRoom();
        this.roomApi.addUserLeaveHandler(this.onUserLeave.bind(this))
        this.roomApi.addUserJoinedHandler(this.onUserJoin.bind(this))
        this.roomApi.addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
        this.roomApi.addEventHandler('requestGameState', this.onGameStateRequest.bind(this));
        this.gameState = new InitialState()
        this.gameMembers = [
            new Team("A", 5),
            new Team("B", 5)
        ]
        this.sendCurrentStateOfGame()
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
        // FIXME: Eine Änderungen am gameState bewirkt KEINE Änderung an den hier gehaltenen Variablen! Ausnahme: Board und GameMembers, da diese Arrays sind
        this.gameState = this.gameState.onStateChange(eventData, this.gameMembers, this.room, this.board, this.hint)
        this.sendCurrentStateOfGame()
    }

    onGameStateRequest(eventData: {[key: string]: any}) {
        debug(0,`User ID ${eventData.senderId} requestes current gameState`);
        this.sendCurrentStateOfGame()
    }

    sendCurrentStateOfGame(){
        this.roomApi.sendRoomMessage('serverMessageSend', {
            state: this.gameState.getName(),
            teams: this.gameMembers.map(team => ({
                name: team.name,
                spymaster: this.getUserNameById(team.spymaster),
                wordsLeft: team.wordsLeft,
                investigators: team.investigators.map(inv => this.getUserNameById(inv)),
            } as Team)),
            hint: this.hint
        });
        this.roomApi.getRoom().getRoomMembers().forEach(member => this.roomApi.sendPlayerMessage(
            member.getId(),
            "userSpecificBoardViewSent",
            {
                board: this.generateUserBoard(member.getId()),
            }
        ))
        debug(0,`New internal State: `, this.gameMembers, this.gameState.getName());
    }

    getUserNameById(userId: string): string {
        return this.room.getRoomMembers()?.find(member => member.getId() === userId)?.getUsername() ?? ""
    }

    generateUserBoard(receiverId: string):BoardElement[]{
        return this.board.map((element:BoardElement) => ({
            word: element.word,
            marked: element.marked,
            category: this.filterCategory(receiverId, element.category, element.categoryVisibleForEveryone),
            teamName: this.filterTeamName(receiverId, element.teamName, element.categoryVisibleForEveryone)

        }) as BoardElement)
    }

    filterCategory(receiverId: string, cardCategory: Category, cardVisible: Boolean): Category | undefined {
        if(this.gameMembers.find(team => team.spymaster === receiverId) || cardVisible){
            return cardCategory
        }
        return undefined
    }

    filterTeamName(receiverId: string, cardTeamName: string, cardVisible: Boolean): string | undefined {
        if(this.gameMembers.find(team => team.spymaster === receiverId) || cardVisible){
            return cardTeamName
        }
        return undefined
    }
}