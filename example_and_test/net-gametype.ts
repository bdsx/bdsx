import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { UpdatePlayerGameTypePacket } from "bdsx/bds/packets";
import { GameType, Player } from "bdsx/bds/player";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";

// sample function for an example
function setPlayerGameType(player: Player, type: GameType): boolean {
    try {
        player.setGameType(type);
        const pkt = UpdatePlayerGameTypePacket.allocate();
        pkt.gameType = type;
        pkt.playerId = player.getUniqueIdBin();
        player.sendNetworkPacket(pkt);
        pkt.dispose();
    } catch {
        return false;
    }
    return true;
}

// Anti gamemode spoof
events.packetBefore(MinecraftPacketIds.SetPlayerGameType).on((pkt, ni) => {
    const player = ni.getActor();
    if (!player) return;
    setPlayerGameType(player, GameType.Adventure);
    return CANCEL;
});
