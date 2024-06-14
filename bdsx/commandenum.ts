import * as colors from "colors";
import { CommandRegistry, SoftEnumUpdateType } from "./bds/command";
import { CommandOrigin } from "./bds/commandorigin";
import { type_id } from "./bds/typeid";
import { capi } from "./capi";
import { CommandMappedValue, commandParser } from "./commandparser";
import { StaticPointer, VoidPointer } from "./core";
import { CxxVector } from "./cxxvector";
import { events } from "./event";
import { bedrockServer } from "./launcher";
import { makefunc } from "./makefunc";
import { NativeClass, nativeClass, nativeField } from "./nativeclass";
import { CxxString, NativeType, Type, bin64_t, bool_t, int32_t, int64_as_float_t } from "./nativetype";
import { getEnumKeys } from "./util";

const enumResults = new Set<string>();
@nativeClass()
export class EnumResult extends NativeClass {
    @nativeField(int32_t, { ghost: true })
    intValue: int32_t;
    @nativeField(bin64_t, { ghost: true })
    bin64Value: bin64_t;
    @nativeField(int64_as_float_t, { ghost: true })
    int64Value: int64_as_float_t;
    @nativeField(CxxString)
    stringValue: CxxString;
    @nativeField(CxxString)
    token: CxxString;

    [NativeType.ctor](): void {
        enumResults.add(this.getAddressBin());
    }
    [NativeType.dtor](): void {
        enumResults.delete(this.getAddressBin());
    }
}
abstract class CommandEnumBase<BaseType, NewType> extends CommandMappedValue<BaseType, NewType> {
    readonly nameUtf8: StaticPointer;

    constructor(type: Type<BaseType>, symbol?: string, name?: string) {
        super(type, symbol, name);
        this.nameUtf8 = capi.permaUtf8(this.name);
    }

    getParser(): VoidPointer {
        return new VoidPointer();
    }
}

export abstract class CommandEnum<V> extends CommandEnumBase<EnumResult, V> {
    constructor(symbol: string, name?: string) {
        super(EnumResult, symbol, name || symbol);
    }
}

/**
 * built-in enum wrapper
 * one instance per one enum
 */
export class CommandRawEnum extends CommandEnum<string | number> {
    private static readonly all = new Map<string, CommandRawEnum>();

    private enumIndex = -1;
    private idRegistered = false;
    private parserType: commandParser.Type = commandParser.Type.Int;

    public isBuiltInEnum = false;

    private constructor(public readonly name: string) {
        super(name, name);
        if (CommandRawEnum.all.has(name)) throw Error(`the enum parser already exists (name=${name})`);
        this._update();
        this.isBuiltInEnum = this.enumIndex !== -1;
    }

    private _update(): boolean {
        if (this.enumIndex !== -1) return true; // already hooked
        const registry = bedrockServer.commandRegistry;
        const enumIdex = registry.enumLookup.get(this.name);
        if (enumIdex === null) return false;
        this.enumIndex = enumIdex;

        const enumobj = registry.enums.get(this.enumIndex)!;
        this.parserType = commandParser.getType(enumobj.parser);

        // hook the enum parser, provides extra information.
        const original = makefunc.js(
            enumobj.parser,
            bool_t,
            null,
            CommandRegistry,
            EnumResult,
            StaticPointer,
            CommandOrigin,
            int32_t,
            CxxString,
            CxxVector.make(CxxString),
        );
        enumobj.parser = makefunc.np(
            (registry, storage, tokenPtr, origin, version, error, errorParams) => {
                const ret = original(registry, storage, tokenPtr, origin, version, error, errorParams);

                if (enumResults.delete(storage.getAddressBin())) {
                    const token = tokenPtr.getPointerAs(CommandRegistry.ParseToken);
                    storage.token = token.getText();
                }
                return ret;
            },
            bool_t,
            null,
            CommandRegistry,
            EnumResult,
            StaticPointer,
            CommandOrigin.ref(),
            int32_t,
            CxxString,
            CxxVector.make(CxxString),
        );
        return true;
    }

    addValues(values: string[]): void {
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

    getValues(): string[] {
        const values = new Array<string>();
        if (this.enumIndex === -1) return values;
        const registry = bedrockServer.commandRegistry;
        const enumobj = registry.enums.get(this.enumIndex)!;
        for (const { first: valueIndex } of enumobj.values) {
            values.push(registry.enumValues.get(valueIndex));
        }
        return values;
    }

    getValueCount(): number {
        if (this.enumIndex === -1) return 0;
        const registry = bedrockServer.commandRegistry;
        const enumobj = registry.enums.get(this.enumIndex)!;
        return enumobj.values.size();
    }

    mapValue(value: EnumResult): string | number {
        switch (this.parserType) {
            case commandParser.Type.Unknown:
                return value.token.toLowerCase();
            case commandParser.Type.Int:
                return value.intValue;
            case commandParser.Type.String:
                return value.stringValue;
        }
    }

    static getInstance(name: string): CommandRawEnum {
        let parser = CommandRawEnum.all.get(name);
        if (parser != null) return parser;
        parser = new CommandRawEnum(name);
        CommandRawEnum.all.set(name, parser);
        return parser;
    }
}

class CommandMappedEnum<V extends string | number | symbol> extends CommandEnum<V> {
    public readonly mapper = new Map<string, V>();
    private raw: CommandRawEnum;

    protected _init(): void {
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
            let invalidCharacters = "";
            let matched: RegExpExecArray | null;
            while ((matched = regex.exec(value)) !== null) {
                invalidCharacters += matched[0];
            }
            if (invalidCharacters !== "") throw Error(`${value}: enum value contains invalid characters (${invalidCharacters})`);
        }

        this.raw = CommandRawEnum.getInstance(this.name);
        this.raw.addValues(keys);
        if (this.raw.isBuiltInEnum) {
            console.error(colors.yellow(`Warning, built-in enum is extended(name = ${this.name})`));
        }
    }

    mapValue(value: EnumResult): V {
        // it can return the undefined value if it overlaps the raw enum.
        return this.mapper.get(value.token.toLocaleLowerCase())!;
    }
}

export class CommandStringEnum<T extends string[]> extends CommandMappedEnum<T[number]> {
    public readonly values: T;

    constructor(name: string, ...values: T) {
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

export class CommandIndexEnum<T extends number | string> extends CommandMappedEnum<T> {
    public readonly enum: Record<string, T>;
    constructor(name: string, enumType: Record<string, T>) {
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

    private constructor(name: string) {
        super(CxxString, CxxString.symbol, name);
        if (CommandSoftEnum.all.has(name)) throw Error(`the enum parser already exists (name=${name})`);
        const registry = bedrockServer.commandRegistry;
        this.enumIndex = registry.softEnumLookup.get(this.name) ?? -1;
        if (this.enumIndex === -1) {
            registry.addSoftEnum(this.name, []);
            registry.softEnumLookup.get(this.name);
            this.enumIndex = registry.softEnumLookup.get(this.name) ?? -1;
        }
        // No type id should be registered, it is the type of string
    }

    protected updateValues(mode: SoftEnumUpdateType, values: string[]): void {
        bedrockServer.commandRegistry.updateSoftEnum(mode, this.name, values);
    }

    getParser(): VoidPointer {
        return commandParser.get(CxxString);
    }

    mapValue(value: string): string {
        return value;
    }

    addValues(...values: string[]): void;
    addValues(values: string[]): void;
    addValues(...values: (string | string[])[]): void {
        const first = values[0];
        if (Array.isArray(first)) {
            values = first;
        }
        this.updateValues(SoftEnumUpdateType.Add, values as string[]);
    }

    removeValues(...values: string[]): void;
    removeValues(values: string[]): void;
    removeValues(...values: (string | string[])[]): void {
        const first = values[0];
        if (Array.isArray(first)) {
            values = first;
        }
        this.updateValues(SoftEnumUpdateType.Remove, values as string[]);
    }

    setValues(...values: string[]): void;
    setValues(values: string[]): void;
    setValues(...values: (string | string[])[]): void {
        const first = values[0];
        if (Array.isArray(first)) {
            values = first;
        }
        this.updateValues(SoftEnumUpdateType.Replace, values as string[]);
    }

    getValues(): string[] {
        const values = new Array<string>();
        if (this.enumIndex === -1) return values;
        const enumobj = bedrockServer.commandRegistry.softEnums.get(this.enumIndex)!;
        return enumobj.list.toArray();
    }

    getValueCount(): number {
        if (this.enumIndex === -1) return 0;
        const enumobj = bedrockServer.commandRegistry.softEnums.get(this.enumIndex)!;
        return enumobj.list.size();
    }

    static getInstance(name: string): CommandSoftEnum {
        let parser = CommandSoftEnum.all.get(name);
        if (parser != null) return parser;
        parser = new CommandSoftEnum(name);
        CommandSoftEnum.all.set(name, parser);
        return parser;
    }
}

events.serverOpen.on(() => {
    // To hook parseEnum<class CommandBlockName>; for Command.Block
    CommandRawEnum.getInstance("Block");
});
