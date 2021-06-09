
// Parse raw packet
// referenced from https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/MovePlayerPacket.php
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { bin } from "bdsx/bin";
import { events } from "bdsx/event";
import { RawPacket } from "bdsx/rawpacket";
import { setRecentSendedPacketForTest } from "./test";

events.packetRaw(MinecraftPacketIds.MovePlayer).on((ptr, size, ni)=>{
    console.log(`Packet Id: ${ptr.readVarInt()&0x3ff}`);

    const runtimeId = ptr.readVarBin();
    const x = ptr.readFloat32();
    const y = ptr.readFloat32();
    const z = ptr.readFloat32();
    const pitch = ptr.readFloat32();
    const yaw = ptr.readFloat32();
    const headYaw = ptr.readFloat32();
    const mode = ptr.readUint8();
    const onGround = ptr.readUint8() !== 0;
    console.log(`move: ${bin.toString(runtimeId, 16)} ${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)} ${pitch.toFixed(1)} ${yaw.toFixed(1)} ${headYaw.toFixed(1)} ${mode} ${onGround}`);

    // part of testing
    setRecentSendedPacketForTest(MinecraftPacketIds.Text);

    // https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/TextPacket.php
    const packet = new RawPacket(MinecraftPacketIds.Text);
    packet.writeUint8(0); // type
    packet.writeBoolean(false); // needsTranslation
    packet.writeVarString(`[rawpacket message] move ${x.toFixed(1)} ${y.toFixed()} ${z.toFixed()}`); // message
    packet.writeVarString(''); // xboxUserId
    packet.writeVarString(''); // platformChatId
    packet.sendTo(ni);
});
// referenced from https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/CraftingEventPacket.php
events.packetRaw(MinecraftPacketIds.CraftingEvent).on((ptr, size, ni)=>{
    console.log(`Packet Id: ${ptr.readVarInt()&0x3ff}`);

    const windowId = ptr.readUint8();
    const type = ptr.readVarInt();

    const uuid1 = ptr.readUint32();
    const uuid2 = ptr.readUint32();
    const uuid3 = ptr.readUint32();
    const uuid4 = ptr.readUint32();

    console.log(`crafting: ${windowId} ${type} ${uuid1} ${uuid2} ${uuid3} ${uuid4}`);
    const size1 = ptr.readVarUint();
    // need to parse more
});
