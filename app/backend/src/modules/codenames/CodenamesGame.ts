import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
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
    gameApi: ModuleApi|null = null;
    gameState: AbstractState
    gameMembers: Team[]
    room: Room
    board: BoardElement[] = []
    hint: Hint

    onGameInitialize(gameApi: ModuleApi): void {
        this.gameApi = gameApi;
        this.room = this.gameApi.getPlayerApi().getRoom();
        this.gameApi.getEventApi().addUserLeaveHandler(this.onUserLeave.bind(this))
        this.gameApi.getEventApi().addUserJoinedHandler(this.onUserJoin.bind(this))
        this.gameApi.getEventApi().addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
        this.gameApi.getEventApi().addEventHandler('requestGameState', this.onGameStateRequest.bind(this));
        this.gameState = new InitialState(gameApi)
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
        this.gameApi.getLogger().debug(`User ID ${eventData.senderId} send in message: `, eventData.action);
        // FIXME: Eine Änderungen am gameState bewirkt KEINE Änderung an den hier gehaltenen Variablen! Ausnahme: Board und GameMembers, da diese Arrays sind
        this.gameState = this.gameState.onStateChange(eventData, this.gameMembers, this.room, this.board, this.hint)
        this.sendCurrentStateOfGame()
    }

    onGameStateRequest(eventData: {[key: string]: any}) {
        this.gameApi.getLogger().debug(`User ID ${eventData.senderId} requestes current gameState`);
        this.sendCurrentStateOfGame()
    }

    sendCurrentStateOfGame(){
        this.gameApi.getEventApi().sendRoomMessage('serverMessageSend', {
            state: this.gameState.getName(),
            teams: this.gameMembers.map(team => ({
                name: team.name,
                spymaster: this.getUserNameById(team.spymaster),
                wordsLeft: team.wordsLeft,
                investigators: team.investigators.map(inv => this.getUserNameById(inv)),
                active: team.active,
            } as Team)),
            hint: this.hint
        });
        this.gameApi.getPlayerApi().getRoom().getRoomMembers().forEach(member => this.gameApi.getEventApi().sendPlayerMessage(
            member.getId(),
            "userSpecificBoardViewSent",
            {
                board: this.generateUserBoard(member.getId()),
            }
        ))
        this.gameApi.getLogger().debug(`New internal State: `, this.gameMembers, this.gameState.getName());
    }

    getUserNameById(userId: string): string {
        return this.room.getRoomMembers()?.find(member => member.getId() === userId)?.getUsername() ?? ""
    }

    generateUserBoard(receiverId: string):BoardElement[]{
        return this.board.map((element:BoardElement) => ({
            word: element.word,
            marks: element.marks,
            category: this.filterCategory(receiverId, element.category, element.categoryVisibleForEveryone),
            teamName: this.filterTeamName(receiverId, element.teamName, element.categoryVisibleForEveryone),
            categoryVisibleForEveryone: element.categoryVisibleForEveryone
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