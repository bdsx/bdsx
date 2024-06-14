import * as colors from "colors";
import { bin } from "../bin";
import { capi } from "../capi";
import type * as commandenum from "../commandenum";
import { CommandParameterType } from "../commandparam";
import * as commandparser from "../commandparser";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { CxxMap } from "../cxxmap";
import { CxxPair } from "../cxxpair";
import { CxxVector, CxxVectorToArray } from "../cxxvector";
import { makefunc } from "../makefunc";
import { mangle } from "../mangle";
import { AbstractClass, KeysFilter, NativeClass, NativeClassType, NativeStruct, nativeClass, nativeField, vectorDeletingDestructor } from "../nativeclass";
import {
    CommandParameterNativeType,
    CxxString,
    NativeType,
    Type,
    bin64_t,
    bool_t,
    float32_t,
    int16_t,
    int32_t,
    uint16_t,
    uint32_t,
    uint64_as_float_t,
    uint8_t,
    void_t,
} from "../nativetype";
import { Wrapper } from "../pointer";
import { procHacker } from "../prochacker";
import { CxxSharedPtr } from "../sharedpointer";
import { Singleton } from "../singleton";
import { bdsxEqualsAssert } from "../warning";
import { Actor, ActorDefinitionIdentifier } from "./actor";
import { Block } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import { CommandSymbols } from "./cmdsymbolloader";
import { CommandName } from "./commandname";
import { CommandOrigin } from "./commandorigin";
import { JsonValue } from "./connreq";
import { MobEffect } from "./effects";
import { HashedString } from "./hashedstring";
import { ItemStack } from "./inventory";
import { InvertableFilter } from "./invertablefilter";
import { AvailableCommandsPacket } from "./packets";
import { ServerPlayer } from "./player";
import { proc } from "./symbols";
import { HasTypeId, type_id, typeid_t } from "./typeid";
import commandParser = commandparser.commandParser;

export enum CommandPermissionLevel {
    Normal,
    Operator,
    Host,
    Automation,
    Admin,
    Internal,
}

export enum CommandCheatFlag {
    Cheat,
    NotCheat = 0x40,
    /** @deprecated */
    NoCheat = 0x40,
    None = 0,
}

export enum CommandExecuteFlag {
    Allowed,
    Disallowed = 0x10,
}

export enum CommandSyncFlag {
    Synced,
    Local = 8,
}

export enum CommandTypeFlag {
    None,
    Message = 0x20,
}

export enum CommandUsageFlag {
    Normal,
    Test,
    /** @deprecated Use `CommandVisibilityFlag` */
    Hidden,
    _Unknown = 0x80,
}

/** Putting in flag1 or flag2 are both ok, you can also combine with other flags like CommandCheatFlag.NoCheat | CommandVisibilityFlag.HiddenFromCommandBlockOrigin but combining is actually not quite useful */
export enum CommandVisibilityFlag {
    Visible,
    /** Bug: Besides from being hidden from command blocks, players cannot see it also well, but they are still able to execute */
    HiddenFromCommandBlockOrigin = 2,
    HiddenFromPlayerOrigin = 4,
    /** Still visible to console */
    Hidden = 6,
}

/** @deprecated **/
export const CommandFlag = CommandCheatFlag; // CommandFlag is actually a class

export enum SoftEnumUpdateType {
    Add,
    Remove,
    Replace,
}

@nativeClass()
export class MCRESULT extends NativeStruct {
    @nativeField(uint32_t)
    result: uint32_t;

    getFullCode(): number {
        abstract();
    }
    isSuccess(): boolean {
        abstract();
    }
}
MCRESULT.prototype.getFullCode = procHacker.js("?getFullCode@MCRESULT@@QEBAHXZ", int32_t, { this: MCRESULT });
MCRESULT.prototype.isSuccess = procHacker.js("?isSuccess@MCRESULT@@QEBA_NXZ", bool_t, { this: MCRESULT });

@nativeClass()
export class CommandPosition extends NativeStruct {
    static readonly [CommandParameterType.symbol]: true;
    @nativeField(float32_t)
    x: float32_t;
    @nativeField(float32_t)
    y: float32_t;
    @nativeField(float32_t)
    z: float32_t;
    @nativeField(bool_t)
    isXRelative: bool_t;
    @nativeField(bool_t)
    isYRelative: bool_t;
    @nativeField(bool_t)
    isZRelative: bool_t;
    @nativeField(bool_t)
    local: bool_t;

    static create(x: number, isXRelative: boolean, y: number, isYRelative: boolean, z: number, isZRelative: boolean, local: boolean): CommandPosition {
        const ret = new CommandPosition(true);
        ret.x = x;
        ret.y = y;
        ret.z = z;
        ret.isXRelative = isXRelative;
        ret.isYRelative = isYRelative;
        ret.isZRelative = isZRelative;
        ret.local = local;
        return ret;
    }

    protected _getPosition(unknown: number, origin: CommandOrigin, offsetFromBase: Vec3): Vec3 {
        abstract();
    }
    getPosition(origin: CommandOrigin, offsetFromBase: Vec3 = Vec3.create(0, 0, 0)): Vec3 {
        return this._getPosition(0, origin, offsetFromBase);
    }
    protected _getBlockPosition(unknown: number, origin: CommandOrigin, offsetFromBase: Vec3): BlockPos {
        abstract();
    }
    getBlockPosition(origin: CommandOrigin, offsetFromBase: Vec3 = Vec3.create(0, 0, 0)): BlockPos {
        return this._getBlockPosition(0, origin, offsetFromBase);
    }
}
(CommandPosition.prototype as any)._getPosition = procHacker.js(
    "?getPosition@CommandPosition@@QEBA?AVVec3@@HAEBVCommandOrigin@@AEBV2@@Z",
    Vec3,
    { this: CommandPosition, structureReturn: true },
    int32_t,
    CommandOrigin,
    Vec3,
);
(CommandPosition.prototype as any)._getBlockPosition = procHacker.js(
    "?getBlockPos@CommandPosition@@QEBA?AVBlockPos@@HAEBVCommandOrigin@@AEBVVec3@@@Z",
    BlockPos,
    { this: CommandPosition, structureReturn: true },
    int32_t,
    CommandOrigin,
    Vec3,
);

@nativeClass()
export class CommandPositionFloat extends CommandPosition {
    static readonly [CommandParameterType.symbol]: true;

    static create(x: number, isXRelative: boolean, y: number, isYRelative: boolean, z: number, isZRelative: boolean, local: boolean): CommandPositionFloat {
        const ret = CommandPosition.construct();
        ret.x = x;
        ret.y = y;
        ret.z = z;
        ret.isXRelative = isXRelative;
        ret.isYRelative = isYRelative;
        ret.isZRelative = isZRelative;
        ret.local = local;
        return ret;
    }
}

export enum CommandSelectionOrder {
    Sorted,
    InvertSorted,
    Random,
}

export enum CommandSelectionType {
    /** Used in @s */
    Self,
    /** Used in @e */
    Entities,
    /** Used in @a */
    Players,
    /** Used in @r */
    DefaultPlayers,
    /** Used in @c */
    OwnedAgent,
    /** Used in @v */
    Agents,
}

@nativeClass(0xc1, 8)
export class CommandSelectorBase<TARGET extends Actor = Actor> extends AbstractClass {
    @nativeField(uint32_t)
    version: number;
    @nativeField(uint32_t)
    type: CommandSelectionType;
    @nativeField(uint32_t)
    order: CommandSelectionOrder;
    @nativeField(CxxVector.make(CommandName))
    nameFilters: CxxVector<CommandName>;
    @nativeField(CxxVector.make(InvertableFilter.make(ActorDefinitionIdentifier)))
    typeFilters: CxxVector<InvertableFilter<ActorDefinitionIdentifier>>;
    @nativeField(CxxVector.make(InvertableFilter.make(HashedString)))
    familyFilters: CxxVector<InvertableFilter<HashedString>>;
    @nativeField(CxxVector.make(CommandName))
    tagFilters: CxxVector<CommandName>;
    /** std::vector<std::function<bool (const CommandOrigin &,const Actor &)>> */
    /** component size is 0x40 */
    // @nativeField(CxxVector.make(VoidPointer))
    // filterChain: CxxVector<VoidPointer>;
    @nativeField(CommandPosition, { offset: 0x18, relative: true })
    position: CommandPosition;
    @nativeField(Vec3)
    boxDeltas: Vec3;
    @nativeField(float32_t)
    radiusMinSquared: number;
    @nativeField(float32_t)
    radiusMaxSquared: number;
    @nativeField(uint64_as_float_t)
    count: number;
    @nativeField(bool_t)
    includeDeadPlayers: boolean;
    @nativeField(bool_t)
    isPositionBound: boolean;
    @nativeField(bool_t)
    distanceFiltered: boolean;
    @nativeField(bool_t)
    positionFiltered: boolean;
    @nativeField(bool_t)
    countFiltered: boolean;
    @nativeField(bool_t)
    haveDeltas: boolean;
    @nativeField(bool_t)
    forcePlayer: boolean;
    @nativeField(bool_t)
    excludeAgents: boolean;
    @nativeField(bool_t)
    isExplicitIdSelector: boolean;

    private _newResults(origin: CommandOrigin): CxxSharedPtr<CxxVector<Actor>> {
        abstract();
    }
    newResults<T extends TARGET>(origin: CommandOrigin, typeFilter?: new (...args: any[]) => T): T[] {
        const list = this._newResults(origin);
        if (typeFilter != null) {
            const out: T[] = [];
            for (const actor of list.p!) {
                if (actor instanceof typeFilter) {
                    out.push(actor as T);
                }
            }
            list.dispose();
            return out;
        } else {
            const actors = list.p!.toArray();
            list.dispose();
            return actors as T[];
        }
    }
    getName(): string {
        abstract();
    }
    hasName(): boolean {
        abstract();
    }
    // void __cdecl CommandSelectorBase::addTypeFilter(CommandSelectorBase *this, const InvertableFilter<std::basic_string<char,std::char_traits<char>,std::allocator<char> > > *filter)
    addTypeFilter(filter: CommandName): void {
        this.isExplicitIdSelector = false;
        const type = filter.name.toLowerCase();
        const parsedType = ActorDefinitionIdentifier.constructWith(type);

        const typeFilter = InvertableFilter.make(ActorDefinitionIdentifier).construct();
        typeFilter.setValue(parsedType);
        typeFilter.inverted = filter.inverted;
        this.typeFilters.push(typeFilter);

        typeFilter.destruct();
        parsedType.destruct();
    }
    // bool __cdecl CommandSelectorBase::filter(const CommandSelectorBase *this, const CommandOrigin *origin, Actor *entity)
    filter(origin: CommandOrigin, entity: Actor): boolean {
        abstract();
    }
    // std::string *__cdecl CommandSelectorBase::getExplicitPlayerName(std::string *retstr, const CommandSelectorBase *this)
    getExplicitPlayerName(): string {
        if (this.type === CommandSelectionType.Players && this.hasName() && this.nameFilters.size() === 1) {
            return this.getName();
        }
        return "";
    }
    // void __fastcall CommandSelectorBase::setBox(CommandSelectorBase *this, BlockPos deltas)
    setBox(deltas: BlockPos): void {
        this.isExplicitIdSelector = false;
        this.boxDeltas.set(deltas);
        this.isPositionBound = true;
        this.haveDeltas = true;
    }
    // void __cdecl CommandSelectorBase::setIncludeDeadPlayers(CommandSelectorBase *this, bool includeDead)
    setIncludeDeadPlayers(includeDead: boolean): void {
        abstract();
    }
    // void __cdecl CommandSelectorBase::setOrder(CommandSelectorBase *this, CommandSelectionOrder order)
    setOrder(order: CommandSelectionOrder): void {
        this.isExplicitIdSelector = false;
        this.order = order;
    }
    // void __cdecl CommandSelectorBase::setPosition(CommandSelectorBase *this, CommandPosition position)
    setPosition(position: CommandPosition): void {
        this.isExplicitIdSelector = false;
        this.position.construct(position);
    }
    // void __cdecl CommandSelectorBase::setRadiusMin(CommandSelectorBase *this, float rm)
    setRadiusMin(rm: number): void {
        this.isExplicitIdSelector = false;
        this.radiusMaxSquared = rm * rm;
        this.isPositionBound = true;
        this.distanceFiltered = true;
    }
    // void __cdecl CommandSelectorBase::setRadiusMax(CommandSelectorBase *this, float r)
    setRadiusMax(r: number): void {
        this.isExplicitIdSelector = false;
        this.radiusMaxSquared = r * r;
        this.isPositionBound = true;
        this.distanceFiltered = true;
    }
    // void __cdecl CommandSelectorBase::setResultCount(CommandSelectorBase *this, size_t count)
    setResultCount(count: number): void {
        this.isExplicitIdSelector = false;
        this.count = count;
    }
    // void __cdecl CommandSelectorBase::setType(CommandSelectorBase *this, CommandSelectionType type)
    setType(type: CommandSelectionType): void {
        abstract();
    }
}

/** @param args_1 forcePlayer */
const CommandSelectorBaseCtor = procHacker.js("??0CommandSelectorBase@@IEAA@_N@Z", void_t, null, CommandSelectorBase, bool_t);
CommandSelectorBase.prototype[NativeType.dtor] = procHacker.js("??1CommandSelectorBase@@QEAA@XZ", void_t, { this: CommandSelectorBase });
(CommandSelectorBase.prototype as any)._newResults = procHacker.js(
    "?newResults@CommandSelectorBase@@IEBA?AV?$shared_ptr@V?$vector@PEAVActor@@V?$allocator@PEAVActor@@@std@@@std@@@std@@AEBVCommandOrigin@@@Z",
    CxxSharedPtr.make(CxxVector.make(Actor.ref())),
    { this: CommandSelectorBase, structureReturn: true },
    CommandOrigin,
);
CommandSelectorBase.prototype.filter = procHacker.js(
    "?filter@CommandSelectorBase@@AEBA_NAEBVCommandOrigin@@AEAVActor@@@Z",
    bool_t,
    { this: CommandSelectorBase },
    CommandOrigin,
    Actor,
);
CommandSelectorBase.prototype.getName = procHacker.js(
    "?getName@CommandSelectorBase@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: CommandSelectorBase, structureReturn: true },
);
CommandSelectorBase.prototype.hasName = procHacker.js("?hasName@CommandSelectorBase@@QEBA_NXZ", bool_t, { this: CommandSelectorBase });
CommandSelectorBase.prototype.setIncludeDeadPlayers = procHacker.js(
    "?setIncludeDeadPlayers@CommandSelectorBase@@QEAAX_N@Z",
    void_t,
    { this: CommandSelectorBase },
    bool_t,
);
CommandSelectorBase.prototype.setType = procHacker.js(
    "?setType@CommandSelectorBase@@QEAAXW4CommandSelectionType@@@Z",
    void_t,
    { this: CommandSelectorBase },
    uint32_t,
);

@nativeClass()
export class WildcardCommandSelector<TARGET extends Actor> extends CommandSelectorBase<TARGET> {
    static make<T extends Actor>(type: Type<T>): NativeClassType<WildcardCommandSelector<T>> {
        return Singleton.newInstance(WildcardCommandSelector, type, () => {
            class WildcardCommandSelectorImpl extends WildcardCommandSelector<T> {}
            WildcardCommandSelectorImpl.define({});
            Object.defineProperties(WildcardCommandSelectorImpl, {
                name: { value: `WildcardCommandSelector<${type.name}>` },
                symbol: {
                    value: mangle.templateClass("WildcardCommandSelector", type),
                },
            });

            return WildcardCommandSelectorImpl;
        });
    }
}
interface WildcardCommandSelectorType<T extends Actor> extends NativeClassType<WildcardCommandSelector<T>> {
    [CommandParameterType.symbol]: true;
}
export const ActorWildcardCommandSelector = WildcardCommandSelector.make(Actor) as WildcardCommandSelectorType<Actor>;
ActorWildcardCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};
export const PlayerWildcardCommandSelector = WildcardCommandSelector.make(ServerPlayer) as WildcardCommandSelectorType<ServerPlayer>;
PlayerWildcardCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};

@nativeClass()
export class CommandSelector<TARGET extends Actor> extends CommandSelectorBase<TARGET> {
    static make<T extends Actor>(type: Type<T>): NativeClassType<CommandSelector<T>> {
        return Singleton.newInstance(CommandSelector, type, () => {
            class CommandSelectorImpl extends CommandSelector<T> {}
            CommandSelectorImpl.define({});
            Object.defineProperties(CommandSelectorImpl, {
                name: { value: `CommandSelector<${type.name}>` },
                symbol: {
                    value: mangle.templateClass("CommandSelector", type),
                },
            });

            return CommandSelectorImpl;
        });
    }
}
interface CommandSelectorType<T extends Actor> extends NativeClassType<CommandSelector<T>> {
    [CommandParameterType.symbol]: true;
}
export const ActorCommandSelector = CommandSelector.make(Actor) as CommandSelectorType<Actor>;
ActorCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};
export const PlayerCommandSelector = CommandSelector.make(ServerPlayer) as CommandSelectorType<ServerPlayer>;
PlayerCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, true);
};

@nativeClass()
export class CommandFilePath extends NativeClass {
    static readonly [CommandParameterType.symbol]: true;

    @nativeField(CxxString)
    text: CxxString;
}

@nativeClass()
export class CommandIntegerRange extends NativeClass {
    static readonly [CommandParameterType.symbol]: true;

    @nativeField(int32_t)
    min: int32_t;
    @nativeField(int32_t)
    max: int32_t;
    @nativeField(bool_t)
    inverted: bool_t;

    isWithinRange(value: number): boolean {
        abstract();
    }
}

// If using NativeStruct then all the fields will be garbage, and especially the `inverted` field will mostly become true, unless the garbage is exactly 0 by chance
// BDS only sets it to true when the input starts with `!`, but does not do anything otherwise
// BDS does not change it to false actively, because it assumed default is false
// Calling ??0CommandIntegerRange@@QEAA@XZ sets all values to default
CommandIntegerRange.prototype[NativeType.ctor] = procHacker.js("??0CommandIntegerRange@@QEAA@XZ", CommandIntegerRange, { this: CommandIntegerRange });
CommandIntegerRange.prototype.isWithinRange = procHacker.js("?isWithinRange@CommandIntegerRange@@QEBA_NH@Z", bool_t, { this: CommandIntegerRange }, int32_t);

@nativeClass()
export class CommandItem extends NativeStruct {
    static readonly [CommandParameterType.symbol]: true;

    @nativeField(int32_t)
    version: int32_t;
    @nativeField(int32_t)
    id: int32_t;

    createInstance(count: number): ItemStack {
        abstract();
    }
}

CommandItem.prototype.createInstance = procHacker.js(
    "?createInstance@CommandItem@@QEBA?AV?$optional@VItemInstance@@@std@@HHAEAVCommandOutput@@_N@Z",
    ItemStack,
    { this: CommandItem, structureReturn: true },
    int32_t,
);

export class CommandMessage extends NativeClass {
    static readonly [CommandParameterType.symbol]: true;
    data: CxxVector<CommandMessage.MessageComponent>;

    /**
     * @alias generateMessage but safe
     */
    getMessage(origin: CommandOrigin, maxLength = 128): string {
        const genres = this.generateMessage(origin, maxLength);
        const message = genres.message;
        genres.destruct();
        return message;
    }

    generateMessage(origin: CommandOrigin, maxLength: int32_t): GenerateMessageResult {
        abstract();
    }
}

@nativeClass()
class GenerateMessageResult extends NativeClass {
    @nativeField(CxxString)
    message: CxxString;
    @nativeField(bool_t)
    untouched: bool_t;
}

CommandMessage.prototype.generateMessage = procHacker.js(
    "?generateMessage@CommandMessage@@QEBA?AUGenerateMessageResult@@AEBVCommandOrigin@@H@Z",
    GenerateMessageResult,
    { this: CommandMessage, structureReturn: true },
    CommandOrigin,
    int32_t,
);

export namespace CommandMessage {
    @nativeClass(0x28)
    export class MessageComponent extends NativeClass {
        @nativeField(CxxString)
        string: CxxString;
        @nativeField(ActorCommandSelector.ref())
        selection: WildcardCommandSelector<Actor>;
    }
}

CommandMessage.abstract(
    {
        data: CxxVector.make(CommandMessage.MessageComponent),
    },
    0x18,
);

@nativeClass()
export class CommandRawText extends NativeClass {
    static readonly [CommandParameterType.symbol]: true;

    @nativeField(CxxString)
    text: CxxString;
}

@nativeClass()
export class CommandWildcardInt extends NativeStruct {
    static readonly [CommandParameterType.symbol]: true;

    @nativeField(bool_t)
    isWildcard: bool_t;
    @nativeField(int32_t)
    value: int32_t;
}

// It is a special enum that cannot be used in `command.enum`, it is just a uint8_t.
// However, it might be confusing with only numbers, so I tried to create some methods for it.
// @nativeClass()
// export class CommandOperator extends NativeClass {
//     static readonly [CommandParameterType.symbol]:true;
//     static readonly symbol = 'enum CommandOperator';

//     @nativeField(uint8_t)
//     value:uint8_t;

//     toString(): string {
//         switch (this.value) {
//         case 1: return '=';
//         case 2: return '+=';
//         case 3: return '-=';
//         case 4: return '*=';
//         case 5: return '/=';
//         case 6: return '%=';
//         case 7: return '<';
//         case 8: return '>';
//         case 9: return '><';
//         default: return "invalid";
//         }
//     }

//     valueOf():number {
//         return this.value;
//     }
// }

@nativeClass(0x30)
export class CommandContext extends NativeClass {
    @nativeField(CxxString)
    command: CxxString;
    @nativeField(CommandOrigin.ref())
    origin: CommandOrigin;
    @nativeField(int32_t, 0x28)
    version: int32_t;

    /**
     * @param commandOrigin it's destructed by the destruction of CommandContext
     */
    constructWith(command: string, commandOrigin: CommandOrigin, version: number = CommandVersion.CurrentVersion): void {
        CommandContext$CommandContext(this, command, CommandOriginWrapper.create(commandOrigin), version);
    }

    /**
     * @param commandOrigin it's destructed by the destruction of CommandContext
     */
    static constructWith(command: string, commandOrigin: CommandOrigin, version?: number): CommandContext {
        const ctx = new CommandContext(true);
        ctx.constructWith(command, commandOrigin, version);
        return ctx;
    }

    /**
     * @deprecated
     * @param commandOrigin it's destructed by the destruction of CommandContext. it should be allocated by malloc
     */
    static constructSharedPtr(command: string, commandOrigin: CommandOrigin, version?: number): CxxSharedPtr<CommandContext> {
        const sharedptr = new CommandContextSharedPtr(true);
        const vftable = proc["??_7?$_Ref_count_obj2@_N@std@@6B@"]; // _Ref_count_obj2<bool>::vftable
        sharedptr.create(vftable);
        sharedptr.p!.constructWith(command, commandOrigin, version);
        return sharedptr;
    }
}

export namespace CommandVersion {
    export const CurrentVersion = proc["?CurrentVersion@CommandVersion@@2HB"].getInt32();
}

const CommandOriginWrapper = Wrapper.make(CommandOrigin.ref());
const CommandContext$CommandContext = procHacker.js(
    "??0CommandContext@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$unique_ptr@VCommandOrigin@@U?$default_delete@VCommandOrigin@@@std@@@2@H@Z",
    void_t,
    null,
    CommandContext,
    CxxString,
    CommandOriginWrapper,
    int32_t,
);
const CommandContextSharedPtr = CxxSharedPtr.make(CommandContext);

export enum CommandOutputType {
    None = 0,
    LastOutput = 1,
    Silent = 2,
    /** @deprecated */
    Type3 = 3,
    AllOutput = 3, // user / server console / command block
    /** @deprecated */
    ScriptEngine = 4,
    DataSet = 4,
}

enum CommandOutputMessageType {
    Success,
    Error,
}

type CommandOutputParameterType = string | boolean | number | Actor | BlockPos | Vec3 | Actor[];

@nativeClass() // 0x40: calculated in CommandOutput::addMessage
class CommandOutputMessage extends NativeClass {
    @nativeField(int32_t)
    type: CommandOutputMessageType;
    @nativeField(CxxString)
    messageId: CxxString;
    @nativeField(CxxVector.make(CxxString))
    params: CxxVector<CxxString>;

    getMessageId(): CxxString {
        abstract();
    }

    getType(): CommandOutputMessageType {
        abstract();
    }

    getParams(): CxxString[] {
        abstract();
    }
}

CommandOutputMessage.prototype.getType = procHacker.js("?getType@CommandOutputMessage@@QEBA?AW4CommandOutputMessageType@@XZ", int32_t, {
    this: CommandOutputMessage,
});
CommandOutputMessage.prototype.getMessageId = procHacker.js(
    "?getMessageId@CommandOutputMessage@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: CommandOutputMessage },
);
CommandOutputMessage.prototype.getParams = procHacker.js(
    "?getParams@CommandOutputMessage@@QEBAAEBV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@XZ",
    CxxVectorToArray.make(CxxString),
    { this: CommandOutputMessage },
);

@nativeClass()
export class CommandOutputParameter extends NativeClass {
    @nativeField(CxxString)
    string: CxxString;
    @nativeField(int32_t)
    count: int32_t;

    /**
     * @deprecated use constructWith to be sure. it has to be destructed.
     */
    static create(input: CommandOutputParameterType, count?: number): CommandOutputParameter {
        return CommandOutputParameter.constructWith(input, count);
    }

    constructWith(input: CommandOutputParameterType, count?: number): void {
        this.construct();
        switch (typeof input) {
            case "string":
                this.string = input;
                this.count = count ?? 0;
                break;
            case "boolean":
                this.string = input.toString();
                this.count = 0;
                break;
            case "number":
                if (Number.isInteger(input)) {
                    this.string = input.toString();
                } else {
                    this.string = input.toFixed(2).toString();
                }
                this.count = 0;
                break;
            case "object":
                if (input instanceof Actor) {
                    this.string = input.getNameTag();
                    this.count = 1;
                } else if (input instanceof BlockPos || input instanceof Vec3) {
                    this.string = `${input.x}, ${input.y}, ${input.z}`;
                    this.count = count ?? 0;
                } else if (Array.isArray(input)) {
                    if (input.length > 0) {
                        if (input[0] instanceof Actor) {
                            this.string = input.map(e => e.getNameTag()).join(", ");
                            this.count = input.length;
                        }
                    }
                }
                break;
            default:
                this.string = "";
                this.count = -1;
        }
    }
    static constructWith(input: CommandOutputParameterType, count?: number): CommandOutputParameter {
        const out = CommandOutputParameter.construct();
        out.constructWith(input, count);
        return out;
    }
}

const CommandOutputParameterVector = CxxVector.make(CommandOutputParameter);

function paramsToVector(params?: CxxVector<CommandOutputParameter> | CommandOutputParameter[] | CommandOutputParameterType[]): CxxVector<CommandOutputParameter> {
    if (params != null) {
        if (params instanceof CxxVector) {
            return params;
        } else if (params.length) {
            const _params = CommandOutputParameterVector.construct();
            _params.reserve(params.length);

            if (params[0] instanceof CommandOutputParameter) {
                for (const param of params as CommandOutputParameter[]) {
                    _params.emplace(param);
                    param.destruct();
                }
            } else {
                for (const param of params as CommandOutputParameterType[]) {
                    _params.prepare().constructWith(param);
                }
            }
            return _params;
        }
    }
    return CommandOutputParameterVector.construct();
}

@nativeClass()
class CommandPropertyBag extends AbstractClass {
    @nativeField(JsonValue, 0x8)
    json: JsonValue;
}

@nativeClass(0x30)
export class CommandOutput extends NativeClass {
    @nativeField(int32_t)
    type: CommandOutputType;
    @nativeField(CommandPropertyBag.ref())
    propertyBag: CommandPropertyBag;
    @nativeField(CxxVector.make(CommandOutputMessage))
    messages: CxxVector<CommandOutputMessage>;

    // @nativeField(int32_t, 0x28)
    // successCount:int32_t;
    getSuccessCount(): number {
        abstract();
    }
    getType(): CommandOutputType {
        abstract();
    }
    /**
     * @deprecated use constructWith, Uniform naming conventions
     */
    constructAs(type: CommandOutputType): void {
        this.constructWith(type);
    }
    constructWith(type: CommandOutputType): void {
        abstract();
    }
    empty(): boolean {
        abstract();
    }
    /**
     * CommandOutput::set<std::string>()
     */
    set_string(key: string, value: string): void {
        abstract();
    }
    /**
     * CommandOutput::set<int>()
     */
    set_int(key: string, value: number): void {
        abstract();
    }
    /**
     * CommandOutput::set<int>()
     */
    set_bool(key: string, value: boolean): void {
        abstract();
    }
    /**
     * CommandOutput::set<float>()
     */
    set_float(key: string, value: number): void {
        abstract();
    }
    /**
     * CommandOutput::set<BlockPos>()
     */
    set_BlockPos(key: string, value: BlockPos): void {
        abstract();
    }
    /**
     * CommandOutput::set<Vec3>()
     */
    set_Vec3(key: string, value: Vec3): void {
        abstract();
    }
    set(key: string, value: string | number | boolean | BlockPos | Vec3): void {
        switch (typeof value) {
            case "string":
                return this.set_string(key, value);
            case "boolean":
                return this.set_bool(key, value);
            case "number":
                if (value === (value | 0)) return this.set_int(key, value);
                else return this.set_float(key, value);
            default:
                if (value instanceof Vec3) {
                    return this.set_Vec3(key, value);
                } else if (value instanceof BlockPos) {
                    return this.set_BlockPos(key, value);
                } else {
                    throw Error("Unexpected");
                }
        }
    }
    protected _successNoMessage(): void {
        abstract();
    }
    protected _success(message: string, params: CxxVector<CommandOutputParameter>): void {
        abstract();
    }

    /**
     * @param params CAUTION! it will destruct the parameters.
     */
    success(message?: string, params?: CommandOutputParameterType[] | CommandOutputParameter[] | CxxVector<CommandOutputParameter>): void {
        if (message === undefined) {
            this._successNoMessage();
        } else {
            const _params = paramsToVector(params);
            this._success(message, _params);
            _params.destruct();
        }
    }
    protected _error(message: string, params: CxxVector<CommandOutputParameter>): void {
        abstract();
    }

    /**
     * @param params CAUTION! it will destruct the parameters.
     */
    error(message: string, params?: CommandOutputParameterType[] | CommandOutputParameter[] | CxxVector<CommandOutputParameter>): void {
        const _params = paramsToVector(params);
        this._error(message, _params);
        _params.destruct();
    }
    protected _addMessage(message: string, params: CxxVector<CommandOutputParameter>, type: CommandOutputMessageType): void {
        abstract();
    }

    /**
     * @param params CAUTION! it will destruct the parameters.
     */
    addMessage(message: string, params: CommandOutputParameterType[] | CommandOutputParameter[] = [], type = CommandOutputMessageType.Success): void {
        const _params = paramsToVector(params);
        this._addMessage(message, _params, type);
        _params.destruct();
    }
    static constructWith(type: CommandOutputType): CommandOutput {
        const output = new CommandOutput(true);
        output.constructWith(type);
        return output;
    }
}

@nativeClass(null)
export class CommandOutputSender extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;

    _toJson(commandOutput: CommandOutput): JsonValue {
        abstract();
    }
    sendToAdmins(origin: CommandOrigin, output: CommandOutput, permission: CommandPermissionLevel): void {
        abstract();
    }
}

@nativeClass(null)
export class MinecraftCommands extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    /**
     * @deprecated use bedrockServer.commandOutputSender
     */
    sender: CommandOutputSender;
    handleOutput(origin: CommandOrigin, output: CommandOutput): void {
        abstract();
    }
    /**
     * @param ctx it's destructed by this function
     * @deprecated old method
     */
    executeCommand(ctx: CxxSharedPtr<CommandContext>, suppressOutput: boolean): MCRESULT;

    executeCommand(ctx: CommandContext, suppressOutput: boolean): MCRESULT;

    executeCommand(ctx: CxxSharedPtr<CommandContext> | CommandContext, suppressOutput: boolean): MCRESULT {
        abstract();
    }
    /**
     * @deprecated use bedrockServer.commandRegistry
     */
    getRegistry(): CommandRegistry {
        abstract();
    }
    // not implemented
    // runCommand(command:HashedString, origin:CommandOrigin, ccVersion:number): void{
    //     abstract();
    // }
    static getOutputType(origin: CommandOrigin): CommandOutputType {
        abstract();
    }
}

export enum CommandParameterDataType {
    NORMAL,
    ENUM,
    SOFT_ENUM,
    POSTFIX,
}

export enum CommandParameterOption {
    None,
    EnumAutocompleteExpansion,
    HasSemanticConstraint,
}

@nativeClass()
export class CommandParameterData extends NativeClass {
    @nativeField(typeid_t)
    tid: typeid_t<CommandRegistry>; // 0x00
    @nativeField(VoidPointer)
    parser: VoidPointer | null; // 0x08, bool (CommandRegistry::*)(void *, CommandRegistry::ParseToken const &, CommandOrigin const &, int, std::string &,std::vector<std::string> &) const;
    @nativeField(CxxString)
    name: CxxString; // 0x10

    /** @deprecated Use {@link enumNameOrPostfix} instead */
    @nativeField(VoidPointer, { ghost: true })
    desc: VoidPointer | null; // 0x30
    @nativeField(VoidPointer)
    enumNameOrPostfix: VoidPointer | null; // 0x30, char*

    /** @deprecated Use {@link enumOrPostfixSymbol} instead */
    @nativeField(int32_t, { ghost: true, offset: 0x48 })
    unk56: int32_t; // 0x38
    @nativeField(int32_t)
    enumOrPostfixSymbol: int32_t; // 0x38

    @nativeField(VoidPointer)
    unk40_string: VoidPointer | null; // 0x40, char*
    @nativeField(int32_t)
    unk48_offset: int32_t; // 0x48

    @nativeField(int32_t)
    type: CommandParameterDataType; // 0x4c
    @nativeField(int32_t)
    offset: int32_t; // 0x50
    @nativeField(int32_t)
    flag_offset: int32_t; // 0x54
    @nativeField(bool_t)
    optional: bool_t; // 0x58

    /** @deprecated Use {@link options} instead */
    @nativeField(bool_t, { ghost: true })
    pad73: bool_t;
    @nativeField(uint8_t)
    options: CommandParameterOption; // 0x59
}

@nativeClass()
export class CommandVFTable extends NativeStruct {
    @nativeField(VoidPointer)
    destructor: VoidPointer;
    @nativeField(VoidPointer)
    collectOptionalArguments: VoidPointer;
    @nativeField(VoidPointer)
    execute: VoidPointer | null;
}

{
    // check command vftable
    const HelpCommand$vftable = proc["??_7HelpCommand@@6B@"];
    bdsxEqualsAssert(HelpCommand$vftable.getPointer(0x00), proc["??_GHelpCommand@@UEAAPEAXI@Z"], "unexpected Command::vftable structure");
    bdsxEqualsAssert(HelpCommand$vftable.getPointer(0x08), proc["?collectOptionalArguments@Command@@MEAA_NXZ"], "unexpected Command::vftable structure");
    bdsxEqualsAssert(
        HelpCommand$vftable.getPointer(0x10),
        proc["?execute@HelpCommand@@UEBAXAEBVCommandOrigin@@AEAVCommandOutput@@@Z"],
        "unexpected Command::vftable structure",
    );
}

export class CommandRegistry extends HasTypeId {
    enumValues: CxxVector<CxxString>;
    enums: CxxVector<CommandRegistry.Enum>;
    enumLookup: CxxMap<CxxString, uint32_t>;
    enumValueLookup: CxxMap<CxxString, uint64_as_float_t>;
    // commandSymbols: CxxVector<CommandRegistry.Symbol>; // no address hint
    signatures: CxxMap<CxxString, CommandRegistry.Signature>;
    softEnums: CxxVector<CommandRegistry.SoftEnum>;
    softEnumLookup: CxxMap<CxxString, uint32_t>;

    registerCommand(
        command: string,
        description: string,
        level: CommandPermissionLevel,
        flag1: CommandCheatFlag | CommandVisibilityFlag,
        flag2: CommandUsageFlag | CommandVisibilityFlag,
    ): void {
        abstract();
    }
    registerAlias(command: string, alias: string): void {
        abstract();
    }

    /**
     * this method will destruct all parameters in params
     */
    registerOverload(name: string, commandClass: { new (): Command }, params: CommandParameterData[]): void {
        const cls = commandClass as NativeClassType<Command>;
        const size = cls[NativeType.size];
        if (!size) throw Error(`${cls.name}: size is not defined`);
        const allocator = makefunc.np(
            (returnval: StaticPointer) => {
                const ptr = capi.malloc(size);
                const cmd = ptr.as(cls);
                cmd.construct();

                returnval.setPointer(cmd);
                return returnval;
            },
            StaticPointer,
            { name: `${name} command::allocator` },
            StaticPointer,
        );

        const sig = this.findCommand(name);
        if (sig === null) throw Error(`${name}: command not found`);
        const overload = sig.overloads.prepare();
        overload.construct();
        overload.commandVersion = bin.make64(1, 0x7fffffff);
        overload.allocator = allocator;
        overload.parameters.setFromArray(params);
        overload.commandVersionOffset = -1;
        overload.u7 = 0;
        this.registerOverloadInternal(sig, overload);

        for (const param of params) {
            param.destruct();
        }
    }

    registerOverloadInternal(signature: CommandRegistry.Signature, overload: CommandRegistry.Overload): void {
        abstract();
    }

    getCommandName(command: string): string {
        abstract();
    }

    findCommand(command: string): CommandRegistry.Signature | null {
        abstract();
    }

    protected _serializeAvailableCommands(pk: AvailableCommandsPacket): AvailableCommandsPacket {
        abstract();
    }

    serializeAvailableCommands(): AvailableCommandsPacket {
        const pk = AvailableCommandsPacket.allocate();
        this._serializeAvailableCommands(pk);
        return pk;
    }

    /**
     * @deprecated use commandParser.get
     */
    static getParser<T>(type: Type<T>): VoidPointer {
        abstract();
    }

    /**
     * @deprecated use commandParser.has
     */
    static hasParser<T>(type: Type<T>): boolean {
        abstract();
    }

    /**
     * @deprecated use commandParser.load
     */
    static loadParser(symbols: CommandSymbols): void {
        abstract();
    }

    /**
     * @deprecated use commandParser.set
     */
    static setParser(type: Type<any>, parserFnPointer: VoidPointer): void {
        abstract();
    }

    /**
     * @deprecated no need to use
     */
    static setEnumParser(parserFnPointer: VoidPointer): void {
        abstract();
    }

    hasEnum(name: string): boolean {
        return this.enumLookup.has(name);
    }

    getEnum(name: string): CommandRegistry.Enum | null {
        const enumIndex = this.enumLookup.get(name);
        if (enumIndex === null) return null;
        return this.enums.get(enumIndex);
    }

    addEnumValues(name: string, values: string[]): number {
        abstract();
    }

    getEnumValues(name: string): string[] | null {
        const values = new Array<string>();
        const _enum = this.getEnum(name);
        if (!_enum) return null;
        for (const { first: valueIndex } of _enum.values) {
            values.push(this.enumValues.get(valueIndex));
        }
        return values;
    }

    hasSoftEnum(name: string): boolean {
        return this.softEnumLookup.has(name);
    }

    getSoftEnum(name: string): CommandRegistry.SoftEnum | null {
        const enumIndex = this.softEnumLookup.get(name);
        if (enumIndex == null) return null;
        return this.softEnums.get(enumIndex);
    }

    addSoftEnum(name: string, values: string[]): number {
        abstract();
    }

    getSoftEnumValues(name: string): string[] | null {
        const _enum = this.getSoftEnum(name);
        if (!_enum) return null;
        return _enum.list.toArray();
    }

    updateSoftEnum(type: SoftEnumUpdateType, name: string, values: string[]): void {
        CommandSoftEnumRegistry$updateSoftEnum(this, type, name, values);
    }
}

export namespace CommandRegistry {
    @nativeClass()
    export class Symbol extends NativeStruct {
        @nativeField(int32_t)
        value: int32_t;
    }

    @nativeClass()
    export class Overload extends NativeClass {
        @nativeField(bin64_t)
        commandVersion: bin64_t;
        @nativeField(VoidPointer)
        allocator: VoidPointer;
        @nativeField(CxxVector.make(CommandParameterData))
        parameters: CxxVector<CommandParameterData>;
        @nativeField(int32_t)
        commandVersionOffset: int32_t;
        /** @deprecated */
        @nativeField(int32_t, 0x28)
        u6: int32_t;
        @nativeField(uint8_t)
        u7: uint8_t;
        @nativeField(CxxVector.make(CommandRegistry.Symbol))
        symbols: CxxVector<CommandRegistry.Symbol>;
    }

    @nativeClass(null)
    export class Signature extends NativeClass {
        @nativeField(CxxString)
        command: CxxString; // 0~20
        @nativeField(CxxString)
        description: CxxString; // 20~40
        @nativeField(CxxVector.make<CommandRegistry.Overload>(CommandRegistry.Overload))
        overloads: CxxVector<Overload>; // 40~58

        // unknown:CxxVector<unknown>; // 58~70

        @nativeField(uint8_t, 0x70)
        permissionLevel: CommandPermissionLevel; // 70~71
        @nativeField(CommandRegistry.Symbol)
        commandSymbol: CommandRegistry.Symbol; // 74~78
        @nativeField(CommandRegistry.Symbol)
        commandAliasEnum: CommandRegistry.Symbol; // 78~7c
        @nativeField(uint16_t)
        flags: CommandCheatFlag | CommandExecuteFlag | CommandSyncFlag | CommandTypeFlag | CommandUsageFlag | CommandVisibilityFlag; // 7c~80
        // int32_t 68~6c
        // int32_t 6c~70
        // int32_t 70~74
        // uint8_t 74~75
        // uint64_t or pointer 78~80
    }

    @nativeClass(null)
    export class ParseToken extends NativeClass {
        @nativeField(StaticPointer, 0x18)
        text: StaticPointer;
        @nativeField(uint32_t)
        length: uint32_t;
        @nativeField(CommandRegistry.Symbol)
        type: CommandRegistry.Symbol;

        getText(): string {
            return this.text.getString().slice(0, this.length);
        }
    }

    @nativeClass()
    export class Enum extends NativeClass {
        @nativeField(CxxString)
        name: CxxString;
        @nativeField(typeid_t)
        tid: typeid_t<CommandRegistry>;
        @nativeField(VoidPointer)
        parser: VoidPointer;
        @nativeField(CxxVector.make(CxxPair.make(uint64_as_float_t, bin64_t)))
        values: CxxVector<CxxPair<uint64_as_float_t, bin64_t>>;
    }

    @nativeClass()
    export class SoftEnum extends NativeClass {
        @nativeField(CxxString)
        name: CxxString;
        @nativeField(CxxVector.make(CxxString))
        list: CxxVector<CxxString>;
    }

    @nativeClass(0xc0)
    export class Parser extends AbstractClass {
        constructWith(registry: CommandRegistry, version: number): void {
            abstract();
        }
        parseCommand(command: string): boolean {
            abstract();
        }
        createCommand(origin: CommandOrigin): Command | null {
            abstract();
        }
        getErrorMessage(): string {
            abstract();
        }
        getErrorParams(): string[] {
            abstract();
        }
        static constructWith(registry: CommandRegistry, version: number): Parser {
            const parser = new Parser(true);
            parser.constructWith(registry, version);
            return parser;
        }
    }
}

@nativeClass()
export class Command extends NativeClass {
    @nativeField(CommandVFTable.ref())
    vftable: CommandVFTable; // 0x00

    /** @deprecated */
    @nativeField(int32_t, { ghost: true })
    u1: int32_t; // 0x08
    @nativeField(int32_t)
    version: int32_t; // 0x08

    /** @deprecated */
    @nativeField(VoidPointer, { ghost: true })
    u2: VoidPointer | null; // 0x10
    @nativeField(CommandRegistry.ref())
    registry: CommandRegistry | null; // 0x10

    /** @deprecated */
    @nativeField(int32_t, { ghost: true })
    u3: int32_t; // 0x18
    @nativeField(int32_t)
    commandSymbol: int32_t; // 0x18

    /** @deprecated */
    @nativeField(int16_t, { ghost: true })
    u4: int16_t; // 0x1c
    @nativeField(uint8_t)
    permissionLevel: uint8_t; // 0x1c

    @nativeField(int16_t)
    flags: int16_t; // 0x1e

    [NativeType.ctor](): void {
        this.vftable = null as any;
        this.version = 0;
        this.registry = null;
        this.commandSymbol = -1;
        this.permissionLevel = 5;
        this.flags = 0;
    }
    [NativeType.dtor](): void {
        abstract();
    }

    run(origin: CommandOrigin, output: CommandOutput): void {
        abstract();
    }

    static mandatory<CMD extends Command, KEY extends keyof CMD, KEY_ISSET extends KeysFilter<CMD, bool_t> | null>(
        this: { new (): CMD },
        key: KEY,
        keyForIsSet: KEY_ISSET,
        enumNameOrPostfix?: string | null,
        type: CommandParameterDataType = CommandParameterDataType.NORMAL,
        name: string = key as string,
        options: CommandParameterOption = CommandParameterOption.None,
    ): CommandParameterData {
        const cmdclass = this as NativeClassType<any>;
        const paramType = cmdclass.typeOf(key as string);
        const offset = cmdclass.offsetOf(key as string);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        return Command.manual(name, paramType, offset, flag_offset, false, enumNameOrPostfix, type, options);
    }
    static optional<CMD extends Command, KEY extends keyof CMD, KEY_ISSET extends KeysFilter<CMD, bool_t> | null>(
        this: { new (): CMD },
        key: KEY,
        keyForIsSet: KEY_ISSET,
        enumNameOrPostfix?: string | null,
        type: CommandParameterDataType = CommandParameterDataType.NORMAL,
        name: string = key as string,
        options: CommandParameterOption = CommandParameterOption.None,
    ): CommandParameterData {
        const cmdclass = this as NativeClassType<any>;
        const paramType = cmdclass.typeOf(key as string);
        const offset = cmdclass.offsetOf(key as string);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        return Command.manual(name, paramType, offset, flag_offset, true, enumNameOrPostfix, type, options);
    }
    static manual(
        name: string,
        paramType: Type<any>,
        offset: number,
        flag_offset: number = -1,
        optional: boolean = false,
        enumNameOrPostfix?: string | null,
        type: CommandParameterDataType = CommandParameterDataType.NORMAL,
        options: CommandParameterOption = CommandParameterOption.None,
    ): CommandParameterData {
        const param = CommandParameterData.construct();
        param.tid.id = type_id(CommandRegistry, paramType).id;
        param.enumNameOrPostfix = null;
        if (paramType instanceof commandparser.CommandMappedValue && paramType.nameUtf8 !== undefined) {
            // a soft enum is a string with autocompletions, for example, objectives in /scoreboard
            if (enumNameOrPostfix != null) throw Error(`CommandEnum does not support postfix`);
            param.enumNameOrPostfix = paramType.nameUtf8;
        } else {
            if (enumNameOrPostfix) {
                if (paramType === int32_t) {
                    type = CommandParameterDataType.POSTFIX;
                    param.enumNameOrPostfix = capi.permaUtf8(enumNameOrPostfix);
                } else {
                    console.error(colors.yellow(`${paramType.name} does not support postfix`));
                }
            }
        }
        param.parser = commandParser.get(paramType);
        param.name = name;
        param.type = type;

        param.unk40_string = null;
        param.unk48_offset = -1;

        param.enumOrPostfixSymbol = -1;
        param.offset = offset;
        param.flag_offset = flag_offset;
        param.optional = optional;
        param.options = options;
        return param;
    }

    static isWildcard<T extends Actor>(selectorBase: CommandSelectorBase<T>): boolean {
        abstract();
    }
}
Command.isWildcard = procHacker.js("?isWildcard@Command@@KA_NAEBVCommandSelectorBase@@@Z", bool_t, null, CommandSelectorBase);

const MobEffectClass = MobEffect;
const ActorDefinitionIdentifierClass = ActorDefinitionIdentifier;

function constptr<T extends NativeClass>(cls: new () => T): CommandParameterNativeType<T> {
    const nativecls = cls as NativeClassType<T>;
    const constptr = Object.create(nativecls.ref());
    constptr.name = nativecls.name + "*";
    constptr.symbol = mangle.constPointer(nativecls.symbol);
    return constptr!;
}

CommandOutput.prototype.getSuccessCount = procHacker.js("?getSuccessCount@CommandOutput@@QEBAHXZ", int32_t, { this: CommandOutput });
CommandOutput.prototype.getType = procHacker.js("?getType@CommandOutput@@QEBA?AW4CommandOutputType@@XZ", int32_t, { this: CommandOutput });
CommandOutput.prototype.constructWith = procHacker.js("??0CommandOutput@@QEAA@W4CommandOutputType@@@Z", void_t, { this: CommandOutput }, int32_t);
CommandOutput.prototype.empty = function () {
    if (this.getType() === CommandOutputType.DataSet) return false;
    const ptr = this as any as StaticPointer;
    return ptr.getPointer(0x10).equalsptr(ptr.getPointer(0x18));
};
CommandOutput.prototype.set_string = procHacker.js(
    "??$set@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@CommandOutput@@QEAAXPEBDV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: CommandOutput },
    makefunc.Utf8,
    CxxString,
);
CommandOutput.prototype.set_int = procHacker.js("??$set@H@CommandOutput@@QEAAXPEBDH@Z", void_t, { this: CommandOutput }, makefunc.Utf8, int32_t);
CommandOutput.prototype.set_bool = procHacker.js("??$set@_N@CommandOutput@@QEAAXPEBD_N@Z", void_t, { this: CommandOutput }, makefunc.Utf8, bool_t);
CommandOutput.prototype.set_float = procHacker.js("??$set@M@CommandOutput@@QEAAXPEBDM@Z", void_t, { this: CommandOutput }, makefunc.Utf8, float32_t);
CommandOutput.prototype.set_BlockPos = procHacker.js(
    "??$set@VBlockPos@@@CommandOutput@@QEAAXPEBDVBlockPos@@@Z",
    void_t,
    { this: CommandOutput },
    makefunc.Utf8,
    BlockPos,
);
CommandOutput.prototype.set_Vec3 = function (k, v) {
    if (this.type !== CommandOutputType.DataSet) return;
    this.propertyBag.json.get(k).setValue({
        x: v.x,
        y: v.y,
        z: v.z,
    });
};

(CommandOutput.prototype as any)._successNoMessage = procHacker.js("?success@CommandOutput@@QEAAXXZ", void_t, { this: CommandOutput });
(CommandOutput.prototype as any)._success = procHacker.js(
    "?success@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z",
    void_t,
    { this: CommandOutput },
    CxxString,
    CommandOutputParameterVector,
);
(CommandOutput.prototype as any)._error = procHacker.js(
    "?error@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z",
    void_t,
    { this: CommandOutput },
    CxxString,
    CommandOutputParameterVector,
);
(CommandOutput.prototype as any)._addMessage = procHacker.js(
    "?addMessage@CommandOutput@@AEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@W4CommandOutputMessageType@@@Z",
    void_t,
    { this: CommandOutput },
    CxxString,
    CommandOutputParameterVector,
    int32_t,
);
CommandOutput.prototype[NativeType.dtor] = procHacker.js("??1CommandOutput@@QEAA@XZ", void_t, { this: CommandOutput });

CommandOutputSender.prototype._toJson = function () {
    return JsonValue.constructWith({ error: "REMOVED FUNCTION" });
};
CommandOutputSender.prototype.sendToAdmins = procHacker.js(
    "?sendToAdmins@CommandOutputSender@@QEAAXAEBVCommandOrigin@@AEBVCommandOutput@@W4CommandPermissionLevel@@@Z",
    void_t,
    { this: MinecraftCommands },
    CommandOrigin,
    CommandOutput,
    int32_t,
);

MinecraftCommands.prototype.handleOutput = procHacker.js(
    "?handleOutput@MinecraftCommands@@QEBAXAEBVCommandOrigin@@AEBVCommandOutput@@@Z",
    void_t,
    { this: MinecraftCommands },
    CommandOrigin,
    CommandOutput,
);
// MinecraftCommands.prototype.executeCommand is defined at bdsx/command.ts
MinecraftCommands.getOutputType = procHacker.js("?getOutputType@MinecraftCommands@@SA?AW4CommandOutputType@@AEBVCommandOrigin@@@Z", int32_t, null, CommandOrigin);

CommandRegistry.abstract({
    enumValues: [CxxVector.make(CxxString), 0xc8],
    enums: [CxxVector.make(CommandRegistry.Enum), 0xe0], // accessed in CommandRegistry::addEnumValuesToExisting
    enumLookup: [CxxMap.make(CxxString, uint32_t), 0x158], // assumed, enumValueLookup-0x10
    enumValueLookup: [CxxMap.make(CxxString, uint64_as_float_t), 0x168], // accessed in CommandRegistry::findEnumValue
    // commandSymbols: [CxxVector.make(CommandRegistry.Symbol), 0x170],
    signatures: [CxxMap.make(CxxString, CommandRegistry.Signature), 0x1b0], // accessed in CommandRegistry::findCommand
    softEnums: [CxxVector.make(CommandRegistry.SoftEnum), 0x230], // accessed in CommandRegistry::addSoftEnum after `call CommandRegistry::addSoftEnumValues`
    softEnumLookup: [CxxMap.make(CxxString, uint32_t), 0x248], // accessed in CommandRegistry::addSoftEnum early part
});
CommandRegistry.prototype.registerOverloadInternal = procHacker.js(
    "?registerOverloadInternal@CommandRegistry@@AEAAXAEAUSignature@1@AEAUOverload@1@@Z",
    void_t,
    { this: CommandRegistry },
    CommandRegistry.Signature,
    CommandRegistry.Overload,
);
CommandRegistry.prototype.registerCommand = procHacker.js(
    "?registerCommand@CommandRegistry@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@PEBDW4CommandPermissionLevel@@UCommandFlag@@3@Z",
    void_t,
    { this: CommandRegistry },
    CxxString,
    makefunc.Utf8,
    int32_t,
    int32_t,
    int32_t,
);
CommandRegistry.prototype.registerAlias = procHacker.js(
    "?registerAlias@CommandRegistry@@QEAAXV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@0@Z",
    void_t,
    { this: CommandRegistry },
    CxxString,
    CxxString,
);
CommandRegistry.prototype.getCommandName = procHacker.js(
    "?getCommandName@CommandRegistry@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV23@@Z",
    CxxString,
    { structureReturn: true, this: CommandRegistry },
    CxxString,
);
CommandRegistry.prototype.findCommand = procHacker.js(
    "?findCommand@CommandRegistry@@AEAAPEAUSignature@1@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    CommandRegistry.Signature,
    { this: CommandRegistry },
    CxxString,
);
CommandRegistry.prototype.addEnumValues = procHacker.js(
    "?addEnumValues@CommandRegistry@@QEAAHAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@3@@Z",
    int32_t,
    { this: CommandRegistry },
    CxxString,
    CxxVectorToArray.make(CxxString),
);
CommandRegistry.prototype.addSoftEnum = procHacker.js(
    "?addSoftEnum@CommandRegistry@@QEAAHAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@3@@Z",
    int32_t,
    { this: CommandRegistry },
    CxxString,
    CxxVectorToArray.make(CxxString),
);
(CommandRegistry.prototype as any)._serializeAvailableCommands = procHacker.js(
    "?serializeAvailableCommands@CommandRegistry@@QEBA?AVAvailableCommandsPacket@@XZ",
    AvailableCommandsPacket,
    { this: CommandRegistry },
    AvailableCommandsPacket,
);
Command.prototype[NativeType.dtor] = vectorDeletingDestructor;

CommandRegistry.Parser.prototype.constructWith = procHacker.js(
    "??0Parser@CommandRegistry@@QEAA@AEBV1@H@Z",
    void_t,
    { this: CommandRegistry.Parser },
    CommandRegistry,
    int32_t,
);
CommandRegistry.Parser.prototype[NativeType.dtor] = procHacker.js("??1Parser@CommandRegistry@@QEAA@XZ", void_t, { this: CommandRegistry.Parser });
CommandRegistry.Parser.prototype.parseCommand = procHacker.js(
    "?parseCommand@Parser@CommandRegistry@@QEAA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    bool_t,
    { this: CommandRegistry.Parser },
    CxxString,
);
CommandRegistry.Parser.prototype.createCommand = procHacker.js(
    "?createCommand@Parser@CommandRegistry@@QEAA?AV?$unique_ptr@VCommand@@U?$default_delete@VCommand@@@std@@@std@@AEBVCommandOrigin@@@Z",
    Command.ref(),
    { this: CommandRegistry.Parser, structureReturn: true },
    CommandOrigin,
);
CommandRegistry.Parser.prototype.getErrorMessage = procHacker.js(
    "?getErrorMessage@Parser@CommandRegistry@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: CommandRegistry.Parser },
);
CommandRegistry.Parser.prototype.getErrorParams = procHacker.js(
    "?getErrorParams@Parser@CommandRegistry@@QEBA?AV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@XZ",
    CxxVectorToArray.make(CxxString),
    { this: CommandRegistry.Parser, structureReturn: true },
);

Command.prototype.run = procHacker.js("?run@Command@@QEBAXAEBVCommandOrigin@@AEAVCommandOutput@@@Z", void_t, { this: Command }, CommandOrigin, CommandOutput);

// CommandSoftEnumRegistry is a class with only one field, which is a pointer to CommandRegistry.
// I can only find one member function so I am not sure if a dedicated class is needed.
const CommandSoftEnumRegistry$updateSoftEnum = procHacker.js(
    "?updateSoftEnum@CommandSoftEnumRegistry@@QEAAXW4SoftEnumUpdateType@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z",
    void_t,
    null,
    CommandRegistry.ref().ref(),
    uint8_t,
    CxxString,
    CxxVectorToArray.make(CxxString),
);

// list for not implemented
("CommandRegistry::parse<AutomaticID<Dimension,int> >"); // CommandRegistry::parse<DimensionId>
("CommandRegistry::parse<std::unique_ptr<Command,struct std::default_delete<Command> > >");
("CommandRegistry::parse<AgentCommand::Mode>");
("CommandRegistry::parse<AgentCommands::CollectCommand::CollectionSpecification>");
("CommandRegistry::parse<AgentCommands::Direction>");
("CommandRegistry::parse<AnimationMode>");
("CommandRegistry::parse<AreaType>");
("CommandRegistry::parse<BlockSlot>");
("CommandRegistry::parse<CodeBuilderCommand::Action>");
("CommandRegistry::parse<CommandOperator>");
("CommandRegistry::parse<Enchant::Type>");
("CommandRegistry::parse<EquipmentSlot>");
("CommandRegistry::parse<GameType>");
("CommandRegistry::parse<Mirror>");
("CommandRegistry::parse<ObjectiveSortOrder>");
("CommandRegistry::parse<Rotation>");

const commandenumImport = require("../commandenum") as typeof commandenum;

/** @deprecated import it from bdsx/command */
export const CommandMappedValue = commandparser.CommandMappedValue;
/** @deprecated import it from bdsx/command */
export type CommandMappedValue<BaseType, NewType = BaseType> = commandparser.CommandMappedValue<BaseType, NewType>;

/** @deprecated import it from bdsx/command */
export const CommandEnum = commandenumImport.CommandEnum;
/** @deprecated import it from bdsx/command */
export type CommandEnum<V> = commandenum.CommandEnum<V>;

/** @deprecated import it from bdsx/command */
export const CommandRawEnum = commandenumImport.CommandRawEnum;
/** @deprecated import it from bdsx/command */
export type CommandRawEnum = commandenum.CommandRawEnum;

/** @deprecated import it from bdsx/command */
export const CommandStringEnum = commandenumImport.CommandStringEnum;
/** @deprecated import it from bdsx/command */
export type CommandStringEnum<T extends string[]> = commandenum.CommandStringEnum<T>;

/** @deprecated import it from bdsx/command */
export const CommandIndexEnum = commandenumImport.CommandIndexEnum;
/** @deprecated import it from bdsx/command */
export type CommandIndexEnum<T extends number | string> = commandenum.CommandIndexEnum<T>;

/** @deprecated import it from bdsx/command */
export const CommandSoftEnum = commandenumImport.CommandSoftEnum;
/** @deprecated import it from bdsx/command */
export type CommandSoftEnum = commandenum.CommandSoftEnum;

class CommandBlockEnum extends CommandEnum<Block> {
    constructor() {
        super("Block");
    }
    mapValue(value: commandenum.EnumResult): Block {
        return Block.create(value.token)!;
    }
}

export namespace Command {
    export const VFTable = CommandVFTable;
    export type VFTable = CommandVFTable;

    export const Block = new CommandBlockEnum();
    export const MobEffect = constptr(MobEffectClass);
    export const ActorDefinitionIdentifier = constptr(ActorDefinitionIdentifierClass);
}

/** @deprecated use Command.Block */
export const CommandBlock = Command.Block;
/** @deprecated use Command.MobEffect */
export const CommandMobEffect = Command.MobEffect;
