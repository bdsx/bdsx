import { abstract } from "../common";
import { VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { bin64_t, CxxString, uint32_t } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { CommandOrigin } from "./commandorigin";
import { Minecraft } from "./server";

export class MCRESULT extends NativeClass {
    result:uint32_t;
}

export class CommandContext extends NativeClass {
    command:CxxString;
    origin:CommandOrigin;
}

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
