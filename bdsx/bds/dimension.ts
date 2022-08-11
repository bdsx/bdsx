import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { int32_t, void_t } from "../nativetype";
import { procHacker } from "../prochacker";
import type { Actor, ActorUniqueID, DimensionId } from "./actor";
import { BlockSource } from "./block";
import { BlockPos, ChunkPos, Vec3 } from "./blockpos";
import { ChunkSource, LevelChunk } from "./chunk";
import type { Player } from './player';

@nativeClass(null)
export class Dimension extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /** @deprecated Use `this.getBlockSource()` instead */
    get blockSource():BlockSource {
        return this.getBlockSource();
    }

    getBlockSource():BlockSource {
        abstract();
    }
    getChunkSource():ChunkSource {
        abstract();
    }
    getDimensionId():DimensionId {
        abstract();
    }
    _sendBlockEntityUpdatePacket(pos:BlockPos):void {
        abstract();
    }
    fetchNearestAttackablePlayer(actor: Actor, distance: number): Player;
    fetchNearestAttackablePlayer(actor: Actor, distance: number, blockPos: BlockPos): Player;
    fetchNearestAttackablePlayer(actor: Actor, distance: number, blockPos?: BlockPos): Player{
        abstract();
    }
    getSunAngle(): number{
        abstract();
    }
    getTimeOfDay(): number{
        abstract();
    }
    isDay(): boolean{
        abstract();
    }
    distanceToNearestPlayerSqr2D(pos: Vec3): number{
        abstract();
    }
    transferEntityToUnloadedChunk(actor: Actor, levelChunk?:LevelChunk): void{
        abstract();
    }
    getSpawnPos(): BlockPos{
        abstract();
    }
    fetchNearestPlayerToActor(actor: Actor, distance: number): Player|null{
        abstract();
    }
    fetchNearestPlayerToPosition(x: number, y: number, z: number, distance: number, findAnyNearPlayer: boolean): Player|null{
        abstract();
    }
    getMoonBrightness(): number{
        abstract();
    }
    getHeight(): number{
        abstract();
    }
    getMinHeight(): number{
        abstract();
    }
    tryGetClosestPublicRegion(chunkPos: ChunkPos): BlockSource{
        abstract();
    }
    unregisterEntity(actorUniqueId: ActorUniqueID): void{
        abstract();
    }
    removeActorByID(actorUniqueId: ActorUniqueID): void{
        abstract();
    }
    getDefaultBiome(): number{
        abstract();
    }
    getMoonPhase(): number{
        abstract();
    }
}

Dimension.prototype.getBlockSource = procHacker.js('?getBlockSourceFromMainChunkSource@Dimension@@QEBAAEAVBlockSource@@XZ', BlockSource, {this:Dimension});
Dimension.prototype.getChunkSource = procHacker.js('?getChunkSource@Dimension@@QEBAAEAVChunkSource@@XZ', ChunkSource, {this:Dimension});
Dimension.prototype.getDimensionId = procHacker.js('?getDimensionId@Dimension@@QEBA?AV?$AutomaticID@VDimension@@H@@XZ', int32_t, {this:Dimension, structureReturn:true});

/**
 * in fact, the first parameter of this function is NetworkBlockPosition.
 * but it seems it's an alias of BlockPos and it's used for only this function.
 */
Dimension.prototype._sendBlockEntityUpdatePacket = procHacker.js('?_sendBlockEntityUpdatePacket@Dimension@@AEAAXAEBVNetworkBlockPosition@@@Z', void_t, {this:Dimension}, BlockPos);
