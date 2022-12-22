import {Team} from "../Team";
import {BoardElement} from "../BoardElement";
import debug from "../../../framework/util/debug";
import Room from "../../../framework/Room";
import {Hint} from "../Hint";

export default abstract class AbstractState {

    abstract getName():string

    //TODO2: refactor all paramaters to new class "gameparts" or such
    abstract onStateChange(eventData: { [p: string]: any }, gameMembers: Team[], room: Room, board: BoardElement[], hint: Hint)
        : AbstractState

    abstract handleUserLeave(gameMembers: Team[], userid: string): void

    doesEventPropertyExist(eventData: { [p: string]: any }, propertyName: string): Boolean{
        if(eventData.hasOwnProperty(propertyName)){
            return true
        } else {
            debug(2,`User ID ${eventData.senderId} made illegal request, property `
                + propertyName + ' is missing')
            return false
        }
    }

    debugIllegalPropertyValue(senderId: string, propertyName: string, value: any){
        debug(2,`User ID ${senderId} made illegal request, no such property: `+propertyName+" with value: "
            + value);
    }
}