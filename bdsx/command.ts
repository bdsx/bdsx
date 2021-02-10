
import Event, { CapsuledEvent, EventEx } from 'krevent';
import { asm, Register } from './assembler';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { CommandRequestPacket } from './bds/packets';
import { proc, procHacker } from './bds/proc';
import { CommandContext, MCRESULT, MinecraftCommands } from './bds/server';
import { CANCEL, RawTypeId } from './common';
import { makefunc } from './makefunc';
import { SharedPtr } from './sharedpointer';
import { _tickCallback } from './util';
import netevent = require('./netevent');

export function hookingForCommand(): void {
    function oncommand(commands: MinecraftCommands, res: MCRESULT, ctxptr: SharedPtr<CommandContext>, b: boolean): number {
        const ctx = ctxptr.p!;
        const name = ctx.origin.getName();
        const resv = hookev.fire(ctxptr.p!.command, name, ctx);
        switch (typeof resv) {
        case 'number':
            res.result = resv;
            _tickCallback();
            return 1;
        default:
            _tickCallback();
            return 0;
        }
    }
    const callback = makefunc.np(oncommand, RawTypeId.Int32, null, MinecraftCommands, MCRESULT, SharedPtr.make(CommandContext), RawTypeId.Boolean);
    // int32_t callback(MinecraftCommands* commands, MCRESULT* res, SharedPtr<CommandContext>* ctx, bool)

    const ORIGINAL_CODE = [
        0x4C, 0x89, 0x45, 0xB0, // mov qword ptr ss:[rbp-50],r8
        0x49, 0x8B, 0x00, // mov rax,qword ptr ds:[r8]
        0x48, 0x8B, 0x48, 0x20, // mov rcx,qword ptr ds:[rax+20]
        0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
    ];

    const newcode = asm()
    .mov_r_r(Register.rcx, Register.rsp)
    .sub_r_c(Register.rsp, 0x28)
    .call64(callback, Register.rax)
    .add_r_c(Register.rsp, 0x28)
    .test_r_r(Register.rax, Register.rax)
    .jz_label('skip')
    .pop_r(Register.rcx)
    .jmp64(proc['MinecraftCommands::executeCommand'].add(0x73b), Register.rax)
    .label('skip')
    .mov_rp_r(Register.rbp, -0x50, Register.rsi)
    .mov_r_rp(Register.rax, Register.rsi, 0)
    .mov_r_rp(Register.rcx, Register.rax, 0x20)
    .mov_r_rp(Register.rax, Register.rcx, 0)
    .ret()
    .alloc();

    procHacker.patching('command-hook', 'MinecraftCommands::executeCommand', 0x40, newcode, Register.rax, true, ORIGINAL_CODE, []);
}

// 	m_props.insert(u"execSync", JsFunction::makeT([](Text16 path, JsValue curdir) {
// 		return (AText)shell(path, curdir != undefined ? curdir.cast<Text16>().data() : nullptr);
// 		}));

interface CommandEvent {
    readonly command: string;
    readonly networkIdentifier: NetworkIdentifier;

    setCommand(command: string): void;
}

class CommandEventImpl implements CommandEvent {
    public isModified = false;

    constructor(
        public command: string,
        public networkIdentifier: NetworkIdentifier
    ) {
    }

    setCommand(command: string): void {
        this.isModified = true;
        this.command = command;
    }
}
type UserCommandListener = (ev: CommandEvent) => void | CANCEL;
type HookCommandListener = (command: string, originName: string, ctx: CommandContext) => void | number;

class UserCommandEvents extends EventEx<UserCommandListener> {
    private readonly listener = (ptr: CommandRequestPacket, networkIdentifier: NetworkIdentifier, packetId: MinecraftPacketIds):void|CANCEL => {
        const command = ptr.command;
        const ev = new CommandEventImpl(command, networkIdentifier);
        if (this.fire(ev) === CANCEL) return CANCEL;
        if (ev.isModified) {
            ptr.command = ev.command;
        }
    };

    onStarted(): void {
        netevent.before(MinecraftPacketIds.CommandRequest).on(this.listener);
    }
    onCleared(): void {
        netevent.before(MinecraftPacketIds.CommandRequest).remove(this.listener);
    }
}

const hookev = new Event<HookCommandListener>();

/** @deprecated use netevent.before(MinecraftPacketIds.CommandRequest).on */
export const net = new UserCommandEvents() as CapsuledEvent<UserCommandListener>;

export const hook = hookev as CapsuledEvent<HookCommandListener>;
