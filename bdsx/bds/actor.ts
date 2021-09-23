import { bin } from "../bin";
import { CircularDetector } from "../circulardetector";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { makefunc } from "../makefunc";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, CxxString, int32_t, int64_as_float_t, NativeType } from "../nativetype";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { BlockSource } from "./block";
import { Vec2, Vec3 } from "./blockpos";
import type { CommandPermissionLevel } from "./command";
import { Dimension } from "./dimension";
import { MobEffect, MobEffectIds, MobEffectInstance } from "./effects";
import { HashedString } from "./hashedstring";
import type { ArmorSlot, ItemStack } from "./inventory";
import { NetworkIdentifier } from "./networkidentifier";
import { Packet } from "./packet";
import type { ServerPlayer } from "./player";

export const ActorUniqueID = bin64_t.extends();
export type ActorUniqueID = bin64_t;

export enum DimensionId { // int32_t
    Overworld = 0,
    Nether = 1,
    TheEnd = 2
}

export class ActorRuntimeID extends VoidPointer {
}

export enum ActorType {
    Item = 0x40,
    PrimedTnt,
    FallingBlock,
    MovingBlock,
    Experience = 0x45,
    EyeOfEnder,
    EnderCrystal,
    FireworksRocket,
    FishingHook = 0x4D,
    Chalkboard,
    Painting = 0x53,
    LeashKnot = 0x58,
    BoatRideable = 0x5A,
    LightningBolt = 0x5D,
    AreaEffectCloud,
    Balloon = 0x6B,
    Shield = 0x75,
    Lectern = 0x77,
    TypeMask = 0xFF,

    Mob,
    Npc = 0x133,
    Agent = 0x138,
    ArmorStand = 0x13D,
    TripodCamera,
    Player,
    Bee = 0x17A,
    Piglin,
    PiglinBrute = 0x17F,

    PathfinderMob = 0x300,
    IronGolem = 0x314,
    SnowGolem,
    WanderingTrader = 0x376,

    Monster = 0xB00,
    Creeper = 0xB21,
    Slime = 0xB25,
    EnderMan,
    Ghast = 0xB29,
    LavaSlime = 0xB2A,
    Blaze,
    Witch = 0xB2D,
    Guardian = 0xB31,
    ElderGuardian,
    Dragon = 0xB35,
    Shulker,
    Vindicator = 0xB39,
    IllagerBeast = 0xB3B,
    EvocationIllager = 0xB68,
    Vex,
    Pillager = 0xB72,
    ElderGuardianGhost = 0xB78,

    Animal = 0x1300,
    Chicken = 0x130A,
    Cow,
    Pig,
    Sheep,
    MushroomCow = 0x1310,
    Rabbit = 0x1312,
    PolarBear = 0x131C,
    Llama,
    Turtle = 0x134A,
    Panda = 0x1371,
    Fox = 0x1379,
    Hoglin = 0x137C,
    Strider,
    Goat = 0x1380,
    Axolotl = 0x1382,

    WaterAnimal = 0x2300,
    Squid = 0x2311,
    Dolphin = 0x231F,
    Pufferfish = 0x236C,
    Salmon,
    Tropicalfish = 0x236F,
    Fish,
    GlowSquid = 0x2381,

    TameableAnimal = 0x5300,
    Wolf = 0x530E,
    Ocelot = 0x5316,
    Parrot = 0x531E,
    Cat = 0x534B,

    Ambient = 0x8100,
    Bat = 0x8113,

    UndeadMob = 0x10B00,
    PigZombie = 0x10B24,
    WitherBoss = 0x10B34,
    Phantom = 0x10B3A,
    Zoglin = 0x10B7E,

    ZombieMonster= 0x30B00,
    Zombie = 0x30B20,
    ZombieVillager = 0x30B2C,
    Husk = 0x30B2F,
    Drowned = 0x30B6E,
    ZombieVillagerV2 = 0x30B74,

    Arthropod = 0x40B00,
    Spider = 0x40B23,
    Silverfish = 0x40B27,
    CaveSpider,
    Endermite = 0x40B37,

    Minecart = 0x80000,
    MinecartRideable = 0x80054,
    MinecartHopper = 0x80060,
    MinecartTNT,
    MinecartChest,
    MinecartFurnace,
    MinecartCommandBlock,

    SkeletonMonster = 0x110B00,
    Skeleton = 0x110B22,
    Stray = 0x110B2E,
    WitherSkeleton = 0x110B30,

    EquineAnimal = 0x205300,
    Horse = 0x205317,
    Donkey,
    Mule,
    SkeletonHorse = 0x215B1A,
    ZombieHorse,

    Projectile = 0x400000,
    ExperiencePotion = 0x400044,
    ShulkerBullet = 0x40004C,
    DragonFireball = 0x40004F,
    Snowball = 0x400051,
    ThrownEgg,
    LargeFireball = 0x400055,
    ThrownPotion,
    Enderpearl,
    WitherSkull = 0x400059,
    WitherSkullDangerous = 0x40005B,
    SmallFireball = 0x40005E,
    LingeringPotion = 0x400065,
    LlamaSpit,
    EvocationFang,
    IceBomb = 0x40006A,

    AbstractArrow    = 0x800000,
    Trident    = 0x0C00049,
    Arrow,
    VillagerBase = 0x1000300,
    Villager = 0x100030F,
    VillagerV2 = 0x1000373,
}

@nativeClass(0xb0)
export class ActorDefinitionIdentifier extends NativeClass {
    @nativeField(CxxString)
    namespace:CxxString;
    @nativeField(CxxString)
    identifier:CxxString;
    @nativeField(CxxString)
    initEvent:CxxString;
    @nativeField(CxxString)
    fullName:CxxString;
    @nativeField(HashedString)
    canonicalName:HashedString;

    static create(type:ActorType):ActorDefinitionIdentifier {
        abstract();
    }
}

@nativeClass(0x10)
export class ActorDamageSource extends NativeClass{
    @nativeField(int32_t, 0x08)
    cause: int32_t;

    /** @deprecated Has to be confirmed working */
    getDamagingEntityUniqueID():ActorUniqueID {
        abstract();
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
    Temperature = 0x1A,
    All = 0x1F,
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
    Ignit0ed,
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
    Snezing,
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
}

@nativeClass()
export class EntityContext extends NativeClass {

}

@nativeClass()
export class OwnerStorageEntity extends NativeClass {
    _getStackRef():EntityContext {
        abstract();
    }
}

@nativeClass(0x18)
export class EntityRefTraits extends NativeClass {
    @nativeField(OwnerStorageEntity)
    context:OwnerStorageEntity;
}

export class Actor extends NativeClass {
    vftable:VoidPointer;
    /** @deprecated use getIdentifier */
    get identifier():EntityId {
        return this.getIdentifier();
    }

    /** @example Actor.summonAt(player.getRegion(), player.getPosition(), ActorDefinitionIdentifier.create(ActorType.Pig), -1, player) */
    static summonAt(region:BlockSource, pos:Vec3, type:ActorDefinitionIdentifier, id:ActorUniqueID, summoner?:Actor):Actor;
    static summonAt(region:BlockSource, pos:Vec3, type:ActorDefinitionIdentifier, id:int64_as_float_t, summoner?:Actor):Actor;
    static summonAt(region:BlockSource, pos:Vec3, type:ActorDefinitionIdentifier, id:ActorUniqueID|int64_as_float_t, summoner?:Actor):Actor {
        abstract();
    }
    static tryGetFromEntity(entity:EntityContext):Actor {
        abstract();
    }

    sendPacket(packet:Packet):void {
        if (!this.isPlayer()) throw Error("this is not ServerPlayer");
        this.sendNetworkPacket(packet);
    }
    protected _getArmorValue():number{
        abstract();
    }
    getArmorValue(): number{
        if(this.isItem()) return 0;
        return this._getArmorValue();
    }
    getDimension():Dimension {
        abstract();
    }
    getDimensionId():DimensionId {
        abstract();
    }
    getIdentifier():EntityId {
        return this.getActorIdentifier().canonicalName.str as EntityId;
    }
    getActorIdentifier():ActorDefinitionIdentifier {
        abstract();
    }
    isPlayer():this is ServerPlayer {
        abstract();
    }
    isItem():this is ItemActor {
        abstract();
    }
    getAttributes():BaseAttributeMap {
        abstract();
    }
    getName():string {
        abstract();
    }
    setName(name:string):void {
        abstract();
    }
    setScoreTag(text:string):void{
        abstract();
    }
    getScoreTag():string{
        abstract();
    }
    getNetworkIdentifier():NetworkIdentifier {
        throw Error(`this is not player`);
    }
    getPosition():Vec3 {
        abstract();
    }
    getRotation():Vec2 {
        abstract();
    }
    getRegion():BlockSource {
        abstract();
    }
    getUniqueIdLow():number {
        return this.getUniqueIdPointer().getInt32(0);
    }
    getUniqueIdHigh():number {
        return this.getUniqueIdPointer().getInt32(4);
    }
    getUniqueIdBin():bin64_t {
        return this.getUniqueIdPointer().getBin64();
    }
    /**
     * it returns address of the unique id field
     */
    getUniqueIdPointer():StaticPointer {
        abstract();
    }

    getEntityTypeId():ActorType {
        abstract();
    }
    getCommandPermissionLevel():CommandPermissionLevel {
        abstract();
    }
    getAttribute(id:AttributeId):number {
        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null) return 0;
        return attr.currentValue;
    }
    setAttribute(id:AttributeId, value:number):AttributeInstance|null {
        if (id < 1) return null;
        if (id > 15) return null;

        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null) throw Error(`${this.identifier} has not ${AttributeId[id] || `Attribute${id}`}`);
        attr.currentValue = value;
        return attr;
    }
    getRuntimeID():ActorRuntimeID {
        abstract();
    }
    /**
     * @deprecated Need more implement
     */
    getEntity():IEntity {
        let entity:IEntity = (this as any).entity;
        if (entity) return entity;
        entity = {
            __unique_id__:{
                "64bit_low": this.getUniqueIdLow(),
                "64bit_high": this.getUniqueIdHigh()
            },
            __identifier__:this.identifier,
            __type__:(this.getEntityTypeId() & 0xff) === 0x40 ? 'item_entity' : 'entity',
            id:0, // bool ScriptApi::WORKAROUNDS::helpRegisterActor(entt::Registry<unsigned int>* registry? ,Actor* actor,unsigned int* id_out);
        };
        return (this as any).entity = entity;
    }
    addEffect(effect: MobEffectInstance): void {
        abstract();
    }
    removeEffect(id: MobEffectIds):void {
        abstract();
    }
    protected _hasEffect(mobEffect: MobEffect):boolean {
        abstract();
    }
    hasEffect(id: MobEffectIds):boolean {
        const effect = MobEffect.create(id);
        const retval = this._hasEffect(effect);
        effect.destruct();
        return retval;
    }
    protected _getEffect(mobEffect: MobEffect):MobEffectInstance | null {
        abstract();
    }
    getEffect(id: MobEffectIds):MobEffectInstance | null {
        const effect = MobEffect.create(id);
        const retval = this._getEffect(effect);
        effect.destruct();
        return retval;
    }
    addTag(tag:string):boolean {
        abstract();
    }
    hasTag(tag:string):boolean {
        abstract();
    }
    removeTag(tag:string):boolean {
        abstract();
    }
    teleport(pos:Vec3, dimensionId:DimensionId=DimensionId.Overworld):void {
        abstract();
    }
    getArmor(slot:ArmorSlot):ItemStack {
        abstract();
    }
    setSneaking(value:boolean):void {
        abstract();
    }
    getHealth():number {
        abstract();
    }
    getMaxHealth():number {
        abstract();
    }
    /**
     * Most of the time it will be reset by ticking
     * @returns changed
     */
    setStatusFlag(flag:ActorFlags, value:boolean):boolean {
        abstract();
    }
    getStatusFlag(flag:ActorFlags):boolean {
        abstract();
    }
    static fromUniqueIdBin(bin:bin64_t, getRemovedActor:boolean = true):Actor|null {
        abstract();
    }
    static fromUniqueId(lowbits:number, highbits:number, getRemovedActor:boolean = true):Actor|null {
        return Actor.fromUniqueIdBin(bin.make64(lowbits, highbits), getRemovedActor);
    }
    static fromEntity(entity:IEntity, getRemovedActor:boolean = true):Actor|null {
        const u = entity.__unique_id__;
        return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"], getRemovedActor);
    }
    static [NativeType.getter](ptr:StaticPointer, offset?:number):Actor {
        return Actor._singletoning(ptr.add(offset, offset! >> 31))!;
    }
    static [makefunc.getFromParam](stackptr:StaticPointer, offset?:number):Actor|null {
        return Actor._singletoning(stackptr.getNullablePointer(offset));
    }
    static all():IterableIterator<Actor> {
        abstract();
    }
    private static _singletoning(ptr:StaticPointer|null):Actor|null {
        abstract();
    }
    _toJsonOnce(allocator:()=>Record<string, any>):Record<string, any> {
        return CircularDetector.check(this, allocator, obj=>{
            obj.name = this.getName();
            obj.pos = this.getPosition();
            obj.type = this.getEntityTypeId();
        });
    }
}

export class ItemActor extends Actor {
    itemStack:ItemStack;
}
