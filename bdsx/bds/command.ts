import { abstract } from "../common";
import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { bin64_t, CxxString, int32_t, uint32_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import { CommandOrigin, ServerCommandOrigin } from "./commandorigin";
import { Minecraft } from "./server";

export enum CommandPermissionLevel {
	Normal,
	Operator,
	Host,
	Automation,
	Admin,
}

export enum CommandFlag {
    None
}

export class MCRESULT extends NativeClass {
    result:uint32_t;
}
MCRESULT.define({
    result:uint32_t
});

export class CommandContext extends NativeClass {
    command:CxxString;
    origin:CommandOrigin;
}
CommandContext.abstract({
    command:CxxString,
    origin:ServerCommandOrigin.ref(),
}, 0x30); // dependency problem, SharedPtr.make(CommandContext) needs the structure defination.

export class MinecraftCommands extends NativeClass {
    sender:CommandOutputSender;
    registry:CommandRegistry;
    u2:bin64_t; //1
    minecraft:Minecraft;

    executeCommand(ctx:SharedPtr<CommandContext>, b:boolean):MCRESULT {
        abstract();
    }
}

export class CommandRegistry extends NativeClass {
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
}

export namespace CommandRegistry {
    export class Signature extends NativeClass {
        command:CxxString;
        description:CxxString;
        overloads:CxxVector<Overload>;
    }
    export class Overload extends NativeClass {
        commandVersion:bin64_t;
        allocator:VoidPointer;
        u3:bin64_t;
        u4:bin64_t;
        u5:bin64_t;
        u6:int32_t;
    }
}

export class CommandOutputSender extends NativeClass {
}
