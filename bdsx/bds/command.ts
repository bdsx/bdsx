import { asm } from "../assembler";
import { bin } from "../bin";
import { capi } from "../capi";
import { abstract } from "../common";
import { NativePointer, pdb, StaticPointer, VoidPointer } from "../core";
import { CxxMap } from "../cxxmap";
import { CxxVector } from "../cxxvector";
import { SYMOPT_PUBLICS_ONLY, UNDNAME_NAME_ONLY } from "../dbghelp";
import { makefunc } from "../makefunc";
import { KeysFilter, nativeClass, NativeClass, NativeClassType, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, NativeType, Type, uint32_t, void_t } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { Singleton } from "../singleton";
import { templateName } from "../templatename";
import { getEnumKeys } from "../util";
import { Actor } from "./actor";
import { BlockPos, RelativeFloat, Vec3 } from "./blockpos";
import { CommandOrigin } from "./commandorigin";
import { JsonValue } from "./connreq";
import { ItemStack } from "./inventory";
import { AvailableCommandsPacket } from "./packets";
import { Player } from "./player";
import { procHacker } from "./proc";
import { serverInstance } from "./server";
import { HasTypeId, typeid_t, type_id } from "./typeid";

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
    _Unknown=0x80,
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

@nativeClass()
export class MCRESULT extends NativeClass {
    @nativeField(uint32_t)
    result:uint32_t;
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

/**
 * @deprecated Use `ActorCommandSelector` instead
 */
@nativeClass(0xc0)
export class CommandSelectorBase extends NativeClass {
    private _newResults(origin:CommandOrigin):SharedPtr<CxxVector<Actor>> {
        abstract();
    }
    newResults<T extends Actor>(origin:CommandOrigin, typeFilter?:new(...args:any[])=>T):T[] {
        const list = this._newResults(origin);
        if (typeFilter != null) {
            const out:T[] = [];
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
}
/** @param args_1 forcePlayer */
const CommandSelectorBaseCtor = procHacker.js('CommandSelectorBase::CommandSelectorBase', void_t, null, CommandSelectorBase, bool_t);
CommandSelectorBase.prototype[NativeType.dtor] = procHacker.js('CommandSelectorBase::~CommandSelectorBase', void_t, {this:CommandSelectorBase});
(CommandSelectorBase.prototype as any)._newResults = procHacker.js('CommandSelectorBase::newResults', SharedPtr.make(CxxVector.make(Actor.ref())), {this:CommandSelectorBase, structureReturn: true}, CommandOrigin);

/**
 * @deprecated Use `ActorWildcardCommandSelector` instead
 */
@nativeClass()
export class WildcardCommandSelector<T> extends CommandSelectorBase {

    static make<T>(type:Type<T>):NativeClassType<WildcardCommandSelector<T>> {
        return Singleton.newInstance(WildcardCommandSelector, type, ()=>{
            class WildcardCommandSelectorImpl extends WildcardCommandSelector<T> {
            }
            Object.defineProperty(WildcardCommandSelectorImpl, 'name', {value: templateName('WildcardCommandSelector', type.name)});
            WildcardCommandSelectorImpl.define({});

            return WildcardCommandSelectorImpl;
        });
    }
}
export const ActorWildcardCommandSelector = WildcardCommandSelector.make(Actor);
ActorWildcardCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};
export class PlayerWildcardCommandSelector extends ActorWildcardCommandSelector {
    [NativeType.ctor]():void {
        CommandSelectorBaseCtor(this, true);
    }
}

/**
 * @deprecated Use `ActorCommandSelector` instead
 */
@nativeClass()
export class CommandSelector<T> extends CommandSelectorBase {

    static make<T>(type:Type<T>):NativeClassType<CommandSelector<T>> {
        return Singleton.newInstance(CommandSelector, type, ()=>{
            class CommandSelectorImpl extends CommandSelector<T> {
            }
            Object.defineProperty(CommandSelectorImpl, 'name', {value: templateName('CommandSelector', type.name)});
            CommandSelectorImpl.define({});

            return CommandSelectorImpl;
        });
    }
}
export const ActorCommandSelector = CommandSelector.make(Actor);
ActorCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};
export const PlayerCommandSelector = CommandSelector.make(Player);
PlayerCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, true);
};

@nativeClass()
export class CommandFilePath extends NativeClass {
    @nativeField(CxxString)
    text:CxxString;
}

@nativeClass()
class CommandIntegerRange extends NativeClass { // Not exporting yet, not supported
    @nativeField(int32_t)
    min:int32_t;
    @nativeField(int32_t)
    max:int32_t;
    @nativeField(bool_t)
    inverted:bool_t;
}

@nativeClass()
export class CommandItem extends NativeClass {
    @nativeField(int32_t)
    version:int32_t;
    @nativeField(int32_t)
    id:int32_t;

    createInstance(count:number):ItemStack {
        abstract();
    }
}

CommandItem.prototype.createInstance = procHacker.js('CommandItem::createInstance', ItemStack, {this:CommandItem, structureReturn:true}, int32_t);

export class CommandMessage extends NativeClass {
    data:CxxVector<CommandMessage.MessageComponent>;

    getMessage(origin:CommandOrigin):string {
        abstract();
    }
}

export namespace CommandMessage {

    @nativeClass(0x28)
    export class MessageComponent extends NativeClass {
        @nativeField(CxxString)
        string:CxxString;
        @nativeField(ActorCommandSelector.ref())
        selection:WildcardCommandSelector<Actor>;
    }
}

CommandMessage.abstract({
    data: CxxVector.make(CommandMessage.MessageComponent),
}, 0x18);
CommandMessage.prototype.getMessage = procHacker.js('CommandMessage::getMessage', CxxString, {this:CommandMessage, structureReturn:true}, CommandOrigin);

@nativeClass()
export class CommandPosition extends NativeClass {
    @nativeField(float32_t)
    x:float32_t;
    @nativeField(float32_t)
    y:float32_t;
    @nativeField(float32_t)
    z:float32_t;
    @nativeField(bool_t)
    isXRelative:bool_t;
    @nativeField(bool_t)
    isYRelative:bool_t;
    @nativeField(bool_t)
    isZRelative:bool_t;
    @nativeField(bool_t)
    local:bool_t;

    getPosition(origin: CommandOrigin, offsetFromBase: Vec3): Vec3 {
        abstract();
    }
    getBlockPosition(origin: CommandOrigin, offsetFromBase: Vec3): BlockPos {
        abstract();
    }
}
CommandPosition.prototype.getPosition = procHacker.js("?getPosition@CommandPosition@@QEBA?AVVec3@@AEBVCommandOrigin@@AEBV2@@Z", Vec3, { this:CommandPosition,structureReturn:true }, CommandOrigin, Vec3);
CommandPosition.prototype.getBlockPosition = procHacker.js("?getBlockPos@CommandPosition@@QEBA?AVBlockPos@@AEBVCommandOrigin@@AEBVVec3@@@Z", BlockPos, { this:CommandPosition,structureReturn:true }, CommandOrigin, Vec3);

export class CommandPositionFloat extends CommandPosition {
}

@nativeClass()
export class CommandRawText extends NativeClass {
    @nativeField(CxxString)
    text:CxxString;
}

@nativeClass()
export class CommandWildcardInt extends NativeClass {
    @nativeField(bool_t)
    isWildcard:bool_t;
    @nativeField(int32_t)
    value:int32_t;
}

@nativeClass(0x30)
export class CommandContext extends NativeClass {
    @nativeField(CxxString)
    command:CxxString;
    @nativeField(CommandOrigin.ref())
    origin:CommandOrigin;
}

export enum CommandOutputType {
    None = 0,
    LastOutput = 1,
    Silent = 2,
    Type3 = 3, // user / server console / command block
    ScriptEngine = 4,
}

type CommandOutputParameterType = string|boolean|number|Actor|BlockPos|Vec3|Actor[];

@nativeClass(0x28)
export class CommandOutputParameter extends NativeClass {
    @nativeField(CxxString)
    string:CxxString;
    @nativeField(int32_t)
    count:int32_t;
    static create(input:CommandOutputParameterType, count?:number):CommandOutputParameter {
        const out = CommandOutputParameter.construct();
        switch (typeof input) {
        case 'string':
            out.string = input;
            out.count = count ?? 0;
            break;
        case 'boolean':
            out.string = input.toString();
            out.count = 0;
            break;
        case 'number':
            if (Number.isInteger(input)) {
                out.string = input.toString();
            } else {
                out.string = input.toFixed(2).toString();
            }
            out.count = 0;
            break;
        case 'object':
            if (input instanceof Actor) {
                out.string = input.getName();
                out.count = 1;
            } else if (input instanceof BlockPos || input instanceof Vec3) {
                out.string = `${input.x}, ${input.y}, ${input.z}`;
                out.count = count ?? 0;
            } else if (Array.isArray(input)) {
                if (input.length > 0) {
                    if (input[0] instanceof Actor) {
                        out.string = input.map(e => e.getName()).join(', ');
                        out.count = input.length;
                    }
                }
            }
            break;
        default:
            out.string = '';
            out.count = -1;
        }
        return out;
    }
}

@nativeClass(0x30)
export class CommandOutput extends NativeClass {
    getType():CommandOutputType {
        abstract();
    }
    constructAs(type:CommandOutputType):void {
        abstract();
    }
    protected _successNoMessage():void {
        abstract();
    }
    protected _success(message:string, params:CxxVector<CommandOutputParameter>):void {
        abstract();
    }
    success(message?:string, params:CommandOutputParameterType[]|CommandOutputParameter[] = []):void {
        if (message === undefined) {
            this._successNoMessage();
        } else {
            const _params = (CxxVector.make(CommandOutputParameter)).construct();
            if (params.length > 0) {
                if (params[0] instanceof CommandOutputParameter) {
                    for (const param of params as CommandOutputParameter[]) {
                        _params.push(param);
                        param.destruct();
                    }
                } else {
                    for (const param of params as CommandOutputParameterType[]) {
                        const _param = CommandOutputParameter.create(param);
                        _params.push(_param);
                        _param.destruct();
                    }
                }
            }
            this._success(message, _params);
            _params.destruct();
        }
    }
    protected _error(message:string, params:CxxVector<CommandOutputParameter>):void {
        abstract();
    }
    error(message:string, params:CommandOutputParameterType[]|CommandOutputParameter[] = []):void {
        const _params = (CxxVector.make(CommandOutputParameter)).construct();
        if (params.length > 0) {
            if (params[0] instanceof CommandOutputParameter) {
                for (const param of params as CommandOutputParameter[]) {
                    _params.push(param);
                    param.destruct();
                }
            } else {
                for (const param of params as CommandOutputParameterType[]) {
                    const _param = CommandOutputParameter.create(param);
                    _params.push(_param);
                    _param.destruct();
                }
            }
        }
        this._error(message, _params);
        _params.destruct();
    }
}

@nativeClass(null)
export class CommandOutputSender extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
}

@nativeClass(null)
export class MinecraftCommands extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(CommandOutputSender.ref())
    sender:CommandOutputSender;
    handleOutput(origin:CommandOrigin, output:CommandOutput):void {
        abstract();
    }
    executeCommand(ctx:SharedPtr<CommandContext>, suppressOutput:boolean):MCRESULT {
        abstract();
    }
    getRegistry():CommandRegistry {
        abstract();
    }
}

export enum CommandParameterDataType { NORMAL, ENUM, SOFT_ENUM, POSTFIX }

const parsers = new Map<Type<any>, VoidPointer>();
let enumParser:VoidPointer;

@nativeClass()
export class CommandParameterData extends NativeClass {
    @nativeField(typeid_t)
    tid:typeid_t<CommandRegistry>;
    @nativeField(VoidPointer)
    parser:VoidPointer; // bool (CommandRegistry::*)(void *, CommandRegistry::ParseToken const &, CommandOrigin const &, int, std::string &,std::vector<std::string> &) const;
    @nativeField(CxxString)
    name:CxxString;
    @nativeField(VoidPointer)
    desc:VoidPointer|null; // char*
    @nativeField(int32_t)
    unk56:int32_t;
    @nativeField(int32_t)
    type:CommandParameterDataType;
    @nativeField(int32_t)
    offset:int32_t;
    @nativeField(int32_t)
    flag_offset:int32_t;
    @nativeField(bool_t)
    optional:bool_t;
    @nativeField(bool_t)
    pad73:bool_t;
}

@nativeClass()
export class CommandVFTable extends NativeClass {
    @nativeField(VoidPointer)
    destructor:VoidPointer;
    @nativeField(VoidPointer)
    execute:VoidPointer|null;
}

export class CommandEnum<V extends string|number|symbol> extends NativeType<string> {
    public readonly mapper = new Map<string, V>();

    constructor(symbol:string, name?:string) {
        super(symbol, name || symbol,
            CxxString[NativeType.size],
            CxxString[NativeType.align],
            CxxString.isTypeOf,
            CxxString.isTypeOfWeak,
            CxxString[NativeType.getter],
            CxxString[NativeType.setter],
            CxxString[makefunc.getFromParam],
            CxxString[makefunc.setToParam],
            CxxString[NativeType.ctor],
            CxxString[NativeType.dtor],
            CxxString[NativeType.ctor_copy],
            CxxString[NativeType.ctor_move]);
    }

    protected _init():void {
        for (const value of this.mapper.keys()) {
            if (value === "") throw Error(`${value}: enum value cannot be empty`); // It will be ignored by CommandRegistry::addEnumValues if it is empty

            /*
                Allowed special characters:
                - (
                - )
                - -
                - .
                - ?
                - _
                and the ones whose ascii code is bigger than 127, like §, ©, etc.
            */
            const regex = /[ -'*-,/:->@[-^`{-~]/g;
            let invalidCharacters = '';
            let matched:RegExpExecArray|null;
            while ((matched = regex.exec(value)) !== null) {
                invalidCharacters += matched[0];
            }
            if (invalidCharacters !== '') throw Error(`${value}: enum value contains invalid characters (${invalidCharacters})`);
        }

        const registry = serverInstance.minecraft.getCommands().getRegistry();
        const enumId = registry.addEnumValues(this.name, [...this.mapper.keys()]);
        type_id.register(CommandRegistry, this, enumId);
    }
}

export class CommandStringEnum<T extends string[]> extends CommandEnum<T[number]> {
    public readonly values:T;

    constructor(name:string, ...values:T) {
        super(name);
        this.values = values;

        for (const value of values) {
            const lower = value.toLocaleLowerCase();
            if (this.mapper.has(lower)) {
                throw Error(`${value}: enum value duplicated`);
            }
            this.mapper.set(lower, value);
        }
        this._init();
    }
}

export class CommandIndexEnum<T extends number|string> extends CommandEnum<T> {
    public readonly enum:Record<string, T>;
    constructor(name:string, enumType:Record<string, T>) {
        super(name);
        this.enum = enumType;

        for (const key of getEnumKeys(enumType)) {
            const lower = key.toLocaleLowerCase();
            if (this.mapper.has(lower)) {
                throw Error(`${key}: enum value duplicated`);
            }
            this.mapper.set(lower, enumType[key]);
        }
        this._init();
    }
}

@nativeClass()
export class Command extends NativeClass {
    @nativeField(CommandVFTable.ref())
    vftable:CommandVFTable; // 0x00
    @nativeField(int32_t)
    u1:int32_t; // 0x08
    @nativeField(VoidPointer)
    u2:VoidPointer|null; // 0x10
    @nativeField(int32_t)
    u3:int32_t; // 0x18
    @nativeField(int16_t)
    u4:int16_t; // 0x1c

    [NativeType.ctor]():void {
        this.vftable = null as any;
        this.u3 = -1;
        this.u1 = 0;
        this.u2 = null;
        this.u4 = 5;
    }

    static mandatory<CMD extends Command,
        KEY extends keyof CMD,
        KEY_ISSET extends KeysFilter<CMD, bool_t>|null>(
        this:{new():CMD},
        key:KEY,
        keyForIsSet:KEY_ISSET,
        desc?:string|null,
        type:CommandParameterDataType = CommandParameterDataType.NORMAL,
        name:string = key as string):CommandParameterData {
        const cmdclass = this as NativeClassType<any>;
        const paramType = cmdclass.typeOf(key as string);
        const offset = cmdclass.offsetOf(key as string);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        return Command.manual(name, paramType, offset, flag_offset, false, desc, type);
    }
    static optional<CMD extends Command,
        KEY extends keyof CMD,
        KEY_ISSET extends KeysFilter<CMD, bool_t>|null>(
        this:{new():CMD},
        key:KEY,
        keyForIsSet:KEY_ISSET,
        desc?:string|null,
        type:CommandParameterDataType = CommandParameterDataType.NORMAL,
        name:string = key as string):CommandParameterData {
        const cmdclass = this as NativeClassType<any>;
        const paramType = cmdclass.typeOf(key as string);
        const offset = cmdclass.offsetOf(key as string);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        return Command.manual(name, paramType, offset, flag_offset, true, desc, type);
    }
    static manual(
        name:string,
        paramType:Type<any>,
        offset:number,
        flag_offset:number = -1,
        optional:boolean = false,
        desc?:string|null,
        type:CommandParameterDataType = CommandParameterDataType.NORMAL):CommandParameterData {
        const param = CommandParameterData.construct();
        param.tid.id = type_id(CommandRegistry, paramType).id;
        if (paramType instanceof CommandEnum) {
            if (desc != null) {
                throw Error(`CommandEnum does not support description`);
            }
            desc = paramType.name;
            param.parser = enumParser;
        } else {
            param.parser = CommandRegistry.getParser(paramType);
        }
        param.name = name;
        param.type = type;
        if (desc != null) {
            const ptr = new NativePointer;
            ptr.setAddressFromBuffer(asm.const_str(desc));
            param.desc = ptr;
        } else {
            param.desc = null;
        }

        param.unk56 = -1;
        param.offset = offset;
        param.flag_offset = flag_offset;
        param.optional = optional;
        param.pad73 = false;
        return param;
    }
}

export namespace Command {
    export const VFTable = CommandVFTable;
    export type VFTable = CommandVFTable;
}

export class CommandRegistry extends HasTypeId {
    signatures:CxxMap<CxxString, CommandRegistry.Signature>;

    registerCommand(command:string, description:string, level:CommandPermissionLevel, flag1:CommandCheatFlag|CommandVisibilityFlag, flag2:CommandUsageFlag|CommandVisibilityFlag):void {
        abstract();
    }
    registerAlias(command:string, alias:string):void {
        abstract();
    }

    /**
     * this method will destruct all parameters in params
     */
    registerOverload(name:string, commandClass:{new():Command}, params:CommandParameterData[]):void {
        const cls = commandClass as NativeClassType<Command>;
        const size = cls[NativeType.size];
        if (!size) throw Error(`${cls.name}: size is not defined`);
        const allocator = makefunc.np((returnval:StaticPointer)=>{
            const ptr = capi.malloc(size);
            const cmd = ptr.as(cls);
            cmd.construct();

            returnval.setPointer(cmd);
            return returnval;
        }, StaticPointer, {name: `${name} command::allocator`}, StaticPointer);

        const sig = this.findCommand(name);
        if (sig === null) throw Error(`${name}: command not found`);

        const overload = CommandRegistry.Overload.construct();
        overload.commandVersion = bin.make64(1, 0x7fffffff);
        overload.allocator = allocator;
        overload.parameters.setFromArray(params);
        overload.commandVersionOffset = -1;
        sig.overloads.push(overload);
        this.registerOverloadInternal(sig, sig.overloads.back()!);
        overload.destruct();

        for (const param of params) {
            param.destruct();
        }
    }

    registerOverloadInternal(signature:CommandRegistry.Signature, overload: CommandRegistry.Overload):void{
        abstract();
    }

    findCommand(command:string):CommandRegistry.Signature|null {
        abstract();
    }

    protected _serializeAvailableCommands(pk:AvailableCommandsPacket):AvailableCommandsPacket {
        abstract();
    }

    serializeAvailableCommands():AvailableCommandsPacket {
        const pk = AvailableCommandsPacket.create();
        this._serializeAvailableCommands(pk);
        return pk;
    }

    static getParser<T>(type:Type<T>):VoidPointer {
        const parser = parsers.get(type);
        if (parser != null) return parser;
        throw Error(`${type.name} parser not found`);
    }

    static hasParser<T>(type:Type<T>):boolean {
        if (type instanceof CommandEnum) return true;
        return parsers.has(type);
    }

    _addEnumValues(name:CxxString, values:CxxVector<CxxString>):number {
        abstract();
    }

    addEnumValues(name:string, values:string[]):number {
        const _values = CxxVector.make(CxxString).construct();
        _values.setFromArray(values);
        const ret = this._addEnumValues(name, _values);
        _values.destruct();
        return ret;
    }
}

export namespace CommandRegistry {
    @nativeClass()
    export class Symbol extends NativeClass {
        @nativeField(int32_t)
        value:int32_t;
    }

    @nativeClass(0x48)
    export class Overload extends NativeClass {
        @nativeField(bin64_t)
        commandVersion:bin64_t;
        @nativeField(VoidPointer)
        allocator:VoidPointer;
        @nativeField(CxxVector.make(CommandParameterData))
        parameters:CxxVector<CommandParameterData>;
        @nativeField(int32_t)
        commandVersionOffset:int32_t;
        /** @deprecated */
        @nativeField(int32_t, 0x28)
        u6:int32_t;
        @nativeField(CxxVector.make(CommandRegistry.Symbol))
        symbols:CxxVector<CommandRegistry.Symbol>;
    }

    @nativeClass(null)
    export class Signature extends NativeClass {
        @nativeField(CxxString)
        command:CxxString;
        @nativeField(CxxString)
        description:CxxString;
        @nativeField(CxxVector.make<CommandRegistry.Overload>(CommandRegistry.Overload))
        overloads:CxxVector<Overload>;
        @nativeField(int32_t)
        permissionLevel:CommandPermissionLevel;
        @nativeField(CommandRegistry.Symbol)
        commandSymbol:CommandRegistry.Symbol;
        @nativeField(CommandRegistry.Symbol)
        commandAliasEnum:CommandRegistry.Symbol;
        @nativeField(int32_t)
        flags:CommandCheatFlag|CommandExecuteFlag|CommandSyncFlag|CommandTypeFlag|CommandUsageFlag|CommandVisibilityFlag;
    }

    @nativeClass(null)
    export class ParseToken extends NativeClass {
    }
}

function loadParserFromPdb(types:Type<any>[]):void {
    const symbols = types.map(type=>templateName('CommandRegistry::parse', type.symbol || type.name));
    const enumParserSymbol = 'CommandRegistry::parseEnum<int,CommandRegistry::DefaultIdConverter<int> >';
    symbols.push(enumParserSymbol);

    pdb.setOptions(SYMOPT_PUBLICS_ONLY); // XXX: CommandRegistry::parse<bool> does not found without it.
    const addrs = pdb.getList(pdb.coreCachePath, {}, symbols, false, UNDNAME_NAME_ONLY);
    pdb.setOptions(0);

    for (let i=0;i<symbols.length;i++) {
        const addr = addrs[symbols[i]];
        if (addr == null) continue;
        parsers.set(types[i], addr);
    }

    enumParser = addrs[enumParserSymbol];
}

const types = [
    int32_t,
    float32_t,
    bool_t,
    CxxString,
    ActorWildcardCommandSelector,
    ActorCommandSelector,
    PlayerCommandSelector,
    RelativeFloat,
    CommandFilePath,
    // CommandIntegerRange,
    CommandItem,
    CommandMessage,
    CommandPosition,
    CommandPositionFloat,
    CommandRawText,
    CommandWildcardInt,
    JsonValue,
];
type_id.pdbimport(CommandRegistry, types);
loadParserFromPdb(types);
type_id.clone(CommandRegistry, ActorWildcardCommandSelector, PlayerWildcardCommandSelector);
parsers.set(PlayerWildcardCommandSelector, parsers.get(ActorWildcardCommandSelector)!);

CommandOutput.prototype.getType = procHacker.js('CommandOutput::getType', int32_t, {this:CommandOutput});
CommandOutput.prototype.constructAs = procHacker.js('??0CommandOutput@@QEAA@W4CommandOutputType@@@Z', void_t, {this:CommandOutput}, int32_t);
(CommandOutput.prototype as any)._successNoMessage = procHacker.js('?success@CommandOutput@@QEAAXXZ', void_t, {this:CommandOutput});
(CommandOutput.prototype as any)._success = procHacker.js('?success@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z', void_t, {this:CommandOutput}, CxxString, CxxVector.make(CommandOutputParameter));
(CommandOutput.prototype as any)._error = procHacker.js('?error@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z', void_t, {this:CommandOutput}, CxxString, CxxVector.make(CommandOutputParameter));

MinecraftCommands.prototype.handleOutput = procHacker.js('MinecraftCommands::handleOutput', void_t, {this:MinecraftCommands}, CommandOrigin, CommandOutput);
// MinecraftCommands.prototype.executeCommand is defined at bdsx/command.ts
MinecraftCommands.prototype.getRegistry = procHacker.js('MinecraftCommands::getRegistry', CommandRegistry, {this:MinecraftCommands});

CommandRegistry.abstract({
    signatures: [CxxMap.make(CxxString, CommandRegistry.Signature), 344], // accessed in CommandRegistry::findCommand
});
CommandRegistry.prototype.registerOverloadInternal = procHacker.js('CommandRegistry::registerOverloadInternal', void_t, {this:CommandRegistry}, CommandRegistry.Signature, CommandRegistry.Overload);
CommandRegistry.prototype.registerCommand = procHacker.js("CommandRegistry::registerCommand", void_t, {this:CommandRegistry}, CxxString, makefunc.Utf8, int32_t, int32_t, int32_t);
CommandRegistry.prototype.registerAlias = procHacker.js("CommandRegistry::registerAlias", void_t, {this:CommandRegistry}, CxxString, CxxString);
CommandRegistry.prototype.findCommand = procHacker.js("CommandRegistry::findCommand", CommandRegistry.Signature, {this:CommandRegistry}, CxxString);
CommandRegistry.prototype._addEnumValues = procHacker.js("?addEnumValues@CommandRegistry@@QEAAHAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@3@@Z", int32_t, {this:CommandRegistry}, CxxString, CxxVector.make(CxxString));
(CommandRegistry.prototype as any)._serializeAvailableCommands = procHacker.js("CommandRegistry::serializeAvailableCommands", AvailableCommandsPacket, {this:CommandRegistry}, AvailableCommandsPacket);

'CommandRegistry::parse<AutomaticID<Dimension,int> >';
'CommandRegistry::parse<Block const * __ptr64>';
'CommandRegistry::parse<CommandFilePath>';
'CommandRegistry::parse<CommandIntegerRange>'; // Not supported yet(?) there is no type id for it
'CommandRegistry::parse<CommandItem>';
'CommandRegistry::parse<CommandMessage>';
'CommandRegistry::parse<CommandPosition>';
'CommandRegistry::parse<CommandPositionFloat>';
'CommandRegistry::parse<CommandRawText>';
'CommandRegistry::parse<CommandSelector<Actor> >';
'CommandRegistry::parse<CommandSelector<Player> >';
'CommandRegistry::parse<CommandWildcardInt>';
'CommandRegistry::parse<Json::Value>';
'CommandRegistry::parse<MobEffect const * __ptr64>';
'CommandRegistry::parse<std::basic_string<char,struct std::char_traits<char>,class std::allocator<char> > >';
'CommandRegistry::parse<std::unique_ptr<Command,struct std::default_delete<Command> > >';
'CommandRegistry::parse<AgentCommand::Mode>';
'CommandRegistry::parse<AgentCommands::CollectCommand::CollectionSpecification>';
'CommandRegistry::parse<AgentCommands::Direction>';
'CommandRegistry::parse<AnimationMode>';
'CommandRegistry::parse<AreaType>';
'CommandRegistry::parse<BlockSlot>';
'CommandRegistry::parse<CodeBuilderCommand::Action>';
'CommandRegistry::parse<CommandOperator>';
'CommandRegistry::parse<Enchant::Type>';
'CommandRegistry::parse<EquipmentSlot>';
'CommandRegistry::parse<GameType>';
'CommandRegistry::parse<Mirror>';
'CommandRegistry::parse<ObjectiveSortOrder>';
'CommandRegistry::parse<Rotation>';
'CommandRegistry::parse<ActorDefinitionIdentifier const * __ptr64>';
