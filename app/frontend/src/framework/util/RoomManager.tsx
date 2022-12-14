/**
 * Stores and manages all data of the current room
 */
import User from "./User";
import EventManager, {EventNameListObj} from "./EventManager";

export const RoomEventNames: EventNameListObj = {
    roomChangedEventNotified: "roomChangedEventNotified",
    lobbyRoomsChangedEventNotified: "lobbyRoomsChangedEventNotified",
    roomUpdated: "roomUpdated"
}

export type ServerRoomMember = {
    id: string;
    username: string;
    picture: string|null;
    isRoomMaster: boolean;
}

type ServerRoomObject = {
    roomId: string;
    roomName: string;
    roomMembers: ServerRoomMember[];
    currentGameId: string;
}


export class RoomManagerSingleton {

    private roomId: string = 'lobby';
    private roomName: string = 'Lobby';
    private roomMembers: User[] = [];
    private roomMaster: User|null = null;
    private currentGameId: string = '';

    constructor() {
        EventManager.subscribe(RoomEventNames.roomChangedEventNotified, this.onRoomChangedChannelNotified.bind(this))
    }

    onRoomChangedChannelNotified(data: ServerRoomObject): void {
        this.roomId = data.roomId;
        this.roomName = data.roomName;
        this.currentGameId = data.currentGameId;

        // calculate new room members
        let roomMembers : User[] = [];
        for(let member of data.roomMembers) {
            let user = new User(
                member.id,
                member.username,
                member.picture,
                member.isRoomMaster
            );

            if(member.isRoomMaster) {
                this.roomMaster = user;
            }

            roomMembers.push(user);
        }
        this.roomMembers = roomMembers;

        EventManager.publish(RoomEventNames.roomUpdated);
    }

    public getRoomId():         string      { return this.roomId; }
    public getRoomName():       string      { return this.roomName; }
    public getRoomMembers():    User[]      { return this.roomMembers; }
    public getRoomMaster():     User|null   { return this.roomMaster; }
    public getCurrentGameId():  string      {return this.currentGameId; }
}

const RoomManager = new RoomManagerSingleton();
export default RoomManager;