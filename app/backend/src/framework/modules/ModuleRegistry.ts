import ModuleInterface from "./ModuleInterface";
import ModuleList from "../../modules/ModuleList";
import Room from "../Room";
import ModuleRoomApi from "./ModuleRoomApi";
import debug from "../util/debug";


class ModuleRegistry {

    public getModuleList(): ModuleInterface[] {
        return ModuleList;
    }

    public getModuleById(id: string): ModuleInterface|null {
        return this.getModuleList().find(module => module.getUniqueId() === id) || null;
    }

    public createGame(room: Room, gameId: string) {
        let module = this.getModuleById(gameId);

        if(!module) {
            debug(1, `Failed to start game with id ${gameId} for room ${room.getRoomId()}`);
            return;
        }

        let gameInstance = module.getGameInstance();
        let roomApi = new ModuleRoomApi(gameId, gameInstance, room);
    }

}


const moduleRegistry = new ModuleRegistry();
export default moduleRegistry;