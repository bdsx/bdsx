import { asm } from "../assembler";
import { bin } from "../bin";
import { capi } from "../capi";
import { abstract, SYMOPT_PUBLICS_ONLY, UNDNAME_NAME_ONLY } from "../common";
import { chakraUtil, NativePointer, pdb, StaticPointer, VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { makefunc, RawTypeId } from "../makefunc";
import { KeysFilter, nativeClass, NativeClass, NativeClassType, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, NativeType, Type, uint32_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import { templateName } from "../templatename";
import { Actor } from "./actor";
import { RelativeFloat } from "./blockpos";
import { CommandOrigin } from "./commandorigin";
import { procHacker } from "./proc";
import { HasTypeId, typeid_t, type_id } from "./typeid";

export enum CommandPermissionLevel {
	Normal,
	Operator,
	Host,
	Automation,
	Admin,
}

export enum CommandFlag {
    None        = 0x00,
}

@nativeClass()
export class MCRESULT extends NativeClass {
    @nativeField(uint32_t)
    result:uint32_t;
}

@nativeClass(0xc0)
export class CommandSelectorBase extends NativeClass {
    private _newResults(origin:CommandOrigin):SharedPtr<CxxVector<Actor>> {
        abstract();
    }
    newResults(origin:CommandOrigin):Actor[] {
        const list = this._newResults(origin);
        const actors = list.p!.toArray();
        list.dispose();
        return actors;
    }
}
const CommandSelectorBaseCtor = procHacker.js('CommandSelectorBase::CommandSelectorBase', RawTypeId.Void, null, CommandSelectorBase, RawTypeId.Boolean);
CommandSelectorBase.prototype[NativeType.dtor] = procHacker.js('CommandSelectorBase::~CommandSelectorBase', RawTypeId.Void, {this:CommandSelectorBase});
(CommandSelectorBase.prototype as any)._newResults = procHacker.js('CommandSelectorBase::newResults', SharedPtr.make(CxxVector.make(Actor.ref())), {this:CommandSelectorBase, structureReturn: true}, CommandOrigin);

@nativeClass()
export class WildcardCommandSelector<T> extends CommandSelectorBase {

    static make<T>(type:Type<T>):NativeClassType<WildcardCommandSelector<T>> {
        class WildcardCommandSelectorImpl extends WildcardCommandSelector<T> {
        }
        Object.defineProperty(WildcardCommandSelectorImpl, 'name', {value: templateName('WildcardCommandSelector', type.name)});
        WildcardCommandSelectorImpl.define({});

        return WildcardCommandSelectorImpl;
    }
}

export const ActorWildcardCommandSelector = WildcardCommandSelector.make(Actor);
ActorWildcardCommandSelector.prototype[NativeType.ctor] = function() {
    CommandSelectorBaseCtor(this, false);
};

@nativeClass()
export class CommandRawText extends NativeClass {
    @nativeField(CxxString)
    text:CxxString;
}

@nativeClass(0x30)
export class CommandContext extends NativeClass {
    @nativeField(CxxString)
    command:CxxString;
    @nativeField(CommandOrigin.ref())
    origin:CommandOrigin;
}

@nativeClass(null)
export class CommandOutput extends NativeClass {
}

@nativeClass(null)
export class CommandOutputSender extends NativeClass {
}

@nativeClass(null)
export class MinecraftCommands extends NativeClass {
    @nativeField(CommandOutputSender.ref())
    sender:CommandOutputSender;

    executeCommand(ctx:SharedPtr<CommandContext>, b:boolean):MCRESULT {
        abstract();
    }
    getRegistry():CommandRegistry {
        abstract();
    }
}

export enum CommandParameterDataType { NORMAL, ENUM, SOFT_ENUM }

const parsers = new Map<Type<any>, VoidPointer>();

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
        const param = new CommandParameterData(true);
        param.construct();
        param.tid.id = type_id(CommandRegistry, paramType).id;
        param.parser = CommandRegistry.getParser(paramType);
        param.name = name;
        param.type = type;
        if (desc != null) {
            const descbuf = Buffer.from(desc, 'utf-8');
            chakraUtil.JsAddRef(descbuf);
            const ptr = new NativePointer;
            ptr.setAddressFromBuffer(descbuf);
            param.desc = ptr;
        } else {
            param.desc = null;
        }

        param.unk56 = -1;
        param.offset = cmdclass.offsetOf(key as string);
        param.flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        param.optional = false;
        param.pad73 = false;
        return param;
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
        const param = new CommandParameterData(true);
        param.construct();
        param.tid.id = type_id(CommandRegistry, paramType).id;
        param.parser = CommandRegistry.getParser(paramType);
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
        param.offset = cmdclass.offsetOf(key as string);
        param.flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet as string) : -1;
        param.optional = true;
        param.pad73 = false;
        return param;
    }
}

export namespace Command {
    export const VFTable = CommandVFTable;
    export type VFTable = CommandVFTable;
}

export class CommandRegistry extends HasTypeId {
    protected _registerCommand(command:CxxStringWrapper, description:string, level:CommandPermissionLevel, flag1:CommandFlag, flag2:CommandFlag):void {
        abstract();
    }
    registerCommand(command:string, description:string, level:CommandPermissionLevel, flag1:CommandFlag, flag2:CommandFlag):void {
        const commandstr = new CxxStringWrapper(true);
        commandstr.construct();
        commandstr.value = command;
        this._registerCommand(commandstr, description, level, flag1, flag2);
        commandstr.destruct();
    }
    protected _registerAlias(command:CxxStringWrapper, alias:CxxStringWrapper):void {
        abstract();
    }
    registerAlias(command:string, alias:string):void {
        const commandstr = new CxxStringWrapper(true);
        commandstr.construct();
        commandstr.value = command;
        const aliasstr = new CxxStringWrapper(true);
        aliasstr.construct();
        aliasstr.value = alias;
        this._registerAlias(commandstr, aliasstr);
        commandstr.destruct();
        aliasstr.destruct();
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
        }, StaticPointer, null, StaticPointer);

        const sig = this.findCommand(name);
        if (sig === null) throw Error(`${name}: command not found`);

        const overload = new CommandRegistry.Overload(true);
        overload.construct();
        overload.commandVersion = bin.make64(1, 0x7fffffff);
        overload.allocator = allocator;
        overload.parameters.setFromArray(params);
        overload.u6 = -1;
        sig.overloads.push(overload);
        this.registerOverloadInternal(sig, overload);
        overload.destruct();

        for (const param of params) {
            param.destruct();
        }
    }

    registerOverloadInternal(signature:CommandRegistry.Signature, overload: CommandRegistry.Overload):void{
        abstract();
    }
    protected _findCommand(command:CxxStringWrapper):CommandRegistry.Signature|null {
        abstract();
    }
    findCommand(command:string):CommandRegistry.Signature|null {
        const commandstr = new CxxStringWrapper(true);
        commandstr.construct();
        commandstr.value = command;
        const sig = this._findCommand(commandstr);
        commandstr.destruct();
        return sig;
    }

    static getParser<T>(type:Type<T>):VoidPointer {
        const parser = parsers.get(type);
        if (parser !== undefined) return parser;
        throw Error(`${type.name} parser not found`);
    }
}

export namespace CommandRegistry {
    @nativeClass(0x30)
    export class Overload extends NativeClass {
        @nativeField(bin64_t)
        commandVersion:bin64_t;
        @nativeField(VoidPointer)
        allocator:VoidPointer;
        @nativeField(CxxVector.make<CommandParameterData>(CommandParameterData))
        parameters:CxxVector<CommandParameterData>;
        @nativeField(int32_t)
        u6:int32_t;
    }

    @nativeClass(null)
    export class Signature extends NativeClass {
        @nativeField(CxxString)
        command:CxxString;
        @nativeField(CxxString)
        description:CxxString;
        @nativeField(CxxVector.make<CommandRegistry.Overload>(CommandRegistry.Overload))
        overloads:CxxVector<Overload>;
    }

    @nativeClass(null)
    export class ParseToken extends NativeClass {
    }
}

function loadParserFromPdb(types:Type<any>[]):void {
    const symbols = types.map(type=>templateName('CommandRegistry::parse', type.name));

    pdb.setOptions(SYMOPT_PUBLICS_ONLY); // i don't know why but CommandRegistry::parse<bool> does not found without it.
    const addrs = pdb.getList(pdb.coreCachePath, {}, symbols, false, UNDNAME_NAME_ONLY);
    pdb.setOptions(0);

    for (let i=0;i<symbols.length;i++) {
        const addr = addrs[symbols[i]];
        if (addr === undefined) continue;
        parsers.set(types[i], addr);
    }
}

const types = [int32_t, float32_t, bool_t, CxxString, ActorWildcardCommandSelector, RelativeFloat, CommandRawText];
type_id.pdbimport(CommandRegistry, types);
loadParserFromPdb(types);

MinecraftCommands.prototype.executeCommand = procHacker.js('MinecraftCommands::executeCommand', MCRESULT, {this: MinecraftCommands, structureReturn:true }, SharedPtr.make(CommandContext), RawTypeId.Boolean);
MinecraftCommands.prototype.getRegistry = procHacker.js('MinecraftCommands::getRegistry', CommandRegistry, {this: MinecraftCommands });

CommandRegistry.prototype.registerOverloadInternal = procHacker.js('CommandRegistry::registerOverloadInternal', RawTypeId.Void, {this:CommandRegistry}, CommandRegistry.Signature, CommandRegistry.Overload);
(CommandRegistry.prototype as any)._registerCommand = procHacker.js("CommandRegistry::registerCommand", RawTypeId.Void, {this:CommandRegistry}, CxxStringWrapper, RawTypeId.StringUtf8, RawTypeId.Int32, RawTypeId.Int32, RawTypeId.Int32);
(CommandRegistry.prototype as any)._registerAlias = procHacker.js("CommandRegistry::registerAlias", RawTypeId.Void, {this:CommandRegistry}, CxxStringWrapper, CxxStringWrapper);
(CommandRegistry.prototype as any)._findCommand = procHacker.js("CommandRegistry::findCommand", CommandRegistry.Signature, {this:CommandRegistry, nullableReturn: true}, CxxStringWrapper);

'CommandRegistry::parse<AutomaticID<Dimension,int> >';
'CommandRegistry::parse<Block const * __ptr64>';
'CommandRegistry::parse<CommandFilePath>';
'CommandRegistry::parse<CommandIntegerRange>';
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
