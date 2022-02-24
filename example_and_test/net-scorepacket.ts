import { ScorePacketInfo, SetDisplayObjectivePacket, SetScorePacket } from "bdsx/bds/packets";
import { command } from "bdsx/command";

command.register('example_score', 'score packet example').overload((params, origin, output)=>{
    const actor = origin.getEntity();
    if (actor?.isPlayer()) {

        // SetDisplayObjectivePacket
        const displaypacket = SetDisplayObjectivePacket.allocate();
        displaypacket.displaySlot = 'sidebar';
        displaypacket.objectiveName = 'objective';
        displaypacket.displayName = 'name';
        displaypacket.criteriaName = 'dummy';
        displaypacket.sendTo(actor.getNetworkIdentifier());
        displaypacket.dispose();

        // SetScorePacket
        const entry = ScorePacketInfo.construct();
        entry.scoreboardId.idAsNumber = 1;
        entry.objectiveName = 'objective';
        entry.customName = 'custom';
        entry.type = ScorePacketInfo.Type.PLAYER;
        entry.playerEntityUniqueId = actor.getUniqueIdBin();
        entry.score = 1000;

        const packet = SetScorePacket.allocate();
        packet.type = SetScorePacket.Type.CHANGE;
        packet.entries.push(entry);
        packet.sendTo(actor.getNetworkIdentifier());
        packet.dispose();

        entry.destruct();
    }
}, {});
