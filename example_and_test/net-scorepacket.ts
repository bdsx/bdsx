import { ScorePacketInfo, ServerPlayer, SetDisplayObjectivePacket, SetScorePacket } from "bdsx/minecraft";
import { bdsx } from "bdsx/v3";

bdsx.command.register('example_score', 'score packet example').overload((params, origin, output)=>{
    const actor = origin.getEntity();
    if (actor instanceof ServerPlayer) {

        // SetDisplayObjectivePacket
        const displaypacket = SetDisplayObjectivePacket.create();
        displaypacket.displaySlot = 'sidebar';
        displaypacket.objectiveName = 'objective';
        displaypacket.displayName = 'name';
        displaypacket.criteriaName = 'dummy';
        actor.sendNetworkPacket(displaypacket);
        displaypacket.dispose();

        // SetScorePacket
        const entry = ScorePacketInfo.construct();
        entry.scoreboardId.idAsNumber = 1;
        entry.objectiveName = 'objective';
        entry.customName = 'custom';
        entry.type = ScorePacketInfo.Type.PLAYER;
        entry.playerEntityUniqueId = actor.getUniqueID().value;
        entry.score = 1000;

        const packet = SetScorePacket.create();
        packet.type = SetScorePacket.Type.CHANGE;
        packet.entries.push(entry);
        packet.sendTo(actor.networkIdentifier);
        packet.dispose();

        entry.destruct();
    }
}, {});
