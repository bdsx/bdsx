import { Actor, bedrockServer, MinecraftPacketIds, NativePointer, nethook, serverInstance } from "bdsx";
import { Block, BlockSource } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { GameMode, SurvivalMode } from "bdsx/bds/gamemode";
import { ItemStack } from "bdsx/bds/inventory";
import { Player } from "bdsx/bds/player";
import { procHacker } from "bdsx/bds/proc";
import { CANCEL } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import Event from "krevent";
import { AttributeId } from "./bds/attribute";
import { ScriptCustomEventPacket } from "./bds/packets";
import { bin64_t, bool_t, float32_t, int32_t } from "./nativetype";
import { CxxStringWrapper } from "./pointer";

interface IBlockDestroyEvent {
    player: Player;
    blockPos: BlockPos;
}
class BlockDestroyEvent implements IBlockDestroyEvent {
    constructor(
        public player: Player,
        public blockPos: BlockPos,
    ) {
    }
}

interface IBlockPlaceEvent {
    player: Player,
    block: Block,
    blockSource: BlockSource,
    blockPos: BlockPos;
}
class BlockPlaceEvent implements IBlockPlaceEvent {
    constructor(
        public player: Player,
        public block: Block,
        public blockSource: BlockSource,
        public blockPos: BlockPos,
    ) {
    }
}

interface IEntityHurtEvent {
    entity: Actor;
    damage: number;
}
class EntityHurtEvent implements IEntityHurtEvent {
    constructor(
        public entity: Actor,
        public damage: number,
    ) {
    }
}

interface IEntityHealEvent {
    entity: Actor;
    readonly damage: number;
}
class EntityHealEvent implements IEntityHealEvent {
    constructor(
        public entity: Actor,
        readonly damage: number,
    ) {
    }
}

interface IEntitySneakEvent {
    entity: Actor;
    isSneaking: boolean;
}
class EntitySneakEvent implements IEntitySneakEvent {
    constructor(
        public entity: Actor,
        public isSneaking: boolean,
    ) {
    }
}

interface IPlayerAttackEvent {
    player: Player;
    victim: Actor;
}
class PlayerAttackEvent implements IPlayerAttackEvent {
    constructor(
        public player: Player,
        public victim: Actor,
    ) {
    }
}

interface IPlayerDropItemEvent {
    player: Player;
    itemStack: ItemStack;
}
class PlayerDropItemEvent implements IPlayerDropItemEvent {
    constructor(
        public player: Player,
        public itemStack: ItemStack,
    ) {
    }
}

interface IPlayerJoinEvent {
    readonly player: Player;
}
class PlayerJoinEvent implements IPlayerJoinEvent {
    constructor(
        readonly player: Player,
    ) {
    }
}

interface IPlayerPickupItemEvent {
    player: Player;
    itemActor: Actor;
    //itemStack: ItemStack;
}
class PlayerPickupItemEvent implements IPlayerPickupItemEvent {
    constructor(
        public player: Player,
        public itemActor: Actor,
        //public itemStack: ItemStack, // should be from 0x688 at ItemActor but unexpected undefined value
    ) {
    }
}

interface IQueryRegenerateEvent {
    motd: string,
    levelname: string,
    currentPlayers: number,
    maxPlayers: number,

}
class QueryRegenerateEvent implements IQueryRegenerateEvent {
    constructor(
        public motd: string,
        public levelname: string,
        public currentPlayers: number,
        public maxPlayers: number,
    ) {
    }
}

export const events = {
    /** Cancellable */
    blockDestroy: new Event<(event: BlockDestroyEvent) => void | CANCEL>(),
    /** Cancellable */
    blockPlace: new Event<(event: BlockPlaceEvent) => void | CANCEL>(),
    /** Cancellable */
    entityHurt: new Event<(event: EntityHurtEvent) => void | CANCEL>(),
    /** Cancellable */
    entityHeal: new Event<(event: EntityHealEvent) => void | CANCEL>(),
    /** Cancellable */
    playerAttack: new Event<(event: PlayerAttackEvent) => void | CANCEL>(),
    /** Cancellable but only when player is in container screens*/
    playerDropItem: new Event<(event: PlayerDropItemEvent) => void | CANCEL>(),
    /** Not cancellable */
    entitySneak: new Event<(event: EntitySneakEvent) => void>(),
    /** Not cancellable */
    playerJoin: new Event<(event: PlayerJoinEvent) => void>(),
    /** Cancellable */
    playerPickupItem: new Event<(event: PlayerPickupItemEvent) => void | CANCEL>(),
    /** Not cancellable */
    queryRegenerate: new Event<(event: QueryRegenerateEvent) => void>(),
};

bedrockServer.open.on(() => {
    function onBlockDestroy(survivalMode:SurvivalMode, blockPos:BlockPos, v:number):boolean {
        const event = new BlockDestroyEvent(survivalMode.actor as Player, blockPos);
        if (events.blockDestroy.fire(event) === CANCEL) {
            return false;
        } else {
            survivalMode.actor = event.player;
            return _onBlockDestroy(survivalMode, event.blockPos, v);
        }
    }
    function onBlockDestroyCreative(gameMode:GameMode, blockPos:BlockPos, v:number):boolean {
        const event = new BlockDestroyEvent(gameMode.actor as Player, blockPos);
        if (events.blockDestroy.fire(event) === CANCEL) {
            return false;
        } else {
            gameMode.actor = event.player;
            return _onBlockDestroyCreative(gameMode, event.blockPos, v);
        }
    }
    const _onBlockDestroy = procHacker.hooking("SurvivalMode::destroyBlock", bool_t, null, SurvivalMode, BlockPos, int32_t)(onBlockDestroy);
    const _onBlockDestroyCreative = procHacker.hooking("GameMode::_creativeDestroyBlock", bool_t, null, SurvivalMode, BlockPos, int32_t)(onBlockDestroyCreative);

    function onBlockPlace(blockSource:BlockSource, block:Block, blockPos:BlockPos, v1:number, actor:Actor, v2:boolean):boolean {
        const event = new BlockPlaceEvent(actor as Player, block, blockSource, blockPos);
        if (events.blockPlace.fire(event) === CANCEL) {
            return false;
        } else {
            return _onBlockPlace(event.blockSource, event.block, event.blockPos, v1, event.player, v2);
        }
    }
    const _onBlockPlace = procHacker.hooking("BlockSource::mayPlace", bool_t, null, BlockSource, Block, BlockPos, int32_t, Actor, bool_t)(onBlockPlace);

    function onEntityHurt(entity: Actor, actorDamageSource: VoidPointer, damage: number, v1: boolean, v2: boolean):boolean {
        const event = new EntityHurtEvent(entity, damage);
        if (events.entityHurt.fire(event) === CANCEL) {
            return false;
        } else {
            return _onEntityHurt(event.entity, actorDamageSource, event.damage, v1, v2);
        }
    }
    const _onEntityHurt = procHacker.hooking("Actor::hurt", bool_t, null, Actor, VoidPointer, int32_t, bool_t, bool_t)(onEntityHurt);

    function onEntityHeal(attributeDelegate: NativePointer, oldHealth:number, newHealth:number, v:VoidPointer):boolean {
        if (oldHealth < newHealth) {
            const event = new EntityHurtEvent(attributeDelegate.getPointerAs(Actor, 0x20), newHealth - oldHealth);
            if (events.entityHeal.fire(event) === CANCEL) {
                event.entity.setAttribute(AttributeId.Health, oldHealth);
                return false;
            } else {
                attributeDelegate.setPointer(event.entity, 0x20);
                return _onEntityHeal(attributeDelegate, oldHealth, newHealth, v);
            }
        }
        return _onEntityHeal(attributeDelegate, oldHealth, newHealth, v);
    }
    const _onEntityHeal = procHacker.hooking("HealthAttributeDelegate::change", bool_t, null, NativePointer, float32_t, float32_t, VoidPointer)(onEntityHeal);

    function onEntitySneak(Script:ScriptCustomEventPacket, entity:Actor, isSneaking:boolean):boolean {
        const event = new EntitySneakEvent(entity, isSneaking);
        events.entitySneak.fire(event);
        return _onEntitySneak(Script, event.entity, event.isSneaking);
    }
    const _onEntitySneak = procHacker.hooking('ScriptServerActorEventListener::onActorSneakChanged', bool_t, null, ScriptCustomEventPacket, Actor, bool_t)(onEntitySneak);

    function onPlayerAttack(player:Player, victim:Actor):boolean {
        const event = new PlayerAttackEvent(player, victim);
        if (events.playerAttack.fire(event) === CANCEL) {
            return false;
        } else {
            return _onPlayerAttack(event.player, event.victim);
        }
    }
    const _onPlayerAttack = procHacker.hooking("Player::attack", bool_t, null, Player, Actor)(onPlayerAttack);

    function onPlayerDropItem(player:Player, itemStack:ItemStack, v:boolean):boolean {
        const event = new PlayerDropItemEvent(player, itemStack);
        if (events.playerDropItem.fire(event) === CANCEL) {
            return false;
        } else {
            return _onPlayerDropItem(event.player, event.itemStack, v);
        }
    }
    const _onPlayerDropItem = procHacker.hooking("Player::drop", bool_t, null, Player, ItemStack, bool_t)(onPlayerDropItem);

    nethook.before(MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) =>{
        const event = new PlayerJoinEvent(ni.getActor()!);
        events.playerJoin.fire(event);
    });

    function onPlayerPickupItem(player:Player, itemActor:Actor, v1:number, v2:number):boolean {
        const event = new PlayerPickupItemEvent(player, itemActor);
        if (events.playerPickupItem.fire(event) === CANCEL) {
            return false;
        } else {
            return _onPlayerPickupItem(event.player, itemActor, v1, v2);
        }
    }
    const _onPlayerPickupItem = procHacker.hooking("Player::take", bool_t, null, Player, Actor, int32_t, int32_t)(onPlayerPickupItem);

    function onQueryRegenerate(rakNetServerLocator: VoidPointer, motd: CxxStringWrapper, levelname: CxxStringWrapper, gameType: VoidPointer, currentPlayers: number, maxPlayers: number, v: boolean):bin64_t {
        const event = new QueryRegenerateEvent(motd.value, levelname.value, currentPlayers, maxPlayers);
        events.queryRegenerate.fire(event);
        motd.value = event.motd;
        levelname.value = event.levelname;
        return _onQueryRegenerate(rakNetServerLocator, motd, levelname, gameType, event.currentPlayers, event.maxPlayers, v);
    }
    const _onQueryRegenerate = procHacker.hooking("RakNetServerLocator::announceServer", bin64_t, null, VoidPointer, CxxStringWrapper, CxxStringWrapper, VoidPointer, int32_t, int32_t, bool_t)(onQueryRegenerate);

    serverInstance.minecraft.something.shandler.updateServerAnnouncement();
});