import * as colors from "colors";
import { bin } from "../bin";
import { capi } from "../capi";
import { CommandParameterType } from "../commandparam";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { CxxMap } from "../cxxmap";
import { CxxPair } from "../cxxpair";
import { CxxVector, CxxVectorToArray } from "../cxxvector";
import { bedrockServer } from "../launcher";
import { makefunc } from "../makefunc";
import { mangle } from "../mangle";
import { AbstractClass, KeysFilter, nativeClass, NativeClass, NativeClassType, nativeField, NativeStruct, vectorDeletingDestructor } from "../nativeclass";
import { bin64_t, bool_t, CommandParameterNativeType, CxxString, float32_t, int16_t, int32_t, int64_as_float_t, NativeType, Type, uint32_t, uint64_as_float_t, uint8_t, void_t } from "../nativetype";
import { Wrapper } from "../pointer";
import { procHacker } from "../prochacker";
import { CxxSharedPtr } from "../sharedpointer";
import { Singleton } from "../singleton";
import { getEnumKeys } from "../util";
import { Actor, ActorDefinitionIdentifier } from "./actor";
import { Block } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import { CommandSymbols } from "./cmdsymbolloader";
import { CommandOrigin } from "./commandorigin";
import { JsonValue } from "./connreq";
import { MobEffect } from "./effects";
import { ItemStack } from "./inventory";
import { AvailableCommandsPacket } from "./packets";
import { Player } from "./player";
import { proc } from "./symbols";
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

export enum SoftEnumUpdateType {
    Add,
    Remove,
    Replace,
}

@nativeClass()
export class MCRESULT extends NativeStruct {
    @nativeField(uint32_t)
    result:uint32_t;

    getFullCode():number {
        abstract();
    }
    isSuccess():boolean {
        abstract();
    }
}
MCRESULT.prototype.getFullCode = procHacker.js("?getFullCode@MCRESULT@@QEBAHXZ", int32_t, {this:MCRESULT});
MCRESULT.prototype.isSuccess = procHacker.js("?isSuccess@MCRESULT@@QEBA_NXZ", bool_t, {this:MCRESULT});

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
export class CommandSelectorBase extends AbstractClass {
    private _newResults(origin:CommandOrigin):CxxSharedPtr<CxxVector<Actor>> {
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
    getName():string {
        abstract();
    }
}

/** @param args_1 forcePlayer */
const CommandSelectorBaseCtor = procHacker.js('??0CommandSelectorBase@@IEAA@_N@Z', void_t, null, CommandSelectorBase, bool_t);
CommandSelectorBase.prototype[NativeType.dtor] = procHacker.js('??1CommandSelectorBase@@QEAA@XZ', void_t, {this:CommandSelectorBase});
(CommandSelectorBase.prototype as any)._newResults = procHacker.js('?newResults@CommandSelectorBase@@IEBA?AV?$shared_ptr@V?$vector@PEAVActor@@V?$allocator@PEAVActor@@@std@@@std@@@std@@AEBVCommandOrigin@@@Z', CxxSharedPtr.make(CxxVector.make(Actor.ref())), {this:CommandSelectorBase, structureReturn: true}, CommandOrigin);
CommandSelectorBase.prototype.getName = procHacker.js('?getName@CommandSelectorBase@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ', CxxString, {this:CommandSelectorBase, structureReturn: true});

@nativeClass()
export class WildcardCommandSelector<T> extends CommandSelectorBase {
    static make<T>(type:Type<T>):NativeClassType<WildcardCommandSelector<T>> {
        return Singleton.newInstance(WildcardCommandSelector, type, ()=>{
            class WildcardCommandSelectorImpl extends WildcardCommandSelector<T> {
            }
            WildcardCommandSelectorImpl.define({});
            Object.defineProperties(WildcardCommandSelectorImpl, {
                name: { value: `WildcardCommandSelector<${type.name}>` },
                symbol: { value: mangle.templateClass('WildcardCommandSelector', type) },
            });

            return WildcardCommandSelectorImpl;
        });
    }
}
interface WildcardCommandSelectorType<T> extends NativeClassType<WildcardCommandSelector<T>> {
    [CommandParameterType.symbol]:true;
}
export const ActorWildcardCommandSelector = WildcardCommandSelector.make(Actor) as WildcardCommandSelectorType<Actor>;
ActorWildcardCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};

export class PlayerWildcardCommandSelector extends ActorWildcardCommandSelector {
    [NativeType.ctor]():void {
        CommandSelectorBaseCtor(this, true);
    }
}

@nativeClass()
export class CommandSelector<T> extends CommandSelectorBase {
    static make<T>(type:Type<T>):NativeClassType<CommandSelector<T>> {
        return Singleton.newInstance(CommandSelector, type, ()=>{
            class CommandSelectorImpl extends CommandSelector<T> {
            }
            CommandSelectorImpl.define({});
            Object.defineProperties(CommandSelectorImpl, {
                name: { value: `CommandSelector<${type.name}>` },
                symbol: { value: mangle.templateClass('CommandSelector', type) },
            });

            return CommandSelectorImpl;
        });
    }
}
interface CommandSelectorType<T> extends NativeClassType<CommandSelector<T>> {
    [CommandParameterType.symbol]:true;
}
export const ActorCommandSelector = CommandSelector.make(Actor) as CommandSelectorType<Actor>;
ActorCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};
export const PlayerCommandSelector = CommandSelector.make(Player) as CommandSelectorType<Player>;
PlayerCommandSelector.prototype[NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, true);
};

@nativeClass()
export class CommandFilePath extends NativeClass {
    static readonly [CommandParameterType.symbol]:true;

    @nativeField(CxxString)
    text:CxxString;
}

@nativeClass()
class CommandIntegerRange extends NativeStruct { // Not exporting yet, not supported
    static readonly [CommandParameterType.symbol]:true;

    @nativeField(int32_t)
    min:int32_t;
    @nativeField(int32_t)
    max:int32_t;
    @nativeField(bool_t)
    inverted:bool_t;
}

@nativeClass()
export class CommandItem extends NativeStruct {
    static readonly [CommandParameterType.symbol]:true;

    @nativeField(int32_t)
    version:int32_t;
    @nativeField(int32_t)
    id:int32_t;

    createInstance(count:number):ItemStack {
        abstract();
    }
}

CommandItem.prototype.createInstance = procHacker.js('?createInstance@CommandItem@@QEBA?AV?$optional@VItemInstance@@@std@@HHPEAVCommandOutput@@_N@Z', ItemStack, {this:CommandItem, structureReturn:true}, int32_t);

export class CommandMessage extends NativeClass {
    static readonly [CommandParameterType.symbol]:true;
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
CommandMessage.prototype.getMessage = procHacker.js('?getMessage@CommandMessage@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVCommandOrigin@@@Z', CxxString, {this:CommandMessage, structureReturn:true}, CommandOrigin);

@nativeClass()
export class CommandPosition extends NativeStruct {
    static readonly [CommandParameterType.symbol]:true;
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

    static create(x:number, isXRelative:boolean, y:number, isYRelative:boolean, z:number, isZRelative:boolean, local:boolean):CommandPosition {
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

    protected _getPosition(origin: CommandOrigin, offsetFromBase: Vec3): Vec3 {
        abstract();
    }
    getPosition(origin: CommandOrigin, offsetFromBase: Vec3 = Vec3.create(0, 0, 0)): Vec3 {
        return this._getPosition(origin, offsetFromBase);
    }
    protected _getBlockPosition(origin: CommandOrigin, offsetFromBase: Vec3): BlockPos {
        abstract();
    }
    getBlockPosition(origin: CommandOrigin, offsetFromBase: Vec3 = Vec3.create(0, 0, 0)): BlockPos {
        return this._getBlockPosition(origin, offsetFromBase);
    }
}
(CommandPosition.prototype as any)._getPosition = procHacker.js("?getPosition@CommandPosition@@QEBA?AVVec3@@AEBVCommandOrigin@@AEBV2@@Z", Vec3, { this:CommandPosition,structureReturn:true }, CommandOrigin, Vec3);
(CommandPosition.prototype as any)._getBlockPosition = procHacker.js("?getBlockPos@CommandPosition@@QEBA?AVBlockPos@@AEBVCommandOrigin@@AEBVVec3@@@Z", BlockPos, { this:CommandPosition,structureReturn:true }, CommandOrigin, Vec3);

@nativeClass()
export class CommandPositionFloat extends CommandPosition {
    static readonly [CommandParameterType.symbol]: true;

    static create(x:number, isXRelative:boolean, y:number, isYRelative:boolean, z:number, isZRelative:boolean, local:boolean):CommandPositionFloat {
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

@nativeClass()
export class CommandRawText extends NativeClass {
    static readonly [CommandParameterType.symbol]:true;

    @nativeField(CxxString)
    text:CxxString;
}

@nativeClass()
export class CommandWildcardInt extends NativeStruct {
    static readonly [CommandParameterType.symbol]:true;

    @nativeField(bool_t)
    isWildcard:bool_t;
    @nativeField(int32_t)
    value:int32_t;
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
    command:CxxString;
    @nativeField(CommandOrigin.ref())
    origin:CommandOrigin;
    @nativeField(int32_t, 0x28)
    version:int32_t;

    /**
     * @param commandOrigin it's destructed by the destruction of CommandContext
     */
    constructWith(command:string, commandOrigin:CommandOrigin, version:number = CommandVersion.CurrentVersion):void {
        CommandContext$CommandContext(this, command, CommandOriginWrapper.create(commandOrigin), version);
    }

    /**
     * @param commandOrigin it's destructed by the destruction of CommandContext
     */
    static constructWith(command:string, commandOrigin:CommandOrigin, version?:number):CommandContext {
        const ctx = new CommandContext(true);
        ctx.constructWith(command, commandOrigin, version);
        return ctx;
    }

    /**
     * @param commandOrigin it's destructed by the destruction of CommandContext. it should be allocated by malloc
     */
    static constructSharedPtr(command:string, commandOrigin:CommandOrigin, version?:number):CxxSharedPtr<CommandContext> {
        const sharedptr = new CommandContextSharedPtr(true);
        sharedptr.create(commandContextRefCounter$Vftable);
        sharedptr.p!.constructWith(command, commandOrigin, version);
        return sharedptr;
    }
}

export namespace CommandVersion {
    export const CurrentVersion = proc['?CurrentVersion@CommandVersion@@2HB'].getInt32();
}

const CommandOriginWrapper = Wrapper.make(CommandOrigin.ref());
const commandContextRefCounter$Vftable = proc["??_7?$_Ref_count_obj2@VCommandContext@@@std@@6B@"];
const CommandContext$CommandContext = procHacker.js('??0CommandContext@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$unique_ptr@VCommandOrigin@@U?$default_delete@VCommandOrigin@@@std@@@2@H@Z', void_t, null,
    CommandContext, CxxString, CommandOriginWrapper, int32_t);
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

type CommandOutputParameterType = string|boolean|number|Actor|BlockPos|Vec3|Actor[];

@nativeClass()
export class CommandOutputParameter extends NativeClass {
    @nativeField(CxxString)
    string:CxxString;
    @nativeField(int32_t)
    count:int32_t;

    /**
     * @deprecated use constructWith to be sure. it has to be destructed.
     */
    static create(input:CommandOutputParameterType, count?:number):CommandOutputParameter {
        return CommandOutputParameter.constructWith(input, count);
    }

    constructWith(input:CommandOutputParameterType, count?:number):void {
        this.construct();
        switch (typeof input) {
        case 'string':
            this.string = input;
            this.count = count ?? 0;
            break;
        case 'boolean':
            this.string = input.toString();
            this.count = 0;
            break;
        case 'number':
            if (Number.isInteger(input)) {
                this.string = input.toString();
            } else {
                this.string = input.toFixed(2).toString();
            }
            this.count = 0;
            break;
        case 'object':
            if (input instanceof Actor) {
                this.string = input.getName();
                this.count = 1;
            } else if (input instanceof BlockPos || input instanceof Vec3) {
                this.string = `${input.x}, ${input.y}, ${input.z}`;
                this.count = count ?? 0;
            } else if (Array.isArray(input)) {
                if (input.length > 0) {
                    if (input[0] instanceof Actor) {
                        this.string = input.map(e => e.getName()).join(', ');
                        this.count = input.length;
                    }
                }
            }
            break;
        default:
            this.string = '';
            this.count = -1;
        }
    }
    static constructWith(input:CommandOutputParameterType, count?:number):CommandOutputParameter {
        const out = CommandOutputParameter.construct();
        out.constructWith(input, count);
        return out;
    }
}

const CommandOutputParameterVector = CxxVector.make(CommandOutputParameter);

function paramsToVector(params?:CxxVector<CommandOutputParameter>|CommandOutputParameter[]|CommandOutputParameterType[]):CxxVector<CommandOutputParameter> {
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
    json:JsonValue;
}

@nativeClass(0x30)
export class CommandOutput extends NativeClass {
    @nativeField(int32_t)
    type:CommandOutputType;
    @nativeField(CommandPropertyBag.ref())
    propertyBag:CommandPropertyBag;
    // @nativeField(int32_t, 0x28)
    // successCount:int32_t;

    getSuccessCount():number {
        abstract();
    }
    getType():CommandOutputType {
        abstract();
    }
    /**
     * @deprecated use constructWith, Uniform naming conventions
     */
    constructAs(type:CommandOutputType):void {
        this.constructWith(type);
    }
    constructWith(type:CommandOutputType):void {
        abstract();
    }
    empty():boolean {
        abstract();
    }
    /**
     * CommandOutput::set<std::string>()
     */
    set_string(key:string, value:string):void {
        abstract();
    }
    /**
     * CommandOutput::set<int>()
     */
    set_int(key:string, value:number):void {
        abstract();
    }
    /**
     * CommandOutput::set<int>()
     */
    set_bool(key:string, value:boolean):void {
        abstract();
    }
    /**
     * CommandOutput::set<float>()
     */
    set_float(key:string, value:number):void {
        abstract();
    }
    /**
     * CommandOutput::set<BlockPos>()
     */
    set_BlockPos(key:string, value:BlockPos):void {
        abstract();
    }
    /**
     * CommandOutput::set<Vec3>()
     */
    set_Vec3(key:string, value:Vec3):void {
        abstract();
    }
    set(key:string, value:string|number|boolean|BlockPos|Vec3):void {
        switch (typeof value) {
        case 'string': return this.set_string(key, value);
        case 'boolean': return this.set_bool(key, value);
        case 'number':
            if (value === (value|0)) return this.set_int(key, value);
            else return this.set_float(key, value);
        default:
            if (value instanceof Vec3) {
                return this.set_Vec3(key, value);
            } else if (value instanceof BlockPos) {
                return this.set_BlockPos(key ,value);
            } else {
                throw Error('Unexpected');
            }
        }
    }
    protected _successNoMessage():void {
        abstract();
    }
    protected _success(message:string, params:CxxVector<CommandOutputParameter>):void {
        abstract();
    }

    /**
     * @param params CAUTION! it will destruct the parameters.
     */
    success(message?:string, params?:CommandOutputParameterType[]|CommandOutputParameter[]|CxxVector<CommandOutputParameter>):void {
        if (message === undefined) {
            this._successNoMessage();
        } else {
            const _params = paramsToVector(params);
            this._success(message, _params);
            _params.destruct();
        }
    }
    protected _error(message:string, params:CxxVector<CommandOutputParameter>):void {
        abstract();
    }

    /**
     * @param params CAUTION! it will destruct the parameters.
     */
    error(message:string, params?:CommandOutputParameterType[]|CommandOutputParameter[]|CxxVector<CommandOutputParameter>):void {
        const _params = paramsToVector(params);
        this._error(message, _params);
        _params.destruct();
    }
    protected _addMessage(message:string, params:CxxVector<CommandOutputParameter>):void {
        abstract();
    }

    /**
     * @param params CAUTION! it will destruct the parameters.
     */
    addMessage(message:string, params:CommandOutputParameterType[]|CommandOutputParameter[] = []):void {
        const _params = paramsToVector(params);
        this._addMessage(message, _params);
        _params.destruct();
    }
    static constructWith(type:CommandOutputType):CommandOutput {
        const output = new CommandOutput(true);
        output.constructWith(type);
        return output;
    }
}

@nativeClass(null)
export class CommandOutputSender extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;

    _toJson(commandOutput:CommandOutput):JsonValue {
        abstract();
    }
    sendToAdmins(origin:CommandOrigin, output:CommandOutput, permission:CommandPermissionLevel):void {
        abstract();
    }
}

@nativeClass(null)
export class MinecraftCommands extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /**
     * @deprecated use bedrockServer.commandOutputSender
     */
    @nativeField(CommandOutputSender.ref())
    sender:CommandOutputSender;
    handleOutput(origin:CommandOrigin, output:CommandOutput):void {
        abstract();
    }
    /**
     * @param ctx it's destructed by this function
     */
    executeCommand(ctx:CxxSharedPtr<CommandContext>, suppressOutput:boolean):MCRESULT {
        abstract();
    }
    /**
     * @deprecated use bedrockServer.commandRegistry
     */
    getRegistry():CommandRegistry {
        abstract();
    }
    // not implemented
    // runCommand(command:HashedString, origin:CommandOrigin, ccVersion:number): void{
    //     abstract();
    // }
    static getOutputType(origin:CommandOrigin):CommandOutputType {
        abstract();
    }
}

export enum CommandParameterDataType { NORMAL, ENUM, SOFT_ENUM, POSTFIX }

export enum CommandParameterOption {
    None,
    EnumAutocompleteExpansion,
    HasSemanticConstraint,
}

@nativeClass()
export class CommandParameterData extends NativeClass {
    @nativeField(typeid_t)
    tid:typeid_t<CommandRegistry>; // 0x00
    @nativeField(VoidPointer)
    parser:VoidPointer|null; // 0x08, bool (CommandRegistry::*)(void *, CommandRegistry::ParseToken const &, CommandOrigin const &, int, std::string &,std::vector<std::string> &) const;
    @nativeField(CxxString)
    name:CxxString; // 0x10

    /** @deprecated Use {@link enumNameOrPostfix} instead */
    @nativeField(VoidPointer, {ghost:true})
    desc:VoidPointer|null; // 0x30
    @nativeField(VoidPointer)
    enumNameOrPostfix:VoidPointer|null; // 0x30, char*

    /** @deprecated Use {@link enumOrPostfixSymbol} instead */
    @nativeField(int32_t, {ghost:true})
    unk56:int32_t; // 0x38
    @nativeField(int32_t)
    enumOrPostfixSymbol:int32_t; // 0x38

    @nativeField(int32_t)
    type:CommandParameterDataType; // 0x3c
    @nativeField(int32_t)
    offset:int32_t; // 0x40
    @nativeField(int32_t)
    flag_offset:int32_t; // 0x44
    @nativeField(bool_t)
    optional:bool_t; // 0x48

    /** @deprecated Use {@link options} instead */
    @nativeField(bool_t, {ghost:true})
    pad73:bool_t;
    @nativeField(uint8_t)
    options:CommandParameterOption; // 0x49
}

@nativeClass()
export class CommandVFTable extends NativeStruct {
    @nativeField(VoidPointer)
    destructor:VoidPointer;
    @nativeField(VoidPointer)
    execute:VoidPointer|null;
}

const enumResults = new Set<string>();
@nativeClass()
class EnumResult extends NativeClass {
    @nativeField(int32_t, {ghost: true})
    intValue:int32_t;
    @nativeField(bin64_t, {ghost: true})
    bin64Value:bin64_t;
    @nativeField(int64_as_float_t, {ghost: true})
    int64Value:int64_as_float_t;
    @nativeField(CxxString)
    stringValue:CxxString;
    @nativeField(CxxString)
    token:CxxString;

    [NativeType.ctor]():void {
        enumResults.add(this.getAddressBin());
    }
    [NativeType.dtor]():void {
        enumResults.delete(this.getAddressBin());
    }
}

function passNativeTypeCtorParams<T>(type:Type<T>):[
    number, number,
    (v:unknown)=>boolean,
    ((v:unknown)=>boolean)|undefined,
    (ptr:StaticPointer, offset?:number)=>T,
    (ptr:StaticPointer, v:T, offset?:number)=>void,
    (stackptr:StaticPointer, offset?:number)=>T|null,
    (stackptr:StaticPointer, param:T extends VoidPointer ? (T|null) : T, offset?:number)=>void,
    (ptr:StaticPointer)=>void,
    (ptr:StaticPointer)=>void,
    (to:StaticPointer, from:StaticPointer)=>void,
    (to:StaticPointer, from:StaticPointer)=>void,
] {
    if (NativeClass.isNativeClassType(type)) {
        return [
            type[NativeType.size],
            type[NativeType.align],
            v=>type.isTypeOf(v),
            v=>type.isTypeOfWeak(v),
            (ptr, offset)=>type[NativeType.getter](ptr, offset),
            (ptr, param, offset)=>type[NativeType.setter](ptr, param, offset),
            (stackptr, offset)=>type[makefunc.getFromParam](stackptr, offset),
            (stackptr, param, offset)=>type[makefunc.setToParam](stackptr, param, offset),
            ptr=>type[NativeType.ctor](ptr),
            ptr=>type[NativeType.dtor](ptr),
            (to, from)=>type[NativeType.ctor_copy](to, from),
            (to, from)=>type[NativeType.ctor_move](to, from),
        ];
    } else {
        return [
            type[NativeType.size],
            type[NativeType.align],
            type.isTypeOf,
            type.isTypeOfWeak,
            type[NativeType.getter],
            type[NativeType.setter],
            type[makefunc.getFromParam],
            type[makefunc.setToParam],
            type[NativeType.ctor],
            type[NativeType.dtor],
            type[NativeType.ctor_copy],
            type[NativeType.ctor_move],
        ];
    }
}

/**
 * The command parameter type with the type converter
 */
export abstract class CommandMappedValue<BaseType, NewType=BaseType> extends CommandParameterNativeType<BaseType> {
    constructor(type:Type<BaseType>, symbol:string = type.symbol, name:string = type.name) {
        super(symbol, name, ...passNativeTypeCtorParams(type));
    }

    abstract mapValue(value:BaseType):NewType;
}

abstract class CommandEnumBase<BaseType, NewType> extends CommandMappedValue<BaseType, NewType> {
    readonly nameUtf8:StaticPointer;

    constructor(type:Type<BaseType>, symbol?:string, name?:string) {
        super(type, symbol, name);
        this.nameUtf8 = capi.permaUtf8(this.name);
    }

    getParser(): VoidPointer {
        return new VoidPointer;
    }
}

export abstract class CommandEnum<V> extends CommandEnumBase<EnumResult, V> {

    constructor(symbol:string, name?:string) {
        super(EnumResult, symbol, name || symbol);
    }
}

/**
 * built-in enum wrapper
 * one instance per one enum
 */
export class CommandRawEnum extends CommandEnum<string|number> {
    private static readonly all = new Map<string, CommandRawEnum>();

    private enumIndex = -1;
    private idRegistered = false;
    private parserType:ParserType = ParserType.Int;

    public isBuiltInEnum = false;

    private constructor(public readonly name:string) {
        super(name, name);
        if (CommandRawEnum.all.has(name)) throw Error(`the enum parser already exists (name=${name})`);
        this._update();
        this.isBuiltInEnum = this.enumIndex !== -1;
    }

    private _update():boolean {
        if (this.enumIndex !== -1) return true; // already hooked
        const registry = bedrockServer.commandRegistry;
        const enumIdex = registry.enumLookup.get(this.name);
        if (enumIdex === null) return false;
        this.enumIndex = enumIdex;

        const enumobj = registry.enums.get(this.enumIndex)!;
        this.parserType = getParserType(enumobj.parser);

        // hook the enum parser, provides extra information.
        const original = makefunc.js(enumobj.parser, bool_t, null, CommandRegistry, EnumResult, StaticPointer, CommandOrigin, int32_t, CxxString, CxxVector.make(CxxString));
        enumobj.parser = makefunc.np((registry, storage, tokenPtr, origin, version, error, errorParams) => {
            const ret = original(registry, storage, tokenPtr, origin, version, error, errorParams);

            if (enumResults.delete(storage.getAddressBin())) {
                const token = tokenPtr.getPointerAs(CommandRegistry.ParseToken);
                storage.token = token.getText();
            }
            return ret;
        }, bool_t, null, CommandRegistry, EnumResult, StaticPointer, CommandOrigin.ref(), int32_t, CxxString, CxxVector.make(CxxString));
        return true;
    }

    addValues(values:string[]):void {
        const registry = bedrockServer.commandRegistry;
        const id = registry.addEnumValues(this.name, values);
        if (!this.idRegistered) {
            this.idRegistered = true;
            type_id.register(CommandRegistry, this, id);
        }
        if (!this._update()) {
            throw Error(`enum parser is not generated (name=${this.name})`);
        }
    }

    getValues():string[] {
        const values = new Array<string>();
        if (this.enumIndex === -1) return values;
        const registry = bedrockServer.commandRegistry;
        const enumobj = registry.enums.get(this.enumIndex)!;
        for (const {first: valueIndex} of enumobj.values) {
            values.push(registry.enumValues.get(valueIndex));
        }
        return values;
    }

    getValueCount():number {
        if (this.enumIndex === -1) return 0;
        const registry = bedrockServer.commandRegistry;
        const enumobj = registry.enums.get(this.enumIndex)!;
        return enumobj.values.size();
    }

    mapValue(value:EnumResult):string|number {
        switch (this.parserType) {
        case ParserType.Unknown: return value.token.toLowerCase();
        case ParserType.Int: return value.intValue;
        case ParserType.String: return value.stringValue;
        }
    }

    static getInstance(name:string):CommandRawEnum {
        let parser = CommandRawEnum.all.get(name);
        if (parser != null) return parser;
        parser = new CommandRawEnum(name);
        CommandRawEnum.all.set(name, parser);
        return parser;
    }
}

class CommandMappedEnum<V extends string|number|symbol> extends CommandEnum<V> {
    public readonly mapper = new Map<string, V>();
    private raw:CommandRawEnum;

    protected _init():void {
        const keys = [...this.mapper.keys()];
        for (const value of keys) {
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

        this.raw = CommandRawEnum.getInstance(this.name);
        this.raw.addValues(keys);
        if (this.raw.isBuiltInEnum) {
            console.error(colors.yellow(`Warning, built-in enum is extended(name = ${this.name})`));
        }
    }

    mapValue(value:EnumResult):V {
        // it can return the undefined value if it overlaps the raw enum.
        return this.mapper.get(value.token.toLocaleLowerCase())!;
    }
}

export class CommandStringEnum<T extends string[]> extends CommandMappedEnum<T[number]> {
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

export class CommandIndexEnum<T extends number|string> extends CommandMappedEnum<T> {
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

export class CommandSoftEnum extends CommandEnumBase<CxxString, string> {
    private static readonly all = new Map<string, CommandSoftEnum>();

    private enumIndex = -1;

    private constructor(name:string) {
        super(CxxString, CxxString.symbol, name);
        if (CommandSoftEnum.all.has(name)) throw Error(`the enum parser already exists (name=${name})`);
        this.enumIndex = bedrockServer.commandRegistry.softEnumLookup.get(this.name) ?? -1;
        // No type id should be registered, it is the type of string
    }

    protected updateValues(mode: SoftEnumUpdateType, values:string[]):void {
        bedrockServer.commandRegistry.updateSoftEnum(mode, this.name, values);
    }

    getParser(): VoidPointer {
        return CommandRegistry.getParser(CxxString);
    }

    mapValue(value:string):string {
        return value;
    }

    addValues(...values:string[]):void;
    addValues(values:string[]):void;
    addValues(...values:(string|string[])[]):void {
        const first = values[0];
        if (Array.isArray(first)) {
            values = first;
        }
        if (this.enumIndex === -1) {
            const registry = bedrockServer.commandRegistry;
            registry.addSoftEnum(this.name, values as string[]);
            this.enumIndex = registry.softEnumLookup.get(this.name) ?? -1;
        } else {
            this.updateValues(SoftEnumUpdateType.Add, values as string[]);
        }
    }

    removeValues(...values:string[]):void;
    removeValues(values:string[]):void;
    removeValues(...values:(string|string[])[]):void {
        const first = values[0];
        if (Array.isArray(first)) {
            this.updateValues(SoftEnumUpdateType.Remove, first);
        } else {
            this.updateValues(SoftEnumUpdateType.Remove, values as string[]);
        }
    }

    setValues(...values:string[]):void;
    setValues(values:string[]):void;
    setValues(...values:(string|string[])[]):void {
        const first = values[0];
        if (Array.isArray(first)) {
            values = first;
        }
        if (this.enumIndex !== -1) {
            const registry = bedrockServer.commandRegistry;
            registry.addSoftEnum(this.name, values as string[]);
            this.enumIndex = registry.softEnumLookup.get(this.name) ?? -1;
        } else {
            this.updateValues(SoftEnumUpdateType.Replace, values as string[]);
        }
    }

    getValues():string[] {
        const values = new Array<string>();
        if (this.enumIndex === -1) return values;
        const enumobj = bedrockServer.commandRegistry.softEnums.get(this.enumIndex)!;
        return enumobj.list.toArray();
    }

    getValueCount():number {
        if (this.enumIndex === -1) return 0;
        const enumobj = bedrockServer.commandRegistry.softEnums.get(this.enumIndex)!;
        return enumobj.list.size();
    }

    static getInstance(name:string):CommandSoftEnum {
        let parser = CommandSoftEnum.all.get(name);
        if (parser != null) return parser;
        parser = new CommandSoftEnum(name);
        CommandSoftEnum.all.set(name, parser);
        return parser;
    }
}

const parsers = new Map<Type<any>, VoidPointer>();
const stringParser = proc['??$parse@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z'];
let enumParser:VoidPointer = proc['??$parseEnum@HU?$DefaultIdConverter@H@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z'];

enum ParserType {
    Unknown,
    Int,
    String,
}

function getParserType(parser:VoidPointer):ParserType {
    if (parser.equalsptr(stringParser)) {
        return ParserType.String;
    } else if (parser.equalsptr(enumParser)) {
        return ParserType.Int;
    } else {
        return ParserType.Unknown;
    }
}

export class CommandRegistry extends HasTypeId {
    enumValues:CxxVector<CxxString>;
    enums:CxxVector<CommandRegistry.Enum>;
    enumLookup:CxxMap<CxxString, uint32_t>;
    enumValueLookup:CxxMap<CxxString, uint64_as_float_t>;
    commandSymbols:CxxVector<CommandRegistry.Symbol>;
    signatures:CxxMap<CxxString, CommandRegistry.Signature>;
    softEnums:CxxVector<CommandRegistry.SoftEnum>;
    softEnumLookup:CxxMap<CxxString, uint32_t>;

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
        const overload = sig.overloads.prepare();
        overload.construct();
        overload.commandVersion = bin.make64(1, 0x7fffffff);
        overload.allocator = allocator;
        overload.parameters.setFromArray(params);
        overload.commandVersionOffset = -1;
        this.registerOverloadInternal(sig, overload);

        for (const param of params) {
            param.destruct();
        }
    }

    registerOverloadInternal(signature:CommandRegistry.Signature, overload: CommandRegistry.Overload):void{
        abstract();
    }

    getCommandName(command:string):string {
        abstract();
    }

    findCommand(command:string):CommandRegistry.Signature|null {
        abstract();
    }

    protected _serializeAvailableCommands(pk:AvailableCommandsPacket):AvailableCommandsPacket {
        abstract();
    }

    serializeAvailableCommands():AvailableCommandsPacket {
        const pk = AvailableCommandsPacket.allocate();
        this._serializeAvailableCommands(pk);
        return pk;
    }

    static getParser<T>(type:Type<T>):VoidPointer {
        if (type instanceof CommandEnumBase) {
            return type.getParser();
        }
        const parser = parsers.get(type);
        if (parser != null) return parser;
        throw Error(`${type.name} parser not found`);
    }

    static hasParser<T>(type:Type<T>):boolean {
        if (type instanceof CommandEnumBase) return true;
        return parsers.has(type);
    }

    static loadParser(symbols:CommandSymbols):void {
        for (const [type, addr] of symbols.iterateParsers()) {
            parsers.set(type, addr);
        }
    }

    static setParser(type:Type<any>, parserFnPointer:VoidPointer):void {
        parsers.set(type, parserFnPointer);
    }

    /**
     * @deprecated no need to use
     */
    static setEnumParser(parserFnPointer:VoidPointer):void {
        enumParser = parserFnPointer;
    }

    hasEnum(name:string):boolean {
        return this.enumLookup.has(name);
    }

    getEnum(name:string):CommandRegistry.Enum|null {
        const enumIndex = this.enumLookup.get(name);
        if (enumIndex === null) return null;
        return this.enums.get(enumIndex);
    }

    addEnumValues(name:string, values:string[]):number {
        abstract();
    }

    getEnumValues(name:string):string[]|null {
        const values = new Array<string>();
        const _enum = this.getEnum(name);
        if (!_enum) return null;
        for (const {first: valueIndex} of _enum.values) {
            values.push(this.enumValues.get(valueIndex));
        }
        return values;
    }

    hasSoftEnum(name:string):boolean {
        return this.softEnumLookup.has(name);
    }

    getSoftEnum(name:string):CommandRegistry.SoftEnum|null {
        const enumIndex = this.softEnumLookup.get(name);
        if (enumIndex == null) return null;
        return this.softEnums.get(enumIndex);
    }

    addSoftEnum(name:string, values:string[]):number {
        abstract();
    }

    getSoftEnumValues(name:string):string[]|null {
        const _enum = this.getSoftEnum(name);
        if (!_enum) return null;
        return _enum.list.toArray();
    }

    updateSoftEnum(type:SoftEnumUpdateType, name:string, values:string[]):void {
        CommandSoftEnumRegistry$updateSoftEnum(this, type, name, values);
    }
}

export namespace CommandRegistry {
    @nativeClass()
    export class Symbol extends NativeStruct {
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
        @nativeField(StaticPointer, 0x18)
        text:StaticPointer;
        @nativeField(uint32_t)
        length:uint32_t;
        @nativeField(CommandRegistry.Symbol)
        type:CommandRegistry.Symbol;

        getText():string {
            return this.text.getString().slice(0, this.length);
        }
    }

    @nativeClass()
    export class Enum extends NativeClass {
        @nativeField(CxxString)
        name:CxxString;
        @nativeField(typeid_t)
        tid:typeid_t<CommandRegistry>;
        @nativeField(VoidPointer)
        parser:VoidPointer;
        @nativeField(CxxVector.make(CxxPair.make(uint64_as_float_t, bin64_t)))
        values:CxxVector<CxxPair<uint64_as_float_t, bin64_t>>;
    }

    @nativeClass()
    export class SoftEnum extends NativeClass {
        @nativeField(CxxString)
        name:CxxString;
        @nativeField(CxxVector.make(CxxString))
        list:CxxVector<CxxString>;
    }

    @nativeClass(0xc0)
    export class Parser extends AbstractClass {
        constructWith(registry:CommandRegistry, version:number):void {
            abstract();
        }
        parseCommand(command:string):boolean {
            abstract();
        }
        createCommand(origin:CommandOrigin):Command|null {
            abstract();
        }
        getErrorMessage():string {
            abstract();
        }
        getErrorParams():string[] {
            abstract();
        }
        static constructWith(registry:CommandRegistry, version:number):Parser {
            const parser = new Parser(true);
            parser.constructWith(registry, version);
            return parser;
        }
    }
}

@nativeClass()
export class Command extends NativeClass {
    @nativeField(CommandVFTable.ref())
    vftable:CommandVFTable; // 0x00

    /** @deprecated */
    @nativeField(int32_t, {ghost:true})
    u1:int32_t; // 0x08
    @nativeField(int32_t)
    version:int32_t; // 0x08

    /** @deprecated */
    @nativeField(VoidPointer, {ghost:true})
    u2:VoidPointer|null; // 0x10
    @nativeField(CommandRegistry.ref())
    registry:CommandRegistry|null; // 0x10

    /** @deprecated */
    @nativeField(int32_t, {ghost:true})
    u3:int32_t; // 0x18
    @nativeField(int32_t)
    commandSymbol:int32_t; // 0x18

    /** @deprecated */
    @nativeField(int16_t, {ghost:true})
    u4:int16_t; // 0x1c
    @nativeField(uint8_t)
    permissionLevel:uint8_t; // 0x1c

    @nativeField(int16_t)
    flags:int16_t; // 0x1e

    [NativeType.ctor]():void {
        this.vftable = null as any;
        this.version = 0;
        this.registry = null;
        this.commandSymbol = -1;
        this.permissionLevel = 5;
        this.flags = 0;
    }
    [NativeType.dtor]():void {
        abstract();
    }

    run(origin:CommandOrigin, output:CommandOutput):void {
        abstract();
    }

    static mandatory<CMD extends Command,
        KEY extends keyof CMD,
        KEY_ISSET extends KeysFilter<CMD, bool_t>|null>(
        this:{new():CMD},
        key:KEY,
        keyForIsSet:KEY_ISSET,
        enumNameOrPostfix?:string|null,
        type:CommandParameterDataType = CommandParameterDataType.NORMAL,
        name:string = key as string,
        options:CommandParameterOption = CommandParameterOption.None):CommandParameterData {
        const cmdclass = this as NativeClassType<any>;
        const paramType = cmdclass.typeOf(key as string);
        const offset = cmdclass.offsetOf(key as string);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        return Command.manual(name, paramType, offset, flag_offset, false, enumNameOrPostfix, type, options);
    }
    static optional<CMD extends Command,
        KEY extends keyof CMD,
        KEY_ISSET extends KeysFilter<CMD, bool_t>|null>(
        this:{new():CMD},
        key:KEY,
        keyForIsSet:KEY_ISSET,
        enumNameOrPostfix?:string|null,
        type:CommandParameterDataType = CommandParameterDataType.NORMAL,
        name:string = key as string,
        options:CommandParameterOption = CommandParameterOption.None):CommandParameterData {
        const cmdclass = this as NativeClassType<any>;
        const paramType = cmdclass.typeOf(key as string);
        const offset = cmdclass.offsetOf(key as string);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        return Command.manual(name, paramType, offset, flag_offset, true, enumNameOrPostfix, type, options);
    }
    static manual(
        name:string,
        paramType:Type<any>,
        offset:number,
        flag_offset:number = -1,
        optional:boolean = false,
        enumNameOrPostfix?:string|null,
        type:CommandParameterDataType = CommandParameterDataType.NORMAL,
        options:CommandParameterOption = CommandParameterOption.None):CommandParameterData {
        const param = CommandParameterData.construct();
        param.tid.id = type_id(CommandRegistry, paramType).id;
        param.enumNameOrPostfix = null;
        if (paramType instanceof CommandEnum) {
            if (enumNameOrPostfix != null) throw Error(`CommandEnum does not support postfix`);
            param.enumNameOrPostfix = paramType.nameUtf8;
        } else if (paramType instanceof CommandSoftEnum) {
            // a soft enum is a string with autocompletions, for example, objectives in /scoreboard
            if (enumNameOrPostfix != null) throw Error(`CommandSoftEnum does not support postfix`);
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
        param.parser = CommandRegistry.getParser(paramType);
        param.name = name;
        param.type = type;

        param.enumOrPostfixSymbol = -1;
        param.offset = offset;
        param.flag_offset = flag_offset;
        param.optional = optional;
        param.options = options;
        return param;
    }

    static isWildcard(selectorBase: CommandSelectorBase): boolean {
        abstract();
    }
}
Command.isWildcard = procHacker.js("?isWildcard@Command@@KA_NAEBVCommandSelectorBase@@@Z", bool_t, null, CommandSelectorBase);

const BlockClass = Block;
const MobEffectClass = MobEffect;
const ActorDefinitionIdentifierClass = ActorDefinitionIdentifier;

function constptr<T extends NativeClass>(cls:new()=>T):CommandParameterNativeType<T> {
    const nativecls = cls as NativeClassType<T>;
    const constptr = Object.create(nativecls.ref());
    constptr.name = nativecls.name + '*';
    constptr.symbol = mangle.constPointer(nativecls.symbol);
    return constptr!;
}

export namespace Command {
    export const VFTable = CommandVFTable;
    export type VFTable = CommandVFTable;

    export const Block = constptr(BlockClass);
    export const MobEffect = constptr(MobEffectClass);
    export const ActorDefinitionIdentifier = constptr(ActorDefinitionIdentifierClass);
}
/** @deprecated use Command.Block */
export const CommandBlock = Command.Block;
/** @deprecated use Command.MobEffect */
export const CommandMobEffect = Command.MobEffect;

CommandOutput.prototype.getSuccessCount = procHacker.js('?getSuccessCount@CommandOutput@@QEBAHXZ', int32_t, {this:CommandOutput});
CommandOutput.prototype.getType = procHacker.js('?getType@CommandOutput@@QEBA?AW4CommandOutputType@@XZ', int32_t, {this:CommandOutput});
CommandOutput.prototype.constructWith = procHacker.js('??0CommandOutput@@QEAA@W4CommandOutputType@@@Z', void_t, {this:CommandOutput}, int32_t);
CommandOutput.prototype.empty = procHacker.js('?empty@CommandOutput@@QEBA_NXZ', bool_t, {this:CommandOutput});
CommandOutput.prototype.set_string = procHacker.js('??$set@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@CommandOutput@@QEAAXPEBDV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', void_t, {this:CommandOutput}, makefunc.Utf8, CxxString);
CommandOutput.prototype.set_int = procHacker.js('??$set@H@CommandOutput@@QEAAXPEBDH@Z', void_t, {this:CommandOutput}, makefunc.Utf8, int32_t);
CommandOutput.prototype.set_bool = procHacker.js('??$set@_N@CommandOutput@@QEAAXPEBD_N@Z', void_t, {this:CommandOutput}, makefunc.Utf8, bool_t);
CommandOutput.prototype.set_float = procHacker.js('??$set@M@CommandOutput@@QEAAXPEBDM@Z', void_t, {this:CommandOutput}, makefunc.Utf8, float32_t);
CommandOutput.prototype.set_BlockPos = procHacker.js('??$set@VBlockPos@@@CommandOutput@@QEAAXPEBDVBlockPos@@@Z', void_t, {this:CommandOutput}, makefunc.Utf8, BlockPos);
CommandOutput.prototype.set_Vec3 = function(k, v) {
    if (this.type !== CommandOutputType.DataSet) return;
    this.propertyBag.json.get(k).setValue({
        x: v.x,
        y: v.y,
        z: v.z,
    });
};

(CommandOutput.prototype as any)._successNoMessage = procHacker.js('?success@CommandOutput@@QEAAXXZ', void_t, {this:CommandOutput});
(CommandOutput.prototype as any)._success = procHacker.js('?success@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z', void_t, {this:CommandOutput}, CxxString, CommandOutputParameterVector);
(CommandOutput.prototype as any)._error = procHacker.js('?error@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z', void_t, {this:CommandOutput}, CxxString, CommandOutputParameterVector);
(CommandOutput.prototype as any)._addMessage = procHacker.js('?addMessage@CommandOutput@@AEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@W4CommandOutputMessageType@@@Z', void_t, {this:CommandOutput}, CxxString, CommandOutputParameterVector);
CommandOutput.prototype[NativeType.dtor] = procHacker.js('??1CommandOutput@@QEAA@XZ', void_t, {this:CommandOutput});

CommandOutputSender.prototype._toJson = procHacker.js('?_toJson@CommandOutputSender@@IEBA?AVValue@Json@@AEBVCommandOutput@@@Z', JsonValue, {this:CommandOutputSender, structureReturn:true}, CommandOutput);
CommandOutputSender.prototype.sendToAdmins = procHacker.js('?sendToAdmins@CommandOutputSender@@QEAAXAEBVCommandOrigin@@AEBVCommandOutput@@W4CommandPermissionLevel@@@Z', void_t, {this:MinecraftCommands}, CommandOrigin, CommandOutput, int32_t);

MinecraftCommands.prototype.handleOutput = procHacker.js('?handleOutput@MinecraftCommands@@QEBAXAEBVCommandOrigin@@AEBVCommandOutput@@@Z', void_t, {this:MinecraftCommands}, CommandOrigin, CommandOutput);
// MinecraftCommands.prototype.executeCommand is defined at bdsx/command.ts
MinecraftCommands.prototype.getRegistry = procHacker.js('?getRegistry@MinecraftCommands@@QEAAAEAVCommandRegistry@@XZ', CommandRegistry, {this:MinecraftCommands});
MinecraftCommands.getOutputType = procHacker.js('?getOutputType@MinecraftCommands@@SA?AW4CommandOutputType@@AEBVCommandOrigin@@@Z', int32_t, null, CommandOrigin);

CommandRegistry.abstract({
    enumValues: [CxxVector.make(CxxString), 192],
    enums: [CxxVector.make(CommandRegistry.Enum), 216], // accessed in CommandRegistry::addEnumValuesToExisting
    enumLookup: [CxxMap.make(CxxString, uint32_t), 288], // 0x120
    enumValueLookup: [CxxMap.make(CxxString, uint64_as_float_t), 304], // accessed in CommandRegistry::findEnumValue
    commandSymbols: [CxxVector.make(CommandRegistry.Symbol), 320], // accessed in CommandRegistry::findEnumValue
    signatures: [CxxMap.make(CxxString, CommandRegistry.Signature), 344], // accessed in CommandRegistry::findCommand
    softEnums: [CxxVector.make(CommandRegistry.SoftEnum), 488],
    softEnumLookup: [CxxMap.make(CxxString, uint32_t), 512],
});
CommandRegistry.prototype.registerOverloadInternal = procHacker.js('?registerOverloadInternal@CommandRegistry@@AEAAXAEAUSignature@1@AEAUOverload@1@@Z', void_t, {this:CommandRegistry}, CommandRegistry.Signature, CommandRegistry.Overload);
CommandRegistry.prototype.registerCommand = procHacker.js('?registerCommand@CommandRegistry@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@PEBDW4CommandPermissionLevel@@UCommandFlag@@3@Z', void_t, {this:CommandRegistry}, CxxString, makefunc.Utf8, int32_t, int32_t, int32_t);
CommandRegistry.prototype.registerAlias = procHacker.js('?registerAlias@CommandRegistry@@QEAAXV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@0@Z', void_t, {this:CommandRegistry}, CxxString, CxxString);
CommandRegistry.prototype.getCommandName = procHacker.js('?getCommandName@CommandRegistry@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV23@@Z', CxxString, {structureReturn: true, this:CommandRegistry}, CxxString);
CommandRegistry.prototype.findCommand = procHacker.js('?findCommand@CommandRegistry@@AEAAPEAUSignature@1@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', CommandRegistry.Signature, {this:CommandRegistry}, CxxString);
CommandRegistry.prototype.addEnumValues = procHacker.js('?addEnumValues@CommandRegistry@@QEAAHAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@3@@Z', int32_t, {this:CommandRegistry}, CxxString, CxxVectorToArray.make(CxxString));
CommandRegistry.prototype.addSoftEnum = procHacker.js('?addSoftEnum@CommandRegistry@@QEAAHAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@3@@Z', int32_t, {this:CommandRegistry}, CxxString, CxxVectorToArray.make(CxxString));
(CommandRegistry.prototype as any)._serializeAvailableCommands = procHacker.js('?serializeAvailableCommands@CommandRegistry@@QEBA?AVAvailableCommandsPacket@@XZ', AvailableCommandsPacket, {this:CommandRegistry}, AvailableCommandsPacket);
Command.prototype[NativeType.dtor] = vectorDeletingDestructor;

CommandRegistry.Parser.prototype.constructWith = procHacker.js('??0Parser@CommandRegistry@@QEAA@AEBV1@H@Z', void_t, {this:CommandRegistry.Parser}, CommandRegistry, int32_t);
CommandRegistry.Parser.prototype[NativeType.dtor] = procHacker.js('??1Parser@CommandRegistry@@QEAA@XZ', void_t, {this:CommandRegistry.Parser});
CommandRegistry.Parser.prototype.parseCommand = procHacker.js('?parseCommand@Parser@CommandRegistry@@QEAA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', bool_t, {this:CommandRegistry.Parser}, CxxString);
CommandRegistry.Parser.prototype.createCommand = procHacker.js('?createCommand@Parser@CommandRegistry@@QEAA?AV?$unique_ptr@VCommand@@U?$default_delete@VCommand@@@std@@@std@@AEBVCommandOrigin@@@Z', Command.ref(), {this:CommandRegistry.Parser, structureReturn: true}, CommandOrigin);
CommandRegistry.Parser.prototype.getErrorMessage = procHacker.js('?getErrorMessage@Parser@CommandRegistry@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ', CxxString, {this:CommandRegistry.Parser});
CommandRegistry.Parser.prototype.getErrorParams = procHacker.js('?getErrorParams@Parser@CommandRegistry@@QEBA?AV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@XZ', CxxVectorToArray.make(CxxString), {this:CommandRegistry.Parser, structureReturn: true});

Command.prototype.run = procHacker.js('?run@Command@@QEBAXAEBVCommandOrigin@@AEAVCommandOutput@@@Z', void_t, {this:Command}, CommandOrigin, CommandOutput);

// CommandSoftEnumRegistry is a class with only one field, which is a pointer to CommandRegistry.
// I can only find one member function so I am not sure if a dedicated class is needed.
const CommandSoftEnumRegistry$updateSoftEnum = procHacker.js('?updateSoftEnum@CommandSoftEnumRegistry@@QEAAXW4SoftEnumUpdateType@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z', void_t, null, CommandRegistry.ref().ref(), uint8_t, CxxString, CxxVectorToArray.make(CxxString));

// list for not implemented
'CommandRegistry::parse<AutomaticID<Dimension,int> >'; // CommandRegistry::parse<DimensionId>
'CommandRegistry::parse<CommandIntegerRange>'; // Not supported yet(?) there is no type id for it
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
