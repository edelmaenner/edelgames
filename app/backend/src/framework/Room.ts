import User from "./User";
import SocketMessenger from "./util/SocketMessenger";
import RoomManager from "./RoomManager";
import ModuleRoomApi from "./modules/ModuleRoomApi";
import debug from "./util/debug";

export default class Room {

    protected roomId: string;
    protected roomName: string;
    protected roomMembers: User[] = [];
    protected roomMaster: User|null;
    protected roomPassword: string|null = null;
    protected currentModuleRoomApi: ModuleRoomApi|null = null;

    constructor(roomMaster: User|null) {
        this.roomId = this.createIdHash();
        this.roomName = 'room'+this.roomId;
        this.roomMaster = roomMaster;
        if(roomMaster) this.roomMembers = [roomMaster];

        debug(2, `created room ${this.roomName} (${this.roomId}) with user ${this.roomMaster ? this.roomMaster.getId() : 'NONE'}`);
    }

    public getRoomId():         string      {return this.roomId;}
    public getRoomName():       string      {return this.roomName;}
    public getRoomMembers():    User[]      {return this.roomMembers}
    public getRoomPassword():   string|null {return this.roomPassword}
    public getCurrentGameId():  string|null {return this.currentModuleRoomApi ? this.currentModuleRoomApi.getGameId() : null}
    public getRoomMaster():     User|null   {
        // if we don´t have a room master, we select another user as the room master
        if(this.roomMaster === null && this.roomMembers.length > 0) {
            this.roomMaster = this.roomMembers[0];
        }
        return this.roomMaster;
    }

    public setRoomName(newName: string): void  {
        this.roomName = newName;
        this.sendRoomChangedBroadcast();
    }

    public setCurrentGame(roomApi: ModuleRoomApi|null) {
        if(this.currentModuleRoomApi && roomApi === null) {
            this.currentModuleRoomApi.alertEvent('gameStopped', {});
            debug(1, `stopped current game ${this.currentModuleRoomApi.getGameId()} in room ${this.roomId}`);
        }

        this.currentModuleRoomApi = roomApi;
        this.sendRoomChangedBroadcast();

        debug(1, `started game ${roomApi ? roomApi.getGameId() : 'IDLE'} in room ${this.roomId}`);
    }

    public onUserNotifiedGame(userId: string, eventName: string, eventData: {[key: string]: any}) {
        if(this.currentModuleRoomApi) {
            this.currentModuleRoomApi.alertEvent(eventName, {
                senderId: userId,
                ...eventData
            }, true);
            debug(1, `user ${userId} notified the gameEvent ${eventName}`);
        }
    }

    /*
     * alerts every member of this room, that something has changed, so data can be refreshed
     */
    public sendRoomChangedBroadcast(): void {
        this.broadcastRoomMembers('roomChanged', {
            roomId: this.roomId,
            roomName: this.roomName,
            roomMembers: this.getPublicRoomMemberList(),
            currentGameId: this.currentModuleRoomApi ? this.currentModuleRoomApi.getGameId() : null
        });

        RoomManager.updateLobbyMembersRoomData();
    }

    /*
     * Sends a message with the given event to every member of this room
     */
    public broadcastRoomMembers(eventName: string, data: object): void {
        SocketMessenger.broadcast(this.roomId, eventName, data);
    }

    private createIdHash(): string {
        return Math.random().toString().slice(2);
    }

    public getMemberCount(): number {
        return this.roomMembers.length;
    }

    /*
     * Adds the given user to the current room. If a passphrase is used, it will be checked and eventually block the user from joining
     */
    public joinRoom(newMember: User, passphrase: string|null = null): boolean {
        if(passphrase !== this.roomPassword) {
            return false;
        }

        this.roomMembers.push(newMember);
        if(this.currentModuleRoomApi) {
            this.currentModuleRoomApi.alertEvent('userJoined', {
                newUser: newMember,
                userList: this.getPublicRoomMemberList()
            });
        }
        newMember.switchRoom(this).then(this.sendRoomChangedBroadcast.bind(this));

        debug(2, `user ${newMember.getId()} joined room ${this.roomId} (using passphrase: ${this.roomPassword ? 'yes' : 'no'})`);
        return true;
    }

    /**
     * @internal
     * this should only be called, when the user object also changes! never on its own!
     * otherwise there could be a user in a room, that is not registered in said room.
     *
     * So. simply. dont. use. this. method. if. you. dont. know. what. you. will. cause. thanks.
     */
    public removeUserFromRoom(user: User) {
        this.roomMembers = this.roomMembers.filter((member) => member !== user);

        if(this.currentModuleRoomApi) {
            this.currentModuleRoomApi.alertEvent('userLeft', {
                removedUser: user,
                userList: this.getPublicRoomMemberList()
            });
        }

        if(this.getMemberCount() === 0) {
            this.setCurrentGame(null);
            RoomManager.removeRoom(this);
        }
        else if (this.roomMaster === user) {
            this.roomMaster = this.roomMembers[0];
        }

        this.sendRoomChangedBroadcast();
        debug(2, `user ${user.getId()} left room ${this.roomId}`);
    }

    /*
     * Returns a version of the member list of this room, that only contains public information
     */
    getPublicRoomMemberList(): object[] {
        return this.roomMembers.map((member: User) => {
            return {
                username:   member.getUsername(),
                id:         member.getId(),
                picture:    member.getPictureUrl(),
                isRoomMaster: member === this.roomMaster
            };
        });
    }
}