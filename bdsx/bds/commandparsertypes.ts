import { pdb } from "../core";
import { SYMOPT_PUBLICS_ONLY, UNDNAME_NAME_ONLY } from "../dbghelp";
import { bool_t, CxxString, float32_t, int32_t, Type } from "../nativetype";
import { templateName } from "../templatename";
import { RelativeFloat } from "./blockpos";
import { ActorCommandSelector, ActorWildcardCommandSelector, CommandBlock, CommandFilePath, CommandItem, CommandMessage, CommandMobEffect, CommandPosition, CommandPositionFloat, CommandRawText, CommandRegistry, CommandWildcardInt, PlayerCommandSelector, PlayerWildcardCommandSelector } from "./command";
import { JsonValue } from "./connreq";
import { type_id } from "./typeid";

/**
 * types for the command parameter parser
 */
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
    CommandBlock,
    CommandMobEffect,
];

function loadParserFromPdb(types:Type<any>[]):void {
    const symbols = types.map(type=>templateName('CommandRegistry::parse', type.symbol || type.name));
    const enumParserSymbol = 'CommandRegistry::parseEnum<int,CommandRegistry::DefaultIdConverter<int> >';
    symbols.push(enumParserSymbol);

    pdb.setOptions(SYMOPT_PUBLICS_ONLY); // XXX: CommandRegistry::parse<bool> does not found without it.
    const addrs = pdb.getList(pdb.coreCachePath, {}, symbols, false, UNDNAME_NAME_ONLY);
    pdb.setOptions(0);

    for (let i=0;i<types.length;i++) {
        const addr = addrs[symbols[i]];
        if (addr == null) continue;
        CommandRegistry.setParser(types[i], addr);
    }

    CommandRegistry.setEnumParser(addrs[enumParserSymbol]);
}

type_id.pdbimport(CommandRegistry, types);
loadParserFromPdb(types);
type_id.clone(CommandRegistry, ActorWildcardCommandSelector, PlayerWildcardCommandSelector);
CommandRegistry.setParser(PlayerWildcardCommandSelector, CommandRegistry.getParser(ActorWildcardCommandSelector)!);
