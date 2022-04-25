import { Actor } from "../bds/actor";
import { Block, BlockSource, ButtonBlock, ChestBlock, ChestBlockActor } from "../bds/block";
import { BlockPos } from "../bds/blockpos";
import { ItemStack } from "../bds/inventory";
import { Player, ServerPlayer } from "../bds/player";
import { VanillaServerGameplayEventListener } from "../bds/server";
import { CANCEL } from "../common";
import { NativePointer, StaticPointer } from "../core";
import { decay } from "../decay";
import { events } from "../event";
import { bool_t, float32_t, int32_t, uint8_t, void_t } from "../nativetype";
import { procHacker } from "../prochacker";

export class BlockDestroyEvent {
    constructor(
        public player: ServerPlayer,
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public itemStack: ItemStack,
        public generateParticle: boolean,
    ) {
    }
}

export class BlockDestructionStartEvent {
    constructor(
        public player: ServerPlayer,
        public blockPos: BlockPos,
    ) {
    }
}

export class BlockPlaceEvent {
    constructor(
        public player: ServerPlayer,
        public block: Block,
        public blockSource: BlockSource,
        public blockPos: BlockPos,
    ) {
    }
}

export enum PistonAction {
    Extend = 1,
    Retract = 3,
}
export class PistonMoveEvent {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public action: PistonAction,
    ) {
    }
}

export class FarmlandDecayEvent {
    constructor(
        public block: Block,
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public culprit: Actor,
    ) {
    }
}

export class CampfireTryLightFire {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource,
    ) {
    }
}

export class CampfireTryDouseFire {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource,
    ) {
    }
}

export class ButtonPressEvent {
    constructor(
        public buttonBlock: ButtonBlock,
        public player: Player,
        public blockPos: BlockPos,
        public playerOrientation: number,
    ) {
    }
}

export class ChestOpenEvent {
    constructor(
        public chestBlock: ChestBlock,
        public player: Player,
        public blockPos: BlockPos,
        public face: number,
    ) {
    }
}

export class ChestPairEvent {
    /**
     * @param lead - Whether the chest is the lead chest.
     */
    constructor(
        readonly chest: ChestBlockActor,
        readonly chest2: ChestBlockActor,
        readonly lead: boolean,
    ) {
    }
}

function onBlockDestroy(blockSource:BlockSource, actor:Actor, blockPos:BlockPos, itemStack:ItemStack, generateParticle:bool_t):boolean {
    const event = new BlockDestroyEvent(actor as ServerPlayer, blockPos, blockSource, itemStack, generateParticle);
    const canceled = events.blockDestroy.fire(event) === CANCEL;
    decay(blockSource);
    decay(blockPos);
    decay(itemStack);
    if (canceled) {
        return false;
    } else {
        return _onBlockDestroy(event.blockSource, event.player, event.blockPos, event.itemStack, event.generateParticle);
    }
}
const _onBlockDestroy = procHacker.hooking("?checkBlockDestroyPermissions@BlockSource@@QEAA_NAEAVActor@@AEBVBlockPos@@AEBVItemStackBase@@_N@Z", bool_t, null, BlockSource, Actor, BlockPos, ItemStack, bool_t)(onBlockDestroy);

function onBlockDestructionStart(blockEventCoordinator:StaticPointer, player:Player, blockPos:BlockPos):void {
    const event = new BlockDestructionStartEvent(player as ServerPlayer, blockPos);
    events.blockDestructionStart.fire(event);
    decay(blockPos);
    return _onBlockDestructionStart(blockEventCoordinator, event.player, event.blockPos);
}
const _onBlockDestructionStart = procHacker.hooking("?sendBlockDestructionStarted@BlockEventCoordinator@@QEAAXAEAVPlayer@@AEBVBlockPos@@@Z", void_t, null, StaticPointer, Player, BlockPos)(onBlockDestructionStart);

function onBlockPlace(blockSource:BlockSource, block:Block, blockPos:BlockPos, facing:number, actor:Actor, ignoreEntities:boolean):boolean {
    const ret = _onBlockPlace(blockSource, block, blockPos, facing, actor, ignoreEntities);
    if (!ret) return false;
    const event = new BlockPlaceEvent(actor as ServerPlayer, block, blockSource, blockPos);
    const canceled = events.blockPlace.fire(event) === CANCEL;
    decay(blockSource);
    decay(block);
    decay(blockPos);
    if (canceled) {
        return false;
    } else {
        return ret;
    }
}
const _onBlockPlace = procHacker.hooking("?mayPlace@BlockSource@@QEAA_NAEBVBlock@@AEBVBlockPos@@EPEAVActor@@_N@Z", bool_t, null, BlockSource, Block, BlockPos, int32_t, Actor, bool_t)(onBlockPlace);

function onPistonMove(pistonBlockActor:NativePointer, blockSource:BlockSource):void_t {
    const event = new PistonMoveEvent(BlockPos.create(pistonBlockActor.getInt32(0x2C), pistonBlockActor.getUint32(0x30), pistonBlockActor.getInt32(0x34)), blockSource, pistonBlockActor.getInt8(0xE0));
    events.pistonMove.fire(event);
    decay(pistonBlockActor);
    decay(blockSource);
    return _onPistonMove(pistonBlockActor, event.blockSource);
}
const _onPistonMove = procHacker.hooking("?_spawnMovingBlocks@PistonBlockActor@@AEAAXAEAVBlockSource@@@Z", void_t, null, NativePointer, BlockSource)(onPistonMove);

function onFarmlandDecay(block: Block, blockSource: BlockSource, blockPos: BlockPos, culprit: Actor, fallDistance: float32_t):void_t {
    const event = new FarmlandDecayEvent(block, blockPos, blockSource, culprit);
    const canceled = events.farmlandDecay.fire(event) === CANCEL;
    decay(block);
    decay(blockSource);
    decay(blockPos);
    if (!canceled) {
        return _onFarmlandDecay(event.block, event.blockSource, event.blockPos, event.culprit, fallDistance);
    }
}
const _onFarmlandDecay = procHacker.hooking("?transformOnFall@FarmBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@M@Z", void_t, null, Block, BlockSource, BlockPos, Actor, float32_t)(onFarmlandDecay);

function onCampfireTryLightFire(blockSource:BlockSource, blockPos:BlockPos):bool_t {
    const event = new CampfireTryLightFire(blockPos, blockSource);
    const canceled = events.campfireLight.fire(event) === CANCEL;
    decay(blockSource);
    decay(blockPos);
    if (canceled) return false;
    else return _CampfireTryLightFire(event.blockSource, event.blockPos);
}

const _CampfireTryLightFire = procHacker.hooking("?tryLightFire@CampfireBlock@@SA_NAEAVBlockSource@@AEBVBlockPos@@@Z", bool_t, null, BlockSource, BlockPos)(onCampfireTryLightFire);

function onCampfireTryDouseFire(blockSource:BlockSource, blockPos:BlockPos):bool_t {
    const event = new CampfireTryDouseFire(blockPos, blockSource);
    const canceled = events.campfireDouse.fire(event) === CANCEL;
    decay(blockSource);
    decay(blockPos);
    if (canceled) return false;
    else return _CampfireTryDouseFire(event.blockSource, event.blockPos);
}

const _CampfireTryDouseFire = procHacker.hooking("?tryDouseFire@CampfireBlock@@SA_NAEAVBlockSource@@AEBVBlockPos@@_N@Z", bool_t, null, BlockSource, BlockPos)(onCampfireTryDouseFire);

function onButtonPress(buttonBlock: ButtonBlock, player: Player, blockPos: BlockPos, playerOrientation: number): boolean {
    const event = new ButtonPressEvent(buttonBlock, player, blockPos, playerOrientation);
    const canceled = events.buttonPress.fire(event) === CANCEL;
    decay(blockPos);
    decay(buttonBlock);
    if (canceled) return false;
    return _onButtonPress(buttonBlock, player, blockPos, playerOrientation);
}

const _onButtonPress = procHacker.hooking("?use@ButtonBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z", bool_t, null, ButtonBlock, Player, BlockPos, uint8_t)(onButtonPress);

function onChestOpen(chestBlock: ChestBlock, player: Player, blockPos: BlockPos, face: number): boolean {
    const event = new ChestOpenEvent(chestBlock, player, blockPos, face);
    const canceled = events.chestOpen.fire(event) === CANCEL;
    decay(blockPos);
    decay(chestBlock);
    if (canceled) return false;
    return _onChestOpen(chestBlock, player, blockPos, face);
}

const _onChestOpen = procHacker.hooking("?use@ChestBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z", bool_t, null, ChestBlock, Player, BlockPos, uint8_t)(onChestOpen);

function onChestPair(chest: ChestBlockActor, chest2: ChestBlockActor, lead: bool_t): void {
    const event = new ChestPairEvent(chest, chest2, lead);
    const canceled = events.chestPair.fire(event) === CANCEL;
    decay(chest);
    decay(chest2);
    if (canceled) return;
    return _onChestPair(chest, chest2, lead);
}

const _onChestPair = procHacker.hooking("?pairWith@ChestBlockActor@@QEAAXPEAV1@_N@Z", void_t, null, ChestBlockActor, ChestBlockActor, bool_t)(onChestPair);

export class BlockInteractedWithEvent {
    constructor(public player: Player, public blockPos: BlockPos) {}
}
const _onBlockInteractedWith = procHacker.hooking(
    "?onBlockInteractedWith@VanillaServerGameplayEventListener@@UEAA?AW4EventResult@@AEAVPlayer@@AEBVBlockPos@@@Z",
    int32_t,
    null,
    VanillaServerGameplayEventListener,
    Player,
    BlockPos,
)((self, player, pos) => {
    const event = new BlockInteractedWithEvent(player, pos);
    const canceled = events.blockInteractedWith.fire(event) === CANCEL;
    if (canceled) return 1;
    return _onBlockInteractedWith(self, player, pos);
});

export class ProjectileHitBlockEvent {
    constructor(public block: Block, public region: BlockSource, public blockPos: BlockPos, public projectile: Actor) {}
}
function onProjectileHit(block: Block, region: BlockSource, blockPos: BlockPos, projectile: Actor): void {
    const event = new ProjectileHitBlockEvent(block, region, blockPos, projectile);
    events.projectileHitBlock.fire(event);
    decay(block);
    decay(region);
    decay(blockPos);
    return _onProjectileHit(block, region, blockPos, projectile);
}
const _onProjectileHit = procHacker.hooking("?onProjectileHit@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@AEBVActor@@@Z", void_t, null, Block, BlockSource, BlockPos, Actor)(onProjectileHit);

export class LightningHitBlockEvent {
    constructor(public block: Block, public region: BlockSource, public blockPos: BlockPos) {}
}
function onLightningHit(block: Block, region: BlockSource, blockPos: BlockPos): void {
    const event = new LightningHitBlockEvent(block, region, blockPos);
    events.lightningHitBlock.fire(event);
    decay(block);
    decay(region);
    decay(blockPos);
    return _onLightningHit(block, region, blockPos);
}
const _onLightningHit = procHacker.hooking("?onLightningHit@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@@Z", void_t, null, Block, BlockSource, BlockPos)(onLightningHit);

export class FallOnBlockEvent {
    constructor(public block: Block, public region: BlockSource, public blockPos: BlockPos, public entity: Actor, public height: number) {}
}
function onFallOn(block: Block, region: BlockSource, blockPos: BlockPos, entity: Actor, height: number): void {
    const event = new FallOnBlockEvent(block, region, blockPos, entity, height);
    events.fallOnBlock.fire(event);
    decay(block);
    decay(region);
    decay(blockPos);
    return _onFallOn(block, region, blockPos, entity, height);
}
const _onFallOn = procHacker.hooking("?onFallOn@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@AEAVActor@@M@Z", void_t, null, Block, BlockSource, BlockPos, Actor, float32_t)(onFallOn);

export class BlockAttackEvent {
    constructor(public block:Block, public player: Player | null, public blockPos: BlockPos) {}
}
function onBlockAttacked(block: Block, player: Player|null, blockPos: BlockPos): bool_t {
    const event = new BlockAttackEvent(block, player, blockPos);
    const canceled = events.attackBlock.fire(event) === CANCEL;
    if (canceled) return false;
    return Block$attack(block, player, blockPos);
}
const Block$attack = procHacker.hooking("?attack@Block@@QEBA_NPEAVPlayer@@AEBVBlockPos@@@Z", bool_t, null, Block, Player, BlockPos)(onBlockAttacked);
