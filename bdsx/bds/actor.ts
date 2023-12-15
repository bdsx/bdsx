import * as colors from "colors";
import { bin } from "../bin";
import type { CommandResult, CommandResultType } from "../commandresult";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { events } from "../event";
import { mangle } from "../mangle";
import { AbstractClass, NativeClass, NativeStruct, nativeClass, nativeClassUtil, nativeField } from "../nativeclass";
import { CxxString, bin64_t, bool_t, float32_t, int32_t, int64_as_float_t, uint8_t } from "../nativetype";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Block, BlockSource } from "./block";
import { BlockPos, Vec2, Vec3 } from "./blockpos";
import type { CommandPermissionLevel } from "./command";
import type {
    CommandBlockComponent,
    ConditionalBandwidthOptimizationComponent,
    ContainerComponent,
    DamageSensorComponent,
    NameableComponent,
    NavigationComponent,
    NpcComponent,
    PhysicsComponent,
    ProjectileComponent,
    PushableComponent,
    RideableComponent,
    ShooterComponent,
} from "./components";
import { CxxOptional } from "./cxxoptional";
import type { Dimension } from "./dimension";
import { MobEffect, MobEffectIds, MobEffectInstance } from "./effects";
import { HashedString } from "./hashedstring";
import type { ArmorSlot, ItemStack, SimpleContainer } from "./inventory";
import type { Level } from "./level";
import { CompoundTag, NBT } from "./nbt";
import type { NetworkIdentifier } from "./networkidentifier";
import { Packet } from "./packet";
import type { Player, ServerPlayer, SimulatedPlayer } from "./player";
import { proc } from "./symbols";

export const ActorUniqueID = bin64_t.extends({
    INVALID_ID: proc["?INVALID_ID@ActorUniqueID@@2U1@B"].getBin64(),
});
export type ActorUniqueID = bin64_t;

export enum DimensionId { // int32_t
    Overworld = 0,
    Nether = 1,
    TheEnd = 2,
    Undefined = 3,
}

export class ActorRuntimeID extends VoidPointer {}

export enum ActorType {
    Item = 0x40,
    PrimedTnt,
    FallingBlock,
    MovingBlock,
    Experience = 0x45,
    EyeOfEnder,
    EnderCrystal,
    FireworksRocket,
    FishingHook = 0x4d,
    Chalkboard,
    Painting = 0x53,
    LeashKnot = 0x58,
    BoatRideable = 0x5a,
    LightningBolt = 0x5d,
    AreaEffectCloud,
    Balloon = 0x6b,
    Shield = 0x75,
    Lectern = 0x77,
    TypeMask = 0xff,

    Mob,
    Npc = 0x133,
    Agent = 0x138,
    ArmorStand = 0x13d,
    TripodCamera,
    Player,
    Bee = 0x17a,
    Piglin,
    PiglinBrute = 0x17f,
    Allay = 0x186,

    PathfinderMob = 0x300,
    IronGolem = 0x314,
    SnowGolem,
    WanderingTrader = 0x376,

    Monster = 0xb00,
    Creeper = 0xb21,
    Slime = 0xb25,
    EnderMan,
    Ghast = 0xb29,
    LavaSlime = 0xb2a,
    Blaze,
    Witch = 0xb2d,
    Guardian = 0xb31,
    ElderGuardian,
    Dragon = 0xb35,
    Shulker,
    Vindicator = 0xb39,
    IllagerBeast = 0xb3b,
    EvocationIllager = 0xb68,
    Vex,
    Pillager = 0xb72,
    ElderGuardianGhost = 0xb78,
    Warden = 0xb83,

    Animal = 0x1300,
    Chicken = 0x130a,
    Cow,
    Pig,
    Sheep,
    MushroomCow = 0x1310,
    Rabbit = 0x1312,
    PolarBear = 0x131c,
    Llama,
    Turtle = 0x134a,
    Panda = 0x1371,
    Fox = 0x1379,
    Hoglin = 0x137c,
    Strider,
    Goat = 0x1380,
    Axolotl = 0x1382,
    Frog = 0x1384,
    Sniffer = 0x138b,

    WaterAnimal = 0x2300,
    Squid = 0x2311,
    Dolphin = 0x231f,
    Pufferfish = 0x236c,
    Salmon,
    Tropicalfish = 0x236f,
    Fish,
    GlowSquid = 0x2381,
    Tadpole = 0x2385,

    TameableAnimal = 0x5300,
    Wolf = 0x530e,
    Ocelot = 0x5316,
    Parrot = 0x531e,
    Cat = 0x534b,

    Ambient = 0x8100,
    Bat = 0x8113,

    UndeadMob = 0x10b00,
    PigZombie = 0x10b24,
    WitherBoss = 0x10b34,
    Phantom = 0x10b3a,
    Zoglin = 0x10b7e,

    ZombieMonster = 0x30b00,
    Zombie = 0x30b20,
    ZombieVillager = 0x30b2c,
    Husk = 0x30b2f,
    Drowned = 0x30b6e,
    ZombieVillagerV2 = 0x30b74,

    Arthropod = 0x40b00,
    Spider = 0x40b23,
    Silverfish = 0x40b27,
    CaveSpider,
    Endermite = 0x40b37,

    Minecart = 0x80000,
    MinecartRideable = 0x80054,
    MinecartHopper = 0x80060,
    MinecartTNT,
    MinecartChest,
    MinecartFurnace,
    MinecartCommandBlock,

    SkeletonMonster = 0x110b00,
    Skeleton = 0x110b22,
    Stray = 0x110b2e,
    WitherSkeleton = 0x110b30,

    EquineAnimal = 0x205300,
    Horse = 0x205317,
    Donkey,
    Mule,
    SkeletonHorse = 0x215b1a,
    ZombieHorse,

    Projectile = 0x400000,
    ExperiencePotion = 0x400044,
    ShulkerBullet = 0x40004c,
    DragonFireball = 0x40004f,
    Snowball = 0x400051,
    ThrownEgg,
    LargeFireball = 0x400055,
    ThrownPotion,
    Enderpearl,
    WitherSkull = 0x400059,
    WitherSkullDangerous = 0x40005b,
    SmallFireball = 0x40005e,
    LingeringPotion = 0x400065,
    LlamaSpit,
    EvocationFang,
    IceBomb = 0x40006a,

    AbstractArrow = 0x800000,
    Trident = 0x0c00049,
    Arrow = 0xc00050,
    VillagerBase = 0x1000300,
    Villager = 0x100030f,
    VillagerV2 = 0x1000373,
}

@nativeClass({ size: 0xb0, structSymbol: true })
export class ActorDefinitionIdentifier extends NativeClass {
    @nativeField(CxxString)
    namespace: CxxString;
    @nativeField(CxxString)
    identifier: CxxString;
    @nativeField(CxxString)
    initEvent: CxxString;
    @nativeField(CxxString)
    fullName: CxxString;
    @nativeField(HashedString)
    readonly canonicalName: HashedString;

    static constructWith(fullName: EntityId): ActorDefinitionIdentifier;
    static constructWith(fullName: string): ActorDefinitionIdentifier;
    static constructWith(type: ActorType): ActorDefinitionIdentifier;
    static constructWith(type: string | ActorType): ActorDefinitionIdentifier {
        abstract();
    }
    /** @deprecated use {@link constructWith()} instead*/
    static create(type: string | ActorType): ActorDefinitionIdentifier {
        return ActorDefinitionIdentifier.constructWith(type as any);
    }
}

@nativeClass(0x10)
export class ActorDamageSource extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(int32_t, 0x08)
    cause: int32_t;

    /** @deprecated Use {@link create} instead. */
    static constructWith(cause: ActorDamageCause): ActorDamageSource {
        return this.create(cause);
    }
    static create(cause: ActorDamageCause): ActorDamageSource {
        abstract();
    }

    /**
     *
     * @param cause damage cause
     */
    setCause(cause: ActorDamageCause): void {
        abstract();
    }

    getDamagingEntity(): Actor | null {
        const uniqueId = this.getDamagingEntityUniqueID();
        return Actor.fromUniqueIdBin(uniqueId);
    }

    getDamagingEntityUniqueID(): ActorUniqueID {
        abstract();
    }

    isEntitySource(): this is ActorDamageByActorSource {
        return this instanceof ActorDamageByActorSource;
    }

    isChildEntitySource(): this is ActorDamageByChildActorSource {
        return this instanceof ActorDamageByChildActorSource;
    }

    isBlockSource(): this is ActorDamageByBlockSource {
        return this instanceof ActorDamageByBlockSource;
    }
}

@nativeClass(0x30)
export class ActorDamageByBlockSource extends ActorDamageSource {
    /**
     * At least Magma, Stalactite, and Stalagmite are verified that used in BDS
     */
    static create(block: Block, cause: ActorDamageCause): ActorDamageByBlockSource;
    static create(this: never, cause: ActorDamageCause): ActorDamageSource;
    static create(block: Block | ActorDamageCause, cause?: ActorDamageCause): ActorDamageByBlockSource {
        abstract();
    }

    @nativeField(Block.ref())
    block: Block;
}

@nativeClass(0x50)
export class ActorDamageByActorSource extends ActorDamageSource {
    static constructWith(damagingEntity: Actor, cause?: ActorDamageCause): ActorDamageByActorSource;
    static constructWith(this: never, cause: ActorDamageCause): ActorDamageSource;
    static constructWith(damagingEntity: Actor | ActorDamageCause, cause: ActorDamageCause = ActorDamageCause.EntityAttack): ActorDamageByActorSource {
        abstract();
    }
}

@nativeClass(0x80)
export class ActorDamageByChildActorSource extends ActorDamageByActorSource {
    static constructWith(childEntity: Actor, damagingEntity: Actor, cause?: ActorDamageCause): ActorDamageByChildActorSource;
    static constructWith(this: never, cause: ActorDamageCause): ActorDamageSource;
    static constructWith(this: never, damagingEntity: Actor, cause?: ActorDamageCause): ActorDamageByActorSource;
    static constructWith(
        childEntity: Actor | ActorDamageCause,
        damagingEntity?: Actor | ActorDamageCause,
        cause: ActorDamageCause = ActorDamageCause.Projectile,
    ): ActorDamageByChildActorSource {
        abstract();
    }

    getChildEntityUniqueId(): ActorUniqueID {
        // not official name, there is not a method for child entity in BDS
        return this.getBin64(0x58); // accessed in ActorDamageByChildActorSource::ActorDamageByChildActorSource
    }
}

export enum ActorDamageCause {
    /** The kill command */
    Override,
    /** @deprecated */
    None = 0,
    Contact,
    EntityAttack,
    Projectile,
    Suffocation,
    /** @deprecated Typo */
    Suffoocation = 4,
    Fall,
    Fire,
    FireTick,
    Lava,
    Drowning,
    BlockExplosion,
    EntityExplosion,
    Void,
    Suicide,
    Magic,
    Wither,
    Starve,
    Anvil,
    Thorns,
    FallingBlock,
    Piston,
    FlyIntoWall,
    Magma,
    Fireworks,
    Lightning,
    Charging,
    Temperature,
    Freeze,
    Stalactite,
    Stalagmite,
    RamAttack,
    SonicBoom,
    All = 0x22,
}

export enum ActorFlags {
    OnFire,
    Sneaking,
    Riding,
    Sprinting,
    UsingItem,
    Invisible,
    Tempted,
    InLove,
    Saddled,
    Powered,
    /**
     * @deprecated typo.
     */
    Ignit0ed,
    Ignited = 0xa,
    Baby,
    Converting,
    Critical,
    CanShowName,
    AlwaysShowName,
    NoAI,
    Silent,
    WallClimbing,
    CanClimb,
    CanSwim,
    CanFly,
    CanWalk,
    Resting,
    Sitting,
    Angry,
    Interested,
    Charged,
    Tamed,
    Orphaned,
    Leashed,
    Sheared,
    Gliding,
    Elder,
    Moving,
    Breathing,
    Chested,
    Stackable,
    ShowBottom,
    Standing,
    Shaking,
    Idling,
    Casting,
    Charging,
    WasdControlled,
    CanPowerJump,
    Lingering,
    HasCollision,
    HasGravity,
    FireImmune,
    Dancing,
    Enchanted,
    ReturnTrident,
    ContainerIsPrivate,
    IsTransforming,
    DamageNearbyMobs,
    Swimming,
    Bribed,
    IsPregnant,
    LayingEgg,
    RiderCanPick,
    TransitionSitting,
    Eating,
    LayingDown,
    /**
     * @deprecated Typo!
     */
    Snezing,
    Sneezing = 0x40,
    Trusting,
    Rolling,
    Scared,
    InScaffolding,
    OverScaffolding,
    FallThroughScaffolding,
    Blocking,
    TransitionBlocking,
    BlockedUsingShield,
    BlockedUsingDamagedShield,
    Sleeping,
    WantsToWake,
    TradeInterest,
    DoorBreaker,
    BreakingObstruction,
    DoorOpener,
    IsIllagerCaptain,
    Stunned,
    Roaring,
    DelayedAttack,
    IsAvoidingMobs,
    FacingTargetToRangeAttack,
    HiddenWhenInvisible,
    IsInUI,
    Stalking,
    Emoting,
    Celebrating,
    Admiring,
    CelebratingSpecial,
    OutOfControl,
    RamAttack,
    PlayingDead,
    InAscendableBlock,
    OverDescendableBlock,
}

export enum ActorLinkType {
    None,
    Riding,
    Passenger,
}

@nativeClass()
export class ActorLink extends NativeStruct {
    @nativeField(uint8_t)
    type: ActorLinkType;
    @nativeField(ActorUniqueID, 0x08)
    A: ActorUniqueID;
    @nativeField(ActorUniqueID)
    B: ActorUniqueID;
    @nativeField(bool_t)
    immediate: bool_t;
    @nativeField(bool_t)
    causedByRider: bool_t;
}

@nativeClass(null)
export class OwnerStorageEntity extends AbstractClass {
    _getStackRef(): EntityContext {
        abstract();
    }
}

@nativeClass(0x20)
export class EntityRefTraits extends AbstractClass {
    @nativeField(OwnerStorageEntity)
    context: OwnerStorageEntity;
}

@nativeClass(0x18)
export class WeakEntityRef extends AbstractClass {
    tryUnwrap<T extends typeof Actor>(clazz: T, getRemoved: boolean = false): InstanceType<T> | null {
        abstract();
    }
    tryUnwrapPlayer(getRemoved: boolean = false): Player | null {
        abstract();
    }
    tryUnwrapActor(getRemoved: boolean = false): Actor | null {
        abstract();
    }
}

// class EntityId, naming to avoid symbol overlap
// @nativeClass(0x8)
// class WrappedEntityId extends NativeClass {}

@nativeClass(null)
export class EntityContext extends AbstractClass {
    @nativeField(VoidPointer.ref())
    enttRegistry: VoidPointer; // accessed on ServerNetworkHandler::_displayGameMessage
    @nativeField(int32_t, 0x10)
    entityId: int32_t;

    isValid(): boolean {
        abstract();
    }
    /** @deprecated use {@link isValid()} instead */
    isVaild(): boolean {
        return this.isValid();
    }
    _enttRegistry(): VoidPointer {
        abstract();
    }
    /**
     * Returns copied EntityId
     */
    _getEntityId(): VoidPointer /** WrappedEntityId */ {
        abstract();
    }
}

/** @deprecated merged into EntityContext */
export const EntityContextBase = EntityContext;
/** @deprecated merged into EntityContext */
export type EntityContextBase = EntityContext;

export class Actor extends AbstractClass {
    vftable: VoidPointer;
    ctxbase: EntityContext;
    /** @deprecated use {@link getIdentifier()} instead */
    get identifier(): EntityId {
        return this.getIdentifier();
    }

    /**
     * Summon a new entity
     * @example Actor.summonAt(player.getRegion(), player.getPosition(), ActorType.Pig)
     * @example Actor.summonAt(player.getRegion(), player.getPosition(), ActorType.Pig, player)
     * @example Actor.summonAt(player.getRegion(), player.getPosition(), ActorType.Pig, -1, player)
     * */
    static summonAt(region: BlockSource, pos: Vec3, type: ActorDefinitionIdentifier | ActorType, summoner?: Actor): Actor;
    static summonAt(region: BlockSource, pos: Vec3, type: ActorDefinitionIdentifier | ActorType, id?: ActorUniqueID, summoner?: Actor): Actor;
    static summonAt(region: BlockSource, pos: Vec3, type: ActorDefinitionIdentifier | ActorType, id?: int64_as_float_t, summoner?: Actor): Actor;
    static summonAt(
        region: BlockSource,
        pos: Vec3,
        type: ActorDefinitionIdentifier | ActorType,
        id?: ActorUniqueID | int64_as_float_t | Actor,
        summoner?: Actor,
    ): Actor {
        abstract();
    }

    /**
     * Get the Actor instance of an entity with its EntityContext
     */
    static tryGetFromEntity(entity: EntityContext, getRemoved?: boolean): Actor | null {
        abstract();
    }

    /**
     * Teleports the actor to another dimension
     * @deprecated respawn parameter deleted
     *
     * @param dimensionId - The dimension ID
     * @param respawn - Indicates whether the dimension change is based on a respawn (player died in dimension)
     *
     * @see DimensionId
     */
    changeDimension(dimensionId: DimensionId, respawn: boolean): void;

    /**
     * Teleports the actor to another dimension
     *
     * @param dimensionId - The dimension ID
     *
     * @see DimensionId
     */
    changeDimension(dimensionId: DimensionId): void;

    changeDimension(dimensionId: DimensionId, respawn?: boolean): void {
        abstract();
    }

    /**
     * Teleports the player to a specified position
     * @deprecated sourceActorId deleted
     *
     * @remarks This function is used when entities teleport players (e.g: ender pearls). Use Actor.teleport() if you want to teleport the player.
     *
     * @param position - Position to teleport the player to
     * @param shouldStopRiding - Defines whether the player should stop riding an entity when teleported
     * @param cause - Cause of teleportation
     * @param sourceEntityType - Entity type that caused the teleportation
     * @param sourceActorId - ActorUniqueID of the source entity
     *
     * @privateRemarks causes of teleportation are currently unknown.
     */
    teleportTo(position: Vec3, shouldStopRiding: boolean, cause: number, sourceEntityType: number, sourceActorId: ActorUniqueID): void;
    /**
     * Teleports the player to a specified position
     * @remarks This function is used when entities teleport players (e.g: ender pearls). Use Actor.teleport() if you want to teleport the player.
     *
     * @param position - Position to teleport the player to
     * @param shouldStopRiding - Defines whether the player should stop riding an entity when teleported
     * @param cause - Cause of teleportation
     * @param sourceEntityType - Entity type that caused the teleportation
     * @param unknown
     *
     * @privateRemarks causes of teleportation are currently unknown.
     */
    teleportTo(position: Vec3, shouldStopRiding: boolean, cause: number, sourceEntityType: number, unknown?: boolean): void;
    teleportTo(position: Vec3, shouldStopRiding: boolean, cause: number, sourceEntityType: number, sourceActorId?: ActorUniqueID | boolean): void {
        abstract();
    }

    /**
     * Adds an item to the entity's inventory
     * @remarks Entity(Mob) inventory will not be updated. Use Mob.sendInventory() to update it.
     *
     * @param itemStack - Item to add
     * @returns {boolean} Whether the item has been added successfully (Full inventory can be a cause of failure)
     */
    addItem(itemStack: ItemStack): boolean {
        abstract();
    }
    sendPacket(packet: Packet): void {
        if (!this.isPlayer()) throw Error("this is not ServerPlayer");
        this.sendNetworkPacket(packet);
    }
    /**
     * Actually it's Mob::getArmorValue in BDS.
     * @returns the entity's armor value (as an integer)
     */
    getArmorValue(): number {
        return 0;
    }
    /**
     * Returns the Dimension instance of the entity currently in
     */
    getDimension(): Dimension {
        abstract();
    }
    /**
     * Returns the dimension id of the entity currently in
     */
    getDimensionId(): DimensionId {
        abstract();
    }
    /**
     * Returns the entity's identifier
     */
    getIdentifier(): EntityId {
        return this.getActorIdentifier().canonicalName.str as EntityId;
    }
    /**
     * Returns the ActorDefinitionIdentifier instance of the entity
     */
    getActorIdentifier(): ActorDefinitionIdentifier {
        abstract();
    }

    /**
     * Returns the item currently in the entity's mainhand slot
     */
    getCarriedItem(): ItemStack {
        abstract();
    }
    /**
     * @alias of getCarriedItem
     */
    getMainhandSlot(): ItemStack {
        return this.getCarriedItem();
    }

    /**
     * Sets the item currently in the entity's mainhand slot
     */
    setCarriedItem(item: ItemStack): void {
        abstract();
    }
    /**
     * @alias of setCarriedItem
     */
    setMainhandSlot(item: ItemStack): void {
        this.setCarriedItem(item);
    }

    /**
     * Returns the item currently in the entity's offhand slot
     */
    getOffhandSlot(): ItemStack {
        abstract();
    }
    /**
     * Sets the item currently in the entity's offhand slot
     */
    setOffhandSlot(item: ItemStack): void {
        abstract();
    }

    /**
     * @alias instanceof Mob
     */
    isMob(): this is Mob {
        return this instanceof Mob;
    }
    /**
     * @alias instanceof ServerPlayer
     */
    isPlayer(): this is ServerPlayer;
    /**
     * @deprecated use Player.prototype.isSimulated instead. A SimulatedPlayer is a ServerPlayer anyway.
     */
    isPlayer(includeSimulatedPlayer: boolean): this is SimulatedPlayer;
    isPlayer(includeSimulatedPlayer: boolean = false): this is ServerPlayer {
        abstract();
    }
    /**
     * @alias instanceof SimulatedPlayer
     */
    isSimulatedPlayer(): this is SimulatedPlayer {
        abstract();
    }
    /**
     * @alias instanceof ItemActor
     */
    isItem(): this is ItemActor {
        return this instanceof ItemActor;
    }
    isSneaking(): boolean {
        abstract();
    }
    hasType(type: ActorType): boolean {
        abstract();
    }
    isType(type: ActorType): boolean {
        abstract();
    }
    /**
     * Kills the entity (itself)
     */
    kill(): void {
        abstract();
    }
    /**
     * Makes the entity dead
     * @param damageSource ex) ActorDamageSource.create(ActorDamageCause.Lava)
     */
    die(damageSource: ActorDamageSource): void {
        abstract();
    }
    /**
     * Returns the entity's attribute map
     */
    getAttributes(): BaseAttributeMap {
        abstract();
    }
    /**
     * Returns the entity's name
     * @deprecated use getNameTag() instead
     */
    getName(): string {
        return this.getNameTag();
    }
    /**
     * Returns the entity's name
     */
    getNameTag(): string {
        abstract();
    }

    setHurtTime(time: number): void {
        abstract();
    }
    /**
     * Changes the entity's name
     *
     * Calls Player::setName if it's Player.
     * or it calls Actor::setNameTag.
     */
    setName(name: string): void {
        this.setNameTag(name);
    }
    /**
     * Changes the entity's nametag
     */
    setNameTag(name: string): void {
        abstract();
    }
    /**
     * Set if the entity's nametag is visible
     */
    setNameTagVisible(visible: boolean): void {
        abstract();
    }
    /**
     * Set a text under the entity's name (original is name of objective for scoreboard)
     */
    setScoreTag(text: string): void {
        abstract();
    }
    /**
     * Returns a text under the entity's name (original is name of objective for scoreboard)
     */
    getScoreTag(): string {
        abstract();
    }
    /**
     * Despawn the entity. Don't use for this Player.
     */
    despawn(): void {
        abstract();
    }
    getNetworkIdentifier(): NetworkIdentifier {
        throw Error(`this is not player`);
    }
    /**
     * Returns the entity's position
     */
    getPosition(): Vec3 {
        abstract();
    }
    /**
     * Returns the entity's feet position
     */
    getFeetPos(): Vec3 {
        abstract();
    }
    /**
     * Returns the entity's rotation
     */
    getRotation(): Vec2 {
        abstract();
    }
    /**
     * Returns the BlockSource instance which the entity is ticking
     * @alias getDimensionBlockSource
     */
    getRegion(): BlockSource {
        abstract();
    }
    /**
     * Returns the BlockSource instance which the entity is ticking
     */
    getDimensionBlockSource(): BlockSource {
        abstract();
    }
    getUniqueIdLow(): number {
        return this.getUniqueIdPointer().getInt32(0);
    }
    getUniqueIdHigh(): number {
        return this.getUniqueIdPointer().getInt32(4);
    }
    getUniqueIdBin(): bin64_t {
        return this.getUniqueIdPointer().getBin64();
    }
    /**
     * Returns address of the entity's unique id
     */
    getUniqueIdPointer(): StaticPointer {
        abstract();
    }
    /**
     * Returns the entity's type
     */
    getEntityTypeId(): ActorType {
        abstract();
    }
    /**
     * Returns the entity's command permission level
     */
    getCommandPermissionLevel(): CommandPermissionLevel {
        abstract();
    }
    /**
     * Returns the entity's specific attribute
     */
    getAttribute(id: AttributeId): number {
        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null) return 0;
        return attr.currentValue;
    }
    /**
     * Changes the entity's specific attribute
     */
    setAttribute(id: AttributeId, value: number): AttributeInstance | null {
        if (id < 1) return null;
        if (id > 15) return null;

        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null) throw Error(`${this.getIdentifier()} has not ${AttributeId[id] || `Attribute${id}`}`);
        attr.currentValue = value;
        return attr;
    }
    /**
     * Returns the entity's runtime id
     */
    getRuntimeID(): ActorRuntimeID {
        abstract();
    }
    /**
     * Gets the entity component of bedrock scripting api
     *
     * @deprecated bedrock scripting API is removed.
     */
    getEntity(): any {
        let entity: any = (this as any).entity;
        if (entity) return entity;
        entity = {
            __unique_id__: {
                "64bit_low": this.getUniqueIdLow(),
                "64bit_high": this.getUniqueIdHigh(),
            },
            __identifier__: this.identifier,
            __type__: (this.getEntityTypeId() & 0xff) === 0x40 ? "item_entity" : "entity",
            id: 0, // bool ScriptApi::WORKAROUNDS::helpRegisterActor(entt::Registry<unsigned int>* registry? ,Actor* actor,unsigned int* id_out);
        };
        return ((this as any).entity = entity);
    }
    /**
     * Adds an effect to the entity. If a weaker effect of the same type is already applied, it will be replaced. If a weaker or equal-strength effect is already applied but has a shorter duration, it will be replaced.
     */
    addEffect(effect: MobEffectInstance): void {
        abstract();
    }
    /**
     * Removes the effect with the specified ID from the entity
     */
    removeEffect(id: MobEffectIds): void {
        abstract();
    }

    protected _hasEffect(mobEffect: MobEffect): boolean {
        abstract();
    }
    /**
     * Returns whether the specified effect is active on the entity
     */
    hasEffect(id: MobEffectIds): boolean {
        const effect = MobEffect.create(id);
        return this._hasEffect(effect);
    }

    protected _getEffect(mobEffect: MobEffect): MobEffectInstance | null {
        abstract();
    }
    /**
     * Returns the effect instance active on this entity with the specified ID, or null if the entity does not have the effect.
     */
    getEffect(id: MobEffectIds): MobEffectInstance | null {
        const effect = MobEffect.create(id);
        return this._getEffect(effect);
    }
    removeAllEffects(): void {
        abstract();
    }
    /**
     * Adds a tag to the entity.
     * Related functions: {@link getTags}, {@link removeTag}, {@link hasTag}
     * @returns {boolean} Whether the tag has been added successfully
     */
    addTag(tag: string): boolean {
        abstract();
    }
    /**
     * Returns whether the entity has the tag.
     * Related functions: {@link getTags}, {@link addTag}, {@link removeTag}
     */
    hasTag(tag: string): boolean {
        abstract();
    }
    /**
     * Removes a tag from the entity.
     * Related functions: {@link getTags}, {@link addTag}, {@link hasTag}
     * @returns {boolean} Whether the tag has been removed successfully
     */
    removeTag(tag: string): boolean {
        abstract();
    }
    /**
     * Returns tags the entity has.
     * Related functions: {@link addTag}, {@link removeTag}, {@link hasTag}
     */
    getTags(): string[] {
        abstract();
    }
    /**
     * Teleports the entity to a specified position
     */
    teleport(pos: Vec3, dimensionId: DimensionId = DimensionId.Overworld, facePosition: Vec3 | null = null): void {
        abstract();
    }
    /**
     * Returns the entity's armor
     */
    getArmor(slot: ArmorSlot): ItemStack {
        abstract();
    }
    /**
     * Sets the entity's sneaking status
     */
    setSneaking(value: boolean): void {
        abstract();
    }
    /**
     * Returns the entity's health
     */
    getHealth(): number {
        abstract();
    }
    /**
     * Returns the entity's maximum health
     */
    getMaxHealth(): number {
        abstract();
    }
    /**
     * @param tag this function stores nbt values to this parameter
     */
    save(tag: CompoundTag): boolean;
    /**
     * it returns JS converted NBT
     */
    save(): Record<string, any>;
    save(tag?: CompoundTag): any {
        abstract();
    }
    readAdditionalSaveData(tag: CompoundTag | NBT.Compound): void {
        abstract();
    }
    load(tag: CompoundTag | NBT.Compound): void {
        abstract();
    }
    allocateAndSave(): CompoundTag {
        const tag = CompoundTag.allocate();
        this.save(tag);
        return tag;
    }

    protected hurt_(source: ActorDamageSource, damage: number, knock: boolean, ignite: boolean): boolean {
        abstract();
    }
    hurt(source: ActorDamageSource, damage: number, knock: boolean, ignite: boolean): boolean;
    hurt(cause: ActorDamageCause, damage: number, knock: boolean, ignite: boolean): boolean;
    hurt(sourceOrCause: ActorDamageSource | ActorDamageCause, damage: number, knock: boolean, ignite: boolean): boolean {
        const isSource = sourceOrCause instanceof ActorDamageSource;
        const source = isSource ? sourceOrCause : ActorDamageSource.create(sourceOrCause);
        return this.hurt_(source, damage, knock, ignite);
    }
    /**
     * Changes a specific status flag of the entity
     * @remarks Most of the time it will be reset by ticking
     *
     */
    setStatusFlag(flag: ActorFlags, value: boolean): void {
        abstract();
    }
    /**
     * Returns a specific status flag of the entity
     */
    getStatusFlag(flag: ActorFlags): boolean {
        abstract();
    }
    /**
     * Returns the Level instance of the entity currently in
     */
    getLevel(): Level {
        abstract();
    }
    /**
     * Returns if the entity is alive
     */
    isAlive(): boolean {
        abstract();
    }
    /**
     * Returns if the entity is invisible
     */
    isInvisible(): boolean {
        abstract();
    }
    /**
     * Makes `this` rides on the ride
     * @param ride ride, vehicle
     * @returns Returns whether riding was successful
     */
    startRiding(ride: Actor): boolean {
        abstract();
    }
    protected _isRiding(): boolean {
        abstract();
    }
    protected _isRidingOn(entity: Actor): boolean {
        abstract();
    }
    /**
     * Returns if the entity is riding (on an entity)
     */
    isRiding(): boolean;
    isRiding(entity: Actor): boolean;
    isRiding(entity?: Actor): boolean {
        if (entity) return this._isRidingOn(entity);
        return this._isRiding();
    }
    protected _isPassenger(ride: Actor): boolean {
        abstract();
    }
    isPassenger(ride: ActorUniqueID): boolean;
    isPassenger(ride: Actor): boolean;
    isPassenger(ride: ActorUniqueID | Actor): boolean {
        if (ride instanceof Actor) {
            return this._isPassenger(ride);
        } else {
            const actor = Actor.fromUniqueIdBin(ride);
            if (actor === null) {
                throw Error("actor not found");
            }
            return this._isPassenger(actor);
        }
    }

    /**
     * The result is smooth movement only with `server-authoritative-movement=server-auth-with-rewind` & `correct-player-movement=true` in `server.properties`.
     *
     * If the entity is a Player, it works with only `server-authoritative-movement=server-auth-with-rewind` & `correct-player-movement=true` in `server.properties`.
     */
    setVelocity(dest: Vec3): void {
        abstract();
    }

    isInWater(): boolean {
        abstract();
    }

    getArmorContainer(): SimpleContainer {
        abstract();
    }

    getHandContainer(): SimpleContainer {
        abstract();
    }

    setOnFire(seconds: number): void {
        abstract();
    }

    setOnFireNoEffects(seconds: number): void {
        abstract();
    }

    static fromUniqueIdBin(bin: bin64_t, getRemovedActor: boolean = true): Actor | null {
        abstract();
    }
    static fromUniqueId(lowbits: number, highbits: number, getRemovedActor: boolean = true): Actor | null {
        return Actor.fromUniqueIdBin(bin.make64(lowbits, highbits), getRemovedActor);
    }
    /**
     * Gets the entity from entity component of bedrock scripting api
     * @deprecated bedrock scripting API is removed.
     */
    static fromEntity(entity: unknown, getRemovedActor: boolean = true): Actor | null {
        const u = (entity as any).__unique_id__;
        return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"], getRemovedActor);
    }
    static all(): IterableIterator<Actor> {
        abstract();
    }
    [nativeClassUtil.inspectFields](obj: Record<string, any>): void {
        obj.name = this.getNameTag();
        obj.pos = this.getPosition();
        obj.type = this.getEntityTypeId();
    }
    runCommand(command: string, mute: CommandResultType = true, permissionLevel?: CommandPermissionLevel): CommandResult<CommandResult.Any> {
        abstract();
    }
    isMoving(): boolean {
        abstract();
    }
    getEquippedTotem(): ItemStack {
        abstract();
    }
    consumeTotem(): boolean {
        abstract();
    }
    hasTotemEquipped(): boolean {
        abstract();
    }
    protected hasFamily_(familyType: HashedString): boolean {
        abstract();
    }
    /**
     * Returns whether the entity has the family type.
     * Ref: https://minecraft.wiki/w/Family
     */
    hasFamily(familyType: HashedString | string): boolean {
        if (familyType instanceof HashedString) {
            return this.hasFamily_(familyType);
        }
        const hashStr = HashedString.constructWith(familyType);
        const hasFamily = this.hasFamily_(hashStr);
        hashStr.destruct();
        return hasFamily;
    }
    /**
     * Returns the distance from the entity(returns of {@link getPosition}) to {@link dest}
     */
    distanceTo(dest: Vec3): number {
        abstract();
    }
    /**
     * Returns the mob that hurt the entity(`this`)
     */
    getLastHurtByMob(): Mob | null {
        abstract();
    }
    /**
     * Returns the last actor damage cause for the entity.
     */
    getLastHurtCause(): ActorDamageCause {
        abstract();
    }
    /**
     * Returns the last damage amount for the entity.
     */
    getLastHurtDamage(): number {
        abstract();
    }
    /**
     * Returns a mob that was hurt by the entity(`this`)
     */
    getLastHurtMob(): Mob | null {
        abstract();
    }
    /**
     * Returns whether the entity was last hit by a player.
     */
    wasLastHitByPlayer(): boolean {
        abstract();
    }
    /**
     * Returns the speed of the entity
     * If the entity is a Player and server-authoritative-movement(in `server.properties`) is `client-auth`, the result is always 0m/s.
     */
    getSpeedInMetersPerSecond(): number {
        abstract();
    }
    protected fetchNearbyActorsSorted_(maxDistance: Vec3, filter: ActorType): CxxVector<DistanceSortedActor> {
        abstract();
    }
    /**
     * Fetches other entities nearby from the entity.
     */
    fetchNearbyActorsSorted(maxDistance: Vec3, filter: ActorType): DistanceSortedActor[] {
        const vector = this.fetchNearbyActorsSorted_(maxDistance, filter);
        const length = vector.size();
        const arr = new Array(length);
        for (let i = 0; i < length; i++) {
            arr[i] = DistanceSortedActor.construct(vector.get(i));
        }
        vector.destruct();
        return arr;
    }

    /**
     * Returns whether the player is in creative mode
     */
    isCreative(): boolean {
        abstract();
    }

    /**
     * Returns whether the player is in adventure mode
     */
    isAdventure(): boolean {
        abstract();
    }

    /**
     * Returns whether the player is in survival mode
     */
    isSurvival(): boolean {
        abstract();
    }

    /**
     * Returns whether the player is in spectator mode
     */
    isSpectator(): boolean {
        abstract();
    }

    /**
     * Removes the entity
     */
    remove(): void {
        abstract();
    }

    /**
     * Returns whether the actor is angry
     */
    isAngry(): boolean {
        abstract();
    }

    /**
     * Find actor's attack target
     * @deprecated code not found
     */
    findAttackTarget(): Actor | null {
        console.error(colors.red("Actor.findAttackTarget is not available. deleted from BDS"));
        return null;
    }

    /**
     * Get actor targeting block
     */
    getBlockTarget(): BlockPos {
        abstract();
    }

    isAttackableGamemode(): boolean {
        abstract();
    }

    isInvulnerableTo(damageSource: ActorDamageSource): boolean {
        abstract();
    }

    canSee(target: Actor): boolean;
    canSee(target: Vec3): boolean;
    canSee(target: Actor | Vec3): boolean {
        abstract();
    }

    isValidTarget(source: Actor | null = null): boolean {
        abstract();
    }

    canAttack(target: Actor | null, unknown = false): boolean {
        abstract();
    }

    getLastDeathPos(): CxxOptional<BlockPos> {
        abstract();
    }

    getLastDeathDimension(): CxxOptional<DimensionId> {
        abstract();
    }

    protected _getViewVector(unused: float32_t): Vec3 {
        abstract();
    }

    getViewVector(): Vec3 {
        // it yields the same output as other values
        return this._getViewVector(0.0);
    }

    isImmobile(): boolean {
        abstract();
    }

    isSwimming(): boolean {
        abstract();
    }

    /**
     * Changes the actor's size
     * @remarks This function does not update the actor's skin size.
     *
     * @param width - New width
     * @param height - New height
     */
    setSize(width: number, height: number): void {
        abstract();
    }

    isInsidePortal(): boolean {
        abstract();
    }

    isInWorld(): boolean {
        abstract();
    }

    isInWaterOrRain(): boolean {
        abstract();
    }

    isInThunderstorm(): boolean {
        abstract();
    }

    isInSnow(): boolean {
        abstract();
    }

    isInScaffolding(): boolean {
        abstract();
    }

    isInRain(): boolean {
        abstract();
    }

    isInPrecipitation(): boolean {
        abstract();
    }

    isInLove(): boolean {
        abstract();
    }

    isInLava(): boolean {
        abstract();
    }

    isInContactWithWater(): boolean {
        abstract();
    }

    isInClouds(): boolean {
        abstract();
    }

    /**
     * @deprecated it's meaningless. Doesn't work for decayed objects.
     */
    isRemoved(): boolean {
        return false;
    }

    isBaby(): boolean {
        abstract();
    }

    getEntityData(): SynchedActorDataEntityWrapper {
        abstract();
    }

    /**
     * Scale: 1 is for adult (normal), 0.5 is for baby.
     * It changes the size of Hitbox, and entity's size.
     */
    setScale(scale: float32_t): void {
        const entityData = this.getEntityData();
        entityData.setFloat(ActorDataIDs.Scale, scale);
    }
    /**
     * Scale: 1 is for adult (normal), 0.5 is for baby.
     */
    getScale(): float32_t {
        const entityData = this.getEntityData();
        return entityData.getFloat(ActorDataIDs.Scale);
    }

    getOwner(): Mob | null {
        abstract();
    }

    setOwner(entityId: ActorUniqueID): void {
        abstract();
    }

    getVariant(): int32_t {
        abstract();
    }

    setVariant(variant: int32_t): void {
        abstract();
    }
    protected _tryGetComponent(comp: string): any | null {
        abstract();
    }
    tryGetComponent<K extends keyof ComponentsClassMap, T extends ComponentsClassMap[K]>(comp: K): T | null {
        return this._tryGetComponent(comp);
    }
}
mangle.update(Actor);

interface ComponentsClassMap {
    "minecraft:physics": PhysicsComponent;
    "minecraft:projectile": ProjectileComponent;
    "minecraft:damage_sensor": DamageSensorComponent;
    "minecraft:command_block": CommandBlockComponent;
    "minecraft:nameable": NameableComponent;
    "minecraft:navigation": NavigationComponent;
    "minecraft:npc": NpcComponent;
    "minecraft:rideable": RideableComponent;
    "minecraft:container": ContainerComponent;
    "minecraft:pushable": PushableComponent;
    "minecraft:shooter": ShooterComponent;
    "minecraft:conditional_bandwidth_optimization": ConditionalBandwidthOptimizationComponent;
}

@nativeClass(null)
export class SynchedActorDataEntityWrapper extends AbstractClass {
    /**
     * SynchedActorDataEntityWrapper::set<float>
     */
    setFloat(id: ActorDataIDs, value: float32_t): void {
        abstract();
    }
    /**
     * SynchedActorDataEntityWrapper::getFloat
     */
    getFloat(id: ActorDataIDs): float32_t {
        abstract();
    }

    /**
     * SynchedActorDataEntityWrapper::set<int>
     */
    setInt(id: ActorDataIDs, value: int32_t): void {
        abstract();
    }

    /**
     * SynchedActorDataEntityWrapper::getInt
     */
    getInt(id: ActorDataIDs): int32_t {
        abstract();
    }
}

export enum ActorDataIDs /** : unsigned short */ {
    Variant = 0x02, // used as int, in Actor::setVariant
    Scale = 0x26, // used as float, in Actor::setSize
    Width = 0x35, // used as float, in Actor::setSize
    Height = 0x36, // used as float, in Actor::setSize
}

@nativeClass()
export class DistanceSortedActor extends NativeStruct {
    @nativeField(Actor.ref())
    entity: Actor;
    /** @deprecated use distanceSq */
    @nativeField(float32_t, { ghost: true })
    distance: float32_t;
    @nativeField(float32_t)
    distanceSq: float32_t;
}

export class Mob extends Actor {
    /**
     * @returns the entity's armor value (as an integer)
     */
    getArmorValue(): number {
        abstract();
    }
    /**
     * Applies knockback to the mob
     */
    knockback(source: Actor | null, damage: int32_t, xd: float32_t, zd: float32_t, power: float32_t, height: float32_t, heightCap: float32_t): void {
        abstract();
    }
    getSpeed(): number {
        abstract();
    }
    isSprinting(): boolean {
        abstract();
    }
    sendArmorSlot(slot: ArmorSlot): void {
        abstract();
    }
    setSprinting(shouldSprint: boolean): void {
        abstract();
    }

    protected _sendInventory(shouldSelectSlot: boolean): void {
        abstract();
    }
    /**
     * Updates the mob's inventory
     * @remarks used in PlayerHotbarPacket if the mob is a player
     *
     * @param shouldSelectSlot - Defines whether the sync selected slot also. (Sends `PlayerHotbarPacket`)
     */
    sendInventory(shouldSelectSlot: boolean = false): void {
        this._sendInventory(shouldSelectSlot);
    }
    setSpeed(speed: number): void {
        abstract();
    }
    protected hurtEffects_(sourceOrCause: ActorDamageSource, damage: number, knock: boolean, ignite: boolean): boolean {
        abstract();
    }
    /**
     * Shows hurt effects to the mob. Actually not hurt.
     * Useful when change the health of the mob without triggering {@link events.entityHurt} event.
     */
    hurtEffects(damageCause: ActorDamageCause, damage: number, knock: boolean, ignite: boolean): boolean;
    hurtEffects(damageSource: ActorDamageSource, damage: number, knock: boolean, ignite: boolean): boolean;
    hurtEffects(sourceOrCause: ActorDamageCause | ActorDamageSource, damage: number, knock: boolean, ignite: boolean): boolean {
        const isSource = sourceOrCause instanceof ActorDamageSource;
        const source = isSource ? sourceOrCause : ActorDamageSource.create(sourceOrCause);
        return this.hurtEffects_(source, damage, knock, ignite);
    }
    getArmorCoverPercentage(): float32_t {
        abstract();
    }
    getToughnessValue(): int32_t {
        abstract();
    }

    isBlocking(): boolean {
        abstract();
    }
}

export class ItemActor extends Actor {
    itemStack: ItemStack;
}
