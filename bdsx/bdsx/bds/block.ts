import { abstract } from "../common";
import { VoidPointer } from "../core";
import type { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, CxxStringWith8Bytes, int32_t, uint16_t, uint8_t } from "../nativetype";
import type { Actor, DimensionId, ItemActor } from "./actor";
import type { ChunkPos } from "./blockpos";
import { BlockPos } from "./blockpos";
import type { ChunkSource, LevelChunk } from "./chunk";
import type { CommandName } from "./commandname";
import type { Dimension } from "./dimension";
import { HashedString } from "./hashedstring";
import type { Container, ItemStack } from "./inventory";
import { CompoundTag, NBT } from "./nbt";
import type { BlockActorDataPacket } from "./packets";
import type { Player, ServerPlayer } from "./player";

@nativeClass(null)
export class BlockLegacy extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /**
     * @deprecated Use `this.getRenderBlock().getDescriptionId()` instead
     */
    @nativeField(CxxString)
    descriptionId:CxxString;

    getCommandName():string {
        const names = this.getCommandNames2();
        const name = names.get(0).name;
        names.destruct();
        if (name === null) throw Error(`block has not any names`);
        return name;
    }
    /**
     * @deprecated Use `this.getCommandNames2()` instead
     */
    getCommandNames():CxxVector<CxxStringWith8Bytes> {
        abstract();
    }
    getCommandNames2():CxxVector<CommandName> {
        abstract();
    }
    /**
     * Returns the category of the block in creative inventory
     */
    getCreativeCategory():number {
        abstract();
    }
    /**
     * Changes the time needed to destroy the block
     * @remarks Will not affect actual destroy time but will affect the speed of cracks
     */
    setDestroyTime(time:number):void {
        abstract();
    }
    /**
     * Returns the time needed to destroy the block
     */
    getDestroyTime():number {
        return this.getFloat32(0x12C); // accessed in BlockLegacy::setDestroyTime
    }
    /**
     * Returns the Block instance
     */
    getRenderBlock():Block {
        abstract();
    }
    getBlockEntityType(): BlockActorType {
        abstract();
    }
    getBlockItemId():number {
        abstract();
    }
    getStateFromLegacyData(data:number):Block {
        abstract();
    }
    use(subject: Player, blockPos: BlockPos, face: number): bool_t {
        abstract();
    }
    getDefaultState():Block {
        abstract();
    }
    tryGetStateFromLegacyData(data:uint16_t):Block {
        abstract();
    }
    getSilkTouchedItemInstance(block: Block): ItemStack{
        abstract();
    }
    getDestroySpeed(): number{
        abstract();
    }
}

@nativeClass(null)
export class Block extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(uint16_t)
    data:uint16_t;
    @nativeField(BlockLegacy.ref(), 0x10)
    blockLegacy:BlockLegacy;

    /**
     * @deprecated no need to destruct. use `Block.create`
     */
    static constructWith(blockName:BlockId, data?: number):Block|null;
    /**
     * @deprecated no need to destruct. use `Block.create`
     */
    static constructWith(blockName:string, data?: number):Block|null;
    static constructWith(blockName:BlockId|string, data:number = 0):Block|null {
        return this.create(blockName, data);
    }

    /**
     * @param blockName Formats like 'minecraft:wool'
     * @return Block instance
     */
    static create(blockName:BlockId, data?: number):Block|null;

    /**
     * @return Block instance
     */
    static create(blockName:string, data?: number):Block|null;
    static create(blockName:string, data:number = 0):Block|null {
        abstract();
    }
    protected _getName():HashedString {
        abstract();
    }
    getName():string {
        return this._getName().str;
    }
    getDescriptionId():CxxString {
        abstract();
    }
    getRuntimeId():int32_t {
        abstract();
    }
    getBlockEntityType(): BlockActorType {
        abstract();
    }
    hasBlockEntity():boolean {
        abstract();
    }
    use(subject: Player, blockPos: BlockPos, face: number): bool_t {
        abstract();
    }
    getVariant(): number{
        abstract();
    }
    getSerializationId(): CompoundTag{
        abstract();
    }
    getSilkTouchItemInstance(): ItemStack{
        abstract();
    }
    isUnbreakable(): boolean{
        abstract();
    }
    buildDescriptionId(): string{
        abstract();
    }
    isCropBlock(): boolean{
        abstract();
    }
    popResource(blockSource: BlockSource, blockPos: BlockPos, itemStack: ItemStack): ItemActor{
        abstract();
    }
    canHurtAndBreakItem(): boolean{
        abstract();
    }
    getThickness(): number{
        abstract();
    }
    hasComparatorSignal(): boolean{
        abstract();
    }
    getTranslucency(): number{
        abstract();
    }
    getExplosionResistance(actor: Actor|null = null): number{
        abstract();
    }
    getComparatorSignal(blockSource: BlockSource, blockPos: BlockPos, facing: uint8_t): number{
        abstract();
    }
    getDirectSignal(blockSource: BlockSource, blockPos: BlockPos, facing: int32_t): number{
        abstract();
    }
    isSignalSource(): boolean{
        abstract();
    }
    getDestroySpeed(): number{
        abstract();
    }
}

// Neighbors causes block updates around
// Network causes the block to be sent to clients
// Uses of other flags unknown
enum BlockUpdateFlags {
    NONE      = 0b0000,
    NEIGHBORS = 0b0001,
    NETWORK   = 0b0010,
    NOGRAPHIC = 0b0100,
    PRIORITY  = 0b1000,

    ALL = NEIGHBORS | NETWORK,
    ALL_PRIORITY = ALL | PRIORITY,
}
@nativeClass(null)
export class BlockSource extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(VoidPointer)
    ownerThreadID:VoidPointer;
    @nativeField(bool_t)
    allowUnpopulatedChunks:bool_t;
    @nativeField(bool_t)
    publicSource:bool_t;

    protected _setBlock(x:number, y:number, z:number, block:Block, updateFlags:number, actor:Actor|null):boolean {
        abstract();
    }
    getBlock(blockPos:BlockPos):Block {
        abstract();
    }
    /**
     *
     * @param blockPos Position of the block to place
     * @param block The Block to place
     * @param updateFlags BlockUpdateFlags, to place without ticking neighbor updates use only BlockUpdateFlags.NETWORK
     * @returns true if the block was placed, false if it was not
     */
    setBlock(blockPos:BlockPos, block:Block, updateFlags = BlockUpdateFlags.ALL):boolean {
        return this._setBlock(blockPos.x, blockPos.y, blockPos.z, block, updateFlags, null);
    }
    getChunk(pos:ChunkPos):LevelChunk|null {
        abstract();
    }
    getChunkAt(pos:BlockPos):LevelChunk|null {
        abstract();
    }
    getChunkSource():ChunkSource {
        abstract();
    }
    getBlockEntity(blockPos:BlockPos):BlockActor|null {
        abstract();
    }
    getDimension():Dimension {
        abstract();
    }
    getDimensionId():DimensionId {
        abstract();
    }
    removeBlockEntity(blockPos:BlockPos):void {
        abstract();
    }
    getBrightness(blockPos: BlockPos): number{
        abstract();
    }
}

@nativeClass(null)
export class BlockActor extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;

    isChestBlockActor(): this is ChestBlockActor {
        abstract();
    }
    /**
     * @param tag this function stores nbt values to this parameter
     */
    save(tag:CompoundTag):boolean;
    /**
     * it returns JS converted NBT
     */
    save():Record<string, any>;
    save(tag?:CompoundTag):any{
        abstract();
    }
    load(tag:CompoundTag|NBT.Compound):void{
        abstract();
    }
    /**
     * @deprecated use allocateAndSave
     */
    constructAndSave():CompoundTag{
        const tag = CompoundTag.construct();
        this.save(tag);
        return tag;
    }
    allocateAndSave():CompoundTag{
        const tag = CompoundTag.allocate();
        this.save(tag);
        return tag;
    }
    setChanged(): void{
        abstract();
    }
    /**
     * Sets a custom name to the block. (e.g : chest, furnace...)
     *
     * @param name - Name to set
     *
     * @remarks This will not update the block client-side. use `BlockActor.updateClientSide()` to do so.
     */
    setCustomName(name: string):void{
        abstract();
    }
    getContainer(): Container | null{
        abstract();
    }
    getType(): BlockActorType {
        abstract();
    }
    getPosition(): BlockPos {
        abstract();
    }

    /**
     * make a packet for updating the client-side.
     * it has a risk about memoryleaks but following the original function name.
     *
     * @return allocated BlockActorDataPacket. it needs to be disposed of.
     */
    getServerUpdatePacket(blockSource:BlockSource):BlockActorDataPacket {
        abstract();
    }

    /**
     * Updates the block actor client-side.
     *
     * @param player - The player to update the block for.
     */
    updateClientSide(player: ServerPlayer): void {
        abstract();
    }
    getCustomName(): string{
        abstract();
    }
}

export enum BlockActorType {
    None = 0x00,
    Furnace = 0x01,
    Chest = 0x02,
    NetherReactor = 0x03,
    Sign = 0x04,
    MobSpawner = 0x05,
    Skull = 0x06,
    FlowerPot = 0x07,
    BrewingStand = 0x08,
    EnchantingTable = 0x09,
    DaylightDetector = 0x0a,
    Music = 0x0b,
    Comparator = 0x0c,
    Dispenser = 0x0d,
    Dropper = 0x0e,
    Hopper = 0x0f,
    Cauldron = 0x10,
    ItemFrame = 0x11,
    Piston = 0x12,
    MovingBlock = 0x13,
    Beacon = 0x15,
    EndPortal = 0x16,
    EnderChest = 0x17,
    EndGateway = 0x18,
    ShulkerBox = 0x19,
    CommandBlock = 0x1a,
    Bed = 0x1b,
    Banner = 0x1c,
    StructureBlock = 0x20,
    Jukebox = 0x21,
    ChemistryTable = 0x22,
    Conduit = 0x23,
    Jigsaw = 0x24,
    Lectern = 0x25,
    BlastFurnace = 0x26,
    Smoker = 0x27,
    Bell = 0x28,
    Campfire = 0x29,
    Barrel = 0x2a,
    Beehive = 0x2b,
    Lodestone = 0x2c,
    SculkSensor = 0x2d,
    SporeBlossom = 0x2e,
    SculkCatalyst = 0x30,
}

@nativeClass(null)
export class ButtonBlock extends BlockLegacy {
    // unknown
}

@nativeClass(null)
export class ChestBlock extends BlockLegacy {

}

@nativeClass(null)
export class ChestBlockActor extends BlockActor {
    /**
     * Returns whether the chest is a double chest
     */
    isLargeChest(): boolean {
        abstract();
    }
    /**
     * Makes a player open the chest
     *
     * @param player - Player that will open the chest
     *
     * @remarks The chest must be in range of the player !
     */
    openBy(player: Player): void {
        abstract();
    }
    /**
     * Returns the position of the other chest forming the double chest.
     *
     * @remarks If the chest is not a double chest, BlockPos ZERO (0,0,0) is returned.
     */
    getPairedChestPosition(): BlockPos {
        abstract();
    }
}

@nativeClass(null)
export class BlockUtils extends NativeClass{
    static isDownwardFlowingLiquid(block: Block): boolean{
        abstract();
    }

    static isBeehiveBlock(block: BlockLegacy): boolean{
        abstract();
    }

    static isWaterSource(block: Block): boolean{
        abstract();
    }

    static isFullFlowingLiquid(block: Block): boolean{
        abstract();
    }

    static allowsNetherVegetation(block: BlockLegacy): boolean{
        abstract();
    }

    static isThinFenceOrWallBlock(block: Block): boolean{
        abstract();
    }

    static isLiquidSource(block: Block): boolean{
        abstract();
    }

    static getLiquidBlockHeight(block: Block, blockPos: BlockPos): number{
        abstract();
    }

    static canGrowTreeWithBeehive(block: Block): boolean{
        abstract();
    }
}
