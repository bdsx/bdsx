/**
 * on progressing
 */

import { bin, capi, StaticPointer, VoidPointer } from "bdsx";
import { CommandPermissionLevel, CommandRegistry } from "bdsx/bds/command";
import { serverInstance } from "bdsx/bds/server";
import { makefunc } from "bdsx/makefunc";
import { nativeClass, NativeClass, NativeClassType, nativeField } from "bdsx/nativeclass";
import { bin64_t, int32_t, NativeType } from "bdsx/nativetype";

class Command extends NativeClass {
    vftable:Command.VFTable;
    u1:VoidPointer;

    static makeAllocator(this:{new():Command}):VoidPointer {
        const cls = this as NativeClassType<Command>;
        const size = cls[NativeType.size];
        if (!size) throw Error(`${cls.name}: size is not defined`);
        return makefunc.np((returnval:StaticPointer)=>{
            const ptr = capi.malloc(size);
            const cmd = ptr.as(cls);

            returnval.setPointer(cmd);
            return returnval;
        }, StaticPointer, null, StaticPointer);
    }
}
namespace Command {
    export class VFTable extends NativeClass {
        destructor:VoidPointer;
        purecall:VoidPointer;
        completeObjectLocator:_s_RTTICompleteObjectLocator;
    }
}
Command.define({
    vftable: Command.VFTable,
    u1: VoidPointer,
}, 0x20);

class CustomCommand extends Command {
}

const COL_SIG_REV0 = 0;
const COL_SIG_REV1 = 1;

@nativeClass()
class _s_RTTICompleteObjectLocator extends NativeClass {
    @nativeField(int32_t)
    signature:int32_t;
    @nativeField(int32_t)
    offset:int32_t;
    @nativeField(int32_t)
    cdOffset:int32_t;
    @nativeField(int32_t)
    pTypeDescriptor:int32_t;	// Image relative offset of TypeDescriptor
    @nativeField(int32_t)
    pClassDescriptor:int32_t;	// Image relative offset of _RTTIClassHierarchyDescriptor
    @nativeField(int32_t)
    pSelf:int32_t;				// Image relative offset of this object
}

// import './example_and_test'; // remove this if it's not necessary for you

// commands.list.description
const cmdreg = serverInstance.minecraft.commands.registry;
cmdreg.registerCommand('testcommand', 'test command', CommandPermissionLevel.Normal, 8, 40);
const cmd = cmdreg.findCommand('testcommand')!;
const overload = new CommandRegistry.Overload(true);
overload.commandVersion = bin.make64(1, 0x7fffffff);
overload.allocator = CustomCommand.makeAllocator();
overload.u3 = bin64_t.zero;
overload.u4 = bin64_t.zero;
overload.u5 = bin64_t.zero;
overload.u6 = -1;
cmd.overloads.push(overload);
cmdreg.registerOverloadInternal(cmd, overload);
