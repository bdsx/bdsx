import { abstract } from "../common";
import { VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { bin64_t, CxxString, uint32_t } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { CommandOrigin, ServerCommandOrigin } from "./commandorigin";
import { Minecraft } from "./server";

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
    u1:VoidPointer;
    u2:bin64_t; //1
    minecraft:Minecraft;

    _executeCommand(ptr:SharedPtr<CommandContext>, b:boolean):MCRESULT {
        abstract();
    }
    executeCommand(ctx:SharedPtr<CommandContext>, b:boolean):MCRESULT {
        return this._executeCommand(ctx, b);
    }
}

export class CommandOutputSender extends NativeClass {
}
