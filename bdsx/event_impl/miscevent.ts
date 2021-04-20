import { procHacker } from "../bds/proc";
import { serverInstance } from "../bds/server";
import { VoidPointer } from "../core";
import { events } from "../event";
import { bin64_t, bool_t, int32_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";

interface IQueryRegenerateEvent {
    motd: string,
    levelname: string,
    currentPlayers: number,
    maxPlayers: number,

}
export class QueryRegenerateEvent implements IQueryRegenerateEvent {
    constructor(
        public motd: string,
        public levelname: string,
        public currentPlayers: number,
        public maxPlayers: number,
    ) {
    }
}

events.serverOpen.on(()=>{
    const _onQueryRegenerate = procHacker.hooking("RakNetServerLocator::announceServer", bin64_t, null, VoidPointer, CxxStringWrapper, CxxStringWrapper, VoidPointer, int32_t, int32_t, bool_t)(onQueryRegenerate);
    function onQueryRegenerate(rakNetServerLocator: VoidPointer, motd: CxxStringWrapper, levelname: CxxStringWrapper, gameType: VoidPointer, currentPlayers: number, maxPlayers: number, v: boolean):bin64_t {
        const event = new QueryRegenerateEvent(motd.value, levelname.value, currentPlayers, maxPlayers);
        events.queryRegenerate.fire(event);
        motd.value = event.motd;
        levelname.value = event.levelname;
        return _onQueryRegenerate(rakNetServerLocator, motd, levelname, gameType, event.currentPlayers, event.maxPlayers, v);
    }
    serverInstance.minecraft.something.shandler.updateServerAnnouncement();
});
