import {Team} from "../Team";
import {BoardElement} from "../BoardElement";
import Room from "../../../framework/Room";
import {Hint} from "../Hint";
import ModuleApi from "../../../framework/modules/ModuleApi";

export default abstract class AbstractState {
    protected gameApi: ModuleApi;

    constructor(gameApi: ModuleApi) {
        this.gameApi = gameApi;
    }

    abstract getName():string

    //TODO2: refactor all paramaters to new class "gameparts" or such
    abstract onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[], hint: Hint[])
        : AbstractState

    abstract handleUserLeave(gameMembers: Team[], userid: string): void

    doesEventPropertyExist(eventData: { [p: string]: any }, propertyName: string): Boolean{
        if(eventData.hasOwnProperty(propertyName)){
            return true
        } else {
            this.gameApi.getLogger().warning(`User ID ${eventData.senderId} made illegal request, property `
                + propertyName + ' is missing')
            return false
        }
    }

    debugIllegalPropertyValue(senderId: string, propertyName: string, value: any){
        this.gameApi.getLogger().warning(`User ID ${senderId} made illegal request, no such property: `+propertyName+" with value: "
            + value);
    }
}