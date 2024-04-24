import { Actor } from "../bds/actor";
import { Block, BlockSource, ButtonBlock, ChestBlock, ChestBlockActor, PistonAction as PistonActorInBlockModule, PistonBlockActor } from "../bds/block";
import { BlockPos, Vec3 } from "../bds/blockpos";
import { GameMode } from "../bds/gamemode";
import { ItemStack } from "../bds/inventory";
import { Player, ServerPlayer } from "../bds/player";
import { VanillaServerGameplayEventListener } from "../bds/server";
import { CANCEL } from "../common";
import { StaticPointer } from "../core";
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
        /**
         * controls whether the server sends a deny effect, and is always 0 in all cases with the destroyer being a player
         * @deprecated not implemented
         */
        public generateParticle: boolean,
    ) {}
}

export class BlockDestructionStartEvent {
    constructor(public player: ServerPlayer, public blockPos: BlockPos) {}
}

export class BlockPlaceEvent {
    constructor(public player: ServerPlayer, public block: Block, public blockSource: BlockSource, public blockPos: BlockPos) {}
}

export class PistonCheckEvent {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public action: PistonActorInBlockModule,
        public affectedBlocks: BlockPos[],
        public facingDirection: BlockPos,
    ) {}
}

/** @deprecated import it from bdsx/bds/block.ts */
export const PistonAction = PistonActorInBlockModule;
/** @deprecated import it from bdsx/bds/block.ts */
export type PistonAction = PistonActorInBlockModule;

export class PistonMoveEvent {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public action: PistonActorInBlockModule,
        public affectedBlocks: BlockPos[],
        public facingDirection: BlockPos,
    ) {}
}

export class FarmlandDecayEvent {
    constructor(public block: Block, public blockPos: BlockPos, public blockSource: BlockSource, public culprit: Actor) {}
}

export class CampfireTryLightFire {
    constructor(public blockPos: BlockPos, public blockSource: BlockSource, public actor: Actor) {}
}

export class CampfireTryDouseFire {
    constructor(public blockPos: BlockPos, public blockSource: BlockSource, public actor: Actor) {}
}

export class ButtonPressEvent {
    constructor(public buttonBlock: ButtonBlock, public player: Player, public blockPos: BlockPos, public playerOrientation: number) {}
}

export class ChestOpenEvent {
    constructor(public chestBlock: ChestBlock, public player: Player, public blockPos: BlockPos, public face: number) {}
}

export class ChestPairEvent {
    /**
     * @param lead - Whether the chest is the lead chest.
     */
    constructor(readonly chest: ChestBlockActor, readonly chest2: ChestBlockActor, readonly lead: boolean) {}
}

events.blockDestroy.setInstaller(() => {
    function onBlockDestroy(gamemode: GameMode, blockPos: BlockPos, face: number): boolean {
        const player = gamemode.actor;
        /********************
         *   History
         * BlockSource::checkBlockDestroyPermissions
         * - fired multiple times if `server-authoritative-block-breaking` is enabled
         * - It has three refs: AgentCommands::DestroyCommand::isDone, GameMode::_canDestroy, GameMode::destroyBlock
         *
         * GameMode::destroyBlock - does not fired on the survival mode.
         * SurvivalMode::destroyBlock - it does not fire if the user changes the game mode to creative in game.
         *
         * GameMode::_creativeDestroyBlock - it did not work on server-authoritative-block-breaking=false
         * current hooking point - SurvivalMode::destroyBlock & GameMode::destroyBlock
         * - on server-authoritative-block-breaking=true & creative mode, GameMode::destroyBlock is fired twice
         */

        const blockSource = player.getRegion();
        const itemStack = player.getMainhandSlot();
        const event = new BlockDestroyEvent(player, blockPos, blockSource, itemStack, false);
        const canceled = events.blockDestroy.fire(event) === CANCEL;
        decay(blockPos);
        decay(blockSource);
        decay(itemStack);
        if (canceled) {
            return false;
        } else {
            return _onBlockDestroy(gamemode, event.blockPos, face);
        }
    }
    const _onBlockDestroy = procHacker.hooking("?destroyBlock@SurvivalMode@@UEAA_NAEBVBlockPos@@E@Z", bool_t, null, GameMode, BlockPos, uint8_t)(onBlockDestroy);

    function onCreativeBlockDestroy(gamemode: GameMode, blockPos: BlockPos, face: number): boolean {
        const player = gamemode.actor as ServerPlayer;
        const blockSource = player.getRegion();
        const itemStack = player.getMainhandSlot();

        if (player.isCreative()) {
            // bypass the sword destroy issue
            const item = itemStack.getItem();
            if (item !== null && !item.canDestroyInCreative()) {
                return _onCreativeBlockDestroy(gamemode, blockPos, face);
            }
        }

        const event = new BlockDestroyEvent(player, blockPos, blockSource, itemStack, false);
        const canceled = events.blockDestroy.fire(event) === CANCEL;
        decay(blockPos);
        decay(blockSource);
        decay(itemStack);
        if (canceled) {
            return false;
        } else {
            return _onCreativeBlockDestroy(gamemode, event.blockPos, face);
        }
    }
    const _onCreativeBlockDestroy = procHacker.hooking(
        "?destroyBlock@GameMode@@UEAA_NAEBVBlockPos@@E@Z",
        bool_t,
        null,
        GameMode,
        BlockPos,
        uint8_t,
    )(onCreativeBlockDestroy);
});

events.blockDestructionStart.setInstaller(() => {
    function onBlockDestructionStart(blockEventCoordinator: StaticPointer, player: Player, blockPos: BlockPos, block: Block, v: uint8_t): void {
        const event = new BlockDestructionStartEvent(player, blockPos);
        events.blockDestructionStart.fire(event);
        decay(blockPos);
        return _onBlockDestructionStart(blockEventCoordinator, event.player, event.blockPos, block, v);
    }
    const _onBlockDestructionStart = procHacker.hooking(
        "?sendBlockDestructionStarted@BlockEventCoordinator@@QEAAXAEAVPlayer@@AEBVBlockPos@@AEBVBlock@@E@Z",
        void_t,
        null,
        StaticPointer,
        Player,
        BlockPos,
        Block,
        uint8_t,
    )(onBlockDestructionStart);
});

events.blockPlace.setInstaller(() => {
    function onBlockPlace(
        blockSource: BlockSource,
        block: Block,
        blockPos: BlockPos,
        facing: number,
        actor: Actor | null,
        ignoreEntities: boolean,
        unknown: Vec3,
    ): boolean {
        const ret = _onBlockPlace(blockSource, block, blockPos, facing, actor, ignoreEntities, unknown);
        if (!(actor instanceof ServerPlayer)) return ret; // some mobs can call it. ignore all except players.
        if (!ret) return false;
        const event = new BlockPlaceEvent(actor, block, blockSource, blockPos);
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
    const _onBlockPlace = procHacker.hooking(
        "?mayPlace@BlockSource@@QEAA_NAEBVBlock@@AEBVBlockPos@@EPEAVActor@@_NVVec3@@@Z",
        bool_t,
        null,
        BlockSource,
        Block,
        BlockPos,
        int32_t,
        Actor,
        bool_t,
        Vec3,
    )(onBlockPlace);
});

events.pistonCheck.setInstaller(() => {
    const _onPistonCheck = procHacker.hooking(
        "?_attachedBlockWalker@PistonBlockActor@@AEAA_NAEAVBlockSource@@AEBVBlockPos@@EE@Z",
        bool_t,
        null,
        PistonBlockActor,
        BlockSource,
        BlockPos,
        uint8_t,
        uint8_t,
    )((self, blockSource, blockPos, uNum1, uNum2) => {
        const event = new PistonCheckEvent(blockPos, blockSource, self.action, self.getAttachedBlocks(), self.getFacingDir(blockSource));
        const canceled = events.pistonCheck.fire(event) === CANCEL;
        decay(self);
        decay(blockPos);
        decay(blockSource);
        if (canceled) return false;
        else return _onPistonCheck(self, event.blockSource, event.blockPos, uNum1, uNum2);
    });
});

events.pistonMove.setInstaller(() => {
    function onPistonMove(this: PistonBlockActor, blockSource: BlockSource): void_t {
        const event = new PistonMoveEvent(this.getPosition(), blockSource, this.action, this.getAttachedBlocks(), this.getFacingDir(blockSource));
        events.pistonMove.fire(event);
        decay(this);
        decay(blockSource);
        return _onPistonMove.call(this, event.blockSource);
    }
    const _onPistonMove = procHacker.hooking(
        "?_spawnMovingBlocks@PistonBlockActor@@AEAAXAEAVBlockSource@@@Z",
        void_t,
        { this: PistonBlockActor },
        BlockSource,
    )(onPistonMove);
});

events.farmlandDecay.setInstaller(() => {
    function onFarmlandDecay(block: Block, blockSource: BlockSource, blockPos: BlockPos, culprit: Actor, fallDistance: float32_t): void_t {
        const event = new FarmlandDecayEvent(block, blockPos, blockSource, culprit);
        const canceled = events.farmlandDecay.fire(event) === CANCEL;
        decay(block);
        decay(blockSource);
        decay(blockPos);
        if (!canceled) {
            return _onFarmlandDecay(event.block, event.blockSource, event.blockPos, event.culprit, fallDistance);
        }
    }
    const _onFarmlandDecay = procHacker.hooking(
        "?transformOnFall@FarmBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@M@Z",
        void_t,
        null,
        Block,
        BlockSource,
        BlockPos,
        Actor,
        float32_t,
    )(onFarmlandDecay);
});

events.campfireLight.setInstaller(() => {
    function onCampfireTryLightFire(blockSource: BlockSource, blockPos: BlockPos, actor: Actor): bool_t {
        const event = new CampfireTryLightFire(blockPos, blockSource, actor);
        const canceled = events.campfireLight.fire(event) === CANCEL;
        decay(blockSource);
        decay(blockPos);
        if (canceled) return false;
        else return _CampfireTryLightFire(event.blockSource, event.blockPos, event.actor);
    }
    const _CampfireTryLightFire = procHacker.hooking(
        "?tryLightFire@CampfireBlock@@SA_NAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@@Z",
        bool_t,
        null,
        BlockSource,
        BlockPos,
        Actor,
    )(onCampfireTryLightFire);
});

events.campfireDouse.setInstaller(() => {
    function onCampfireTryDouseFire(blockSource: BlockSource, blockPos: BlockPos, actor: Actor): bool_t {
        const event = new CampfireTryDouseFire(blockPos, blockSource, actor);
        const canceled = events.campfireDouse.fire(event) === CANCEL;
        decay(blockSource);
        decay(blockPos);
        if (canceled) return false;
        else return _CampfireTryDouseFire(event.blockSource, event.blockPos, event.actor);
    }

    const _CampfireTryDouseFire = procHacker.hooking(
        "?tryDouseFire@CampfireBlock@@SA_NAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@_N@Z",
        bool_t,
        null,
        BlockSource,
        BlockPos,
        Actor,
    )(onCampfireTryDouseFire);
});

events.buttonPress.setInstaller(() => {
    function onButtonPress(buttonBlock: ButtonBlock, player: Player, blockPos: BlockPos, playerOrientation: number): boolean {
        const event = new ButtonPressEvent(buttonBlock, player, blockPos, playerOrientation);
        const canceled = events.buttonPress.fire(event) === CANCEL;
        decay(blockPos);
        decay(buttonBlock);
        if (canceled) return false;
        return _onButtonPress(buttonBlock, player, blockPos, playerOrientation);
    }

    const _onButtonPress = procHacker.hooking(
        "?use@ButtonBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z",
        bool_t,
        null,
        ButtonBlock,
        Player,
        BlockPos,
        uint8_t,
    )(onButtonPress);
});

events.chestOpen.setInstaller(() => {
    function onChestOpen(chestBlock: ChestBlock, player: Player, blockPos: BlockPos, face: number): boolean {
        const event = new ChestOpenEvent(chestBlock, player, blockPos, face);
        const canceled = events.chestOpen.fire(event) === CANCEL;
        decay(blockPos);
        decay(chestBlock);
        if (canceled) return false;
        return _onChestOpen(chestBlock, player, blockPos, face);
    }
    const _onChestOpen = procHacker.hooking(
        "?use@ChestBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z",
        bool_t,
        null,
        ChestBlock,
        Player,
        BlockPos,
        uint8_t,
    )(onChestOpen);
});

events.chestPair.setInstaller(() => {
    function onChestPair(chest: ChestBlockActor, chest2: ChestBlockActor, lead: bool_t): void {
        const event = new ChestPairEvent(chest, chest2, lead);
        const canceled = events.chestPair.fire(event) === CANCEL;
        decay(chest);
        decay(chest2);
        if (canceled) return;
        return _onChestPair(chest, chest2, lead);
    }
    const _onChestPair = procHacker.hooking("?pairWith@ChestBlockActor@@QEAAXPEAV1@_N@Z", void_t, null, ChestBlockActor, ChestBlockActor, bool_t)(onChestPair);
});

export class BlockInteractedWithEvent {
    constructor(public player: Player, public blockPos: BlockPos) {}
}
events.blockInteractedWith.setInstaller(() => {
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
});

export class ProjectileHitBlockEvent {
    constructor(public block: Block, public region: BlockSource, public blockPos: BlockPos, public projectile: Actor) {}
}
events.projectileHitBlock.setInstaller(() => {
    function onProjectileHit(block: Block, region: BlockSource, blockPos: BlockPos, projectile: Actor): void {
        const event = new ProjectileHitBlockEvent(block, region, blockPos, projectile);
        events.projectileHitBlock.fire(event);
        decay(block);
        decay(region);
        decay(blockPos);
        return _onProjectileHit(block, region, blockPos, projectile);
    }
    const _onProjectileHit = procHacker.hooking(
        "?onProjectileHit@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@AEBVActor@@@Z",
        void_t,
        null,
        Block,
        BlockSource,
        BlockPos,
        Actor,
    )(onProjectileHit);
});

export class LightningHitBlockEvent {
    constructor(public block: Block, public region: BlockSource, public blockPos: BlockPos) {}
}
events.lightningHitBlock.setInstaller(() => {
    function onLightningHit(block: Block, region: BlockSource, blockPos: BlockPos): void {
        const event = new LightningHitBlockEvent(block, region, blockPos);
        events.lightningHitBlock.fire(event);
        decay(block);
        decay(region);
        decay(blockPos);
        return _onLightningHit(block, region, blockPos);
    }
    const _onLightningHit = procHacker.hooking(
        "?onLightningHit@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@@Z",
        void_t,
        null,
        Block,
        BlockSource,
        BlockPos,
    )(onLightningHit);
});

export class FallOnBlockEvent {
    constructor(public block: Block, public region: BlockSource, public blockPos: BlockPos, public entity: Actor, public height: number) {}
}
events.fallOnBlock.setInstaller(() => {
    function onFallOn(block: Block, region: BlockSource, blockPos: BlockPos, entity: Actor, height: number): void {
        const event = new FallOnBlockEvent(block, region, blockPos, entity, height);
        events.fallOnBlock.fire(event);
        decay(block);
        decay(region);
        decay(blockPos);
        return _onFallOn(block, region, blockPos, entity, height);
    }
    const _onFallOn = procHacker.hooking(
        "?onFallOn@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@AEAVActor@@M@Z",
        void_t,
        null,
        Block,
        BlockSource,
        BlockPos,
        Actor,
        float32_t,
    )(onFallOn);
});

export class BlockAttackEvent {
    constructor(public block: Block, public player: Player | null, public blockPos: BlockPos) {}
}
events.attackBlock.setInstaller(() => {
    function onBlockAttacked(block: Block, player: Player | null, blockPos: BlockPos): bool_t {
        const event = new BlockAttackEvent(block, player, blockPos);
        const canceled = events.attackBlock.fire(event) === CANCEL;
        if (canceled) return false;
        return Block$attack(block, player, blockPos);
    }
    const Block$attack = procHacker.hooking("?attack@Block@@QEBA_NPEAVPlayer@@AEBVBlockPos@@@Z", bool_t, null, Block, Player, BlockPos)(onBlockAttacked);
});

export class SculkShriekEvent {
    constructor(public region: BlockSource, public blockPos: BlockPos, public entity: Actor | null) {}
}
events.sculkShriek.setInstaller(() => {
    function onSculkShriek(region: BlockSource, blockPos: BlockPos, entity: Actor | null): void {
        const event = new SculkShriekEvent(region, blockPos, entity);
        const canceled = events.sculkShriek.fire(event) === CANCEL;
        decay(region);
        decay(blockPos);
        if (canceled) return;
        return SculkShriekerBlock$_shriek(region, blockPos, entity);
    }
    const SculkShriekerBlock$_shriek = procHacker.hooking(
        "?_shriek@SculkShriekerBlockActorInternal@@YAXAEAVBlockSource@@VBlockPos@@AEAVPlayer@@@Z",
        void_t,
        null,
        BlockSource,
        BlockPos,
        Actor,
    )(onSculkShriek);
});

export class SculkSensorActivateEvent {
    constructor(public region: BlockSource, public pos: BlockPos, public entity: Actor | null) {}
}
events.sculkSensorActivate.setInstaller(() => {
    function onSculkSensorActivate(region: BlockSource, pos: BlockPos, entity: Actor | null, unknown: int32_t, unknown2: int32_t): void {
        const event = new SculkSensorActivateEvent(region, pos, entity);
        const canceled = events.sculkSensorActivate.fire(event) === CANCEL;
        decay(region);
        decay(pos);
        if (canceled) return;
        return sculkSensor$setActivePhase(region, pos, entity, unknown, unknown2);
    }
    const sculkSensor$setActivePhase = procHacker.hooking(
        "?setActivePhase@SculkSensorBlock@@SAXAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@HH@Z",
        void_t,
        null,
        BlockSource,
        BlockPos,
        Actor,
        int32_t,
        int32_t,
    )(onSculkSensorActivate);
});
