/**
 * These are unit tests for bdsx
 */

import { Actor, bin, CANCEL, command, MinecraftPacketIds, NativePointer, netevent, NetworkIdentifier, serverControl, serverInstance } from "bdsx";
import { asm, FloatRegister, Register } from "bdsx/assembler";
import { ActorType, DimensionId } from "bdsx/bds/actor";
import { networkHandler } from "bdsx/bds/networkidentifier";
import { proc2 } from "bdsx/bds/symbols";
import { capi } from "bdsx/capi";
import { disasm } from "bdsx/disassembler";
import { dll } from "bdsx/dll";
import { HashSet } from "bdsx/hashset";
import { bedrockServer } from "bdsx/launcher";
import { RawTypeId } from "bdsx/makefunc";
import { bin64_t, NativeType } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { PseudoRandom } from "bdsx/pseudorandom";
import { Tester } from "bdsx/tester";

let sendidcheck = 0;
let nextTickPassed = false;
let chatCancelCounter = 0;

export function setRecentSendedPacketForTest(packetId: number): void {
    sendidcheck = packetId;
}

Tester.test({
    async globals() {
        this.assert(!!serverInstance && serverInstance.isNotNull(), 'serverInstance not found');
        this.assert(serverInstance.vftable.equals(proc2["??_7ServerInstance@@6BAppPlatformListener@@@"]),
            'serverInstance is not ServerInstance');
        this.assert(!!networkHandler && networkHandler.isNotNull(), 'networkHandler not found');
        this.assert(networkHandler.vftable.equals(proc2["??_7NetworkHandler@@6BIGameConnectionInfoProvider@Social@@@"]),
            'networkHandler is not NetworkHandler');
        const inst = networkHandler.instance;
        this.assert(!!inst && inst.isNotNull(), 'RaknetInstance not found');
        this.assert(inst.vftable.equals(proc2["??_7RakNetInstance@@6BConnector@@@"]),
            'networkHandler.instance is not RaknetInstance');

        const rakpeer = inst.peer;
        this.assert(!!rakpeer && rakpeer.isNotNull(), 'RakNet::RakPeer not found');
        this.assert(rakpeer.vftable.equals(proc2["??_7RakPeer@RakNet@@6BRakPeerInterface@1@@"]),
            'networkHandler.instance.peer is not RakNet::RakPeer');

        this.assert(serverInstance.scriptEngine.vftable.equals(proc2['??_7MinecraftServerScriptEngine@@6BScriptFramework@ScriptApi@@@']),
            'serverInstance.scriptEngine is not ScriptFrameWork');

        this.assert(serverInstance.scriptEngine.scriptEngineVftable.equals(proc2['??_7MinecraftServerScriptEngine@@6B@']),
            'serverInstance.scriptEngine wrong vftable offset');
    },

    async nexttick() {
        nextTickPassed = await Promise.race([
            new Promise<boolean>(resolve => process.nextTick(() => resolve(true))),
            new Promise<boolean>(resolve => setTimeout(() => {
                if (nextTickPassed) return;
                this.fail();
                resolve(false);
            }, 1000))
        ]);
    },

    disasm() {
        const assert = (hex: string, code: string) => {
            const asmcode = disasm.check(hex, true).toString().replace(/\n/g, ';');
            this.assert(asmcode === code, `expected=${code}, actual=${asmcode}`);
        };
        assert('0F 84 7A 06 00 00 55 56 57 41 54 41 55 41 56', 'je 0x67a;push rbp;push rsi;push rdi;push r12;push r13;push r14');
        assert('80 79 48 00 48 8B D9 74 18 48 83 C1 38', 'cmp byte ptr [rcx+0x48], 0x0;mov rbx, rcx;je 0x18;add rcx, 0x38');
        assert('0F 29 74 24 20 49 8B D8 E8 8D 0D FE FF', 'movaps xmmword ptr [rsp+0x20], xmm6;mov rbx, r8;call -0x1f273');
    },

    chat() {
        netevent.before(MinecraftPacketIds.Text).on((packet, ni) => {
            if (packet.message == "TEST YEY!") {
                const MAX_CHAT = 5;
                chatCancelCounter++;
                this.log(`test (${chatCancelCounter}/${MAX_CHAT})`);
                this.assert(connectedNi === ni, 'the network identifier does not matched');
                if (chatCancelCounter === MAX_CHAT) {
                    this.log('> tested and stopping...');
                    setTimeout(() => serverControl.stop(), 1000);
                }
                return CANCEL;
            }
        });
    },

    actor() {
        const system = server.registerSystem(0, 0);
        system.listenForEvent('minecraft:entity_created', ev => {
            try {
                const uniqueId = ev.data.entity.__unique_id__;
                const actor2 = Actor.fromUniqueId(uniqueId["64bit_low"], uniqueId["64bit_high"]);
                const actor = Actor.fromEntity(ev.data.entity);
                this.assert(actor === actor2, 'Actor.fromEntity is not matched');

                if (actor !== null) {
                    this.assert(actor.getDimension() === DimensionId.Overworld, 'getDimension() is not overworld');

                    const actualId = actor.getUniqueIdLow() + ':' + actor.getUniqueIdHigh();
                    const expectedId = uniqueId["64bit_low"] + ':' + uniqueId["64bit_high"];
                    this.assert(actualId === expectedId,
                        `Actor uniqueId is not matched (actual=${actualId}, expected=${expectedId})`);

                    if (ev.data.entity.__identifier__ === 'minecraft:player') {
                        const name = system.getComponent(ev.data.entity, 'minecraft:nameable')!.data.name;
                        this.assert(name === connectedId, 'id does not matched');
                        this.assert(actor.getTypeId() === ActorType.Player, 'player type does not matched');
                        this.assert(actor.isPlayer(), 'player is not the player');
                        this.assert(connectedNi === actor.getNetworkIdentifier(), 'the network identifier does not matched');
                    } else {
                        this.assert(!actor.isPlayer(), `no player is the player(identifier:${ev.data.entity.__identifier__})`);
                    }
                }
            } catch (err) {
                this.processError(err);
            }
        });
    },

    bin() {
        this.assert(bin.make64(1, 0) === bin64_t.one, '[test] bin.make64(1, 0) failed');
        this.assert(bin.make64(0, 0) === bin64_t.zero, '[test] bin.make64(0, 0) failed');
        this.assert(bin.make64(-1, -1) === bin64_t.minus_one, '[test] bin.make64(-1, -1) failed');
        const small = bin.make64(0x100, 0);
        this.assert(small === '\u0100\0\0\0', '[test] bin.make64(0x100, 0) failed');
        const big = bin.make64(0x10002, 0);
        this.assert(big === '\u0002\u0001\0\0', '[test] bin.make64(0x10002, 0) failed');
        this.assert(bin.sub(big, small) === '\uff02\0\0\0', '[test] bin.sub() failed');
        const big2 = bin.add(big, bin.add(big, small));
        this.assert(big2 === '\u0104\u0002\0\0', '[test] bin.add() failed');
        const bigbig = bin.add(bin.add(bin.muln(big2, 0x100000000), small), bin64_t.one);
        this.assert(bigbig === '\u0101\u0000\u0104\u0002', '[test] bin.muln() failed');
        const dived = bin.divn(bigbig, 2);
        this.assert(dived[0] === '\u0080\u0000\u0082\u0001', '[test] bin.divn() failed');
        this.assert(dived[1] === 1, '[test] bin.divn() failed');
        this.assert(bin.toString(dived[0], 16) === '1008200000080', '[test] bin.toString() failed');

        const ptr = capi.malloc(10);
        try {
            const bignum = bin.makeVar(123456789012345);
            ptr.add().writeVarBin(bignum);
            this.assert(ptr.add().readVarBin() === bignum, '[test] writevarbin / readvarbin failed');
        } finally {
            capi.free(ptr);
        }
    },

    hashset() {
        class HashItem {
            constructor(public readonly value: number) {
            }

            hash(): number {
                return this.value;
            }

            equals(other: HashItem): boolean {
                return this.value === other.value;
            }
        }

        const TEST_COUNT = 200;

        const values: number[] = [];
        const n = new PseudoRandom(12345);
        const hashset = new HashSet<HashItem>();
        let count = 0;
        for (const v of hashset.entires()) {
            count++;
        }
        if (count !== 0) this.error(`empty hashset is not empty`);
        for (let i = 0; i < TEST_COUNT;) {
            const v = n.rand() % 100;
            values.push(v);
            hashset.add(new HashItem(v));

            i++;
        }

        for (const v of values) {
            if (!hashset.has(new HashItem(v))) {
                this.error(`hashset.has failed, item not found ${v}`);
                continue;
            }
            if (!hashset.delete(new HashItem(v))) {
                this.error(`hashset.delete failed ${v}`);
                continue;
            }
        }
        if (hashset.size !== 0) {
            this.error(`cleared hashset is not cleared: ${hashset.size}`);
        }
        for (let i = 0; i < 200; i++) {
            const v = n.rand() % 100;
            if (hashset.has(new HashItem(v))) {
                this.error('hashset.has failed, found on empty');
            }
        }

    },

    memset(): void {
        const dest = new Uint8Array(12);
        const ptr = new NativePointer;
        ptr.setAddressFromBuffer(dest);
        dll.vcruntime140.memset(ptr, 1, 12);
        for (const v of dest) {
            this.assert(v === 1, 'wrong value: ' + v);
        }
    },

    nethook() {
        let idcheck = 0;
        let sendpacket = 0;
        for (let i = 0; i < 255; i++) {
            netevent.raw(i).on((ptr, size, ni, packetId) => {
                idcheck = packetId;
                this.assert(size > 0, `packet size is too little`);
                this.assert(packetId === (ptr.readVarUint() & 0x3ff), `different packetId in buffer. id=${packetId}`);
            });
            netevent.before<MinecraftPacketIds>(i).on((ptr, ni, packetId) => {
                this.assert(packetId === idcheck, `different packetId on before. id=${packetId}`);
                this.assert(ptr.getId() === idcheck, `different class.packetId on before. id=${packetId}`);
            });
            netevent.after<MinecraftPacketIds>(i).on((ptr, ni, packetId) => {
                this.assert(packetId === idcheck, `different packetId on after. id=${packetId}`);
                this.assert(ptr.getId() === idcheck, `different class.packetId on after. id=${packetId}`);
            });
            netevent.send<MinecraftPacketIds>(i).on((ptr, ni, packetId) => {
                sendidcheck = packetId;
                this.assert(ptr.getId() === packetId, `different class.packetId on send. id=${packetId}`);
                sendpacket++;
            });
            netevent.sendRaw(i).on((ptr, size, ni, packetId) => {
                this.assert(size > 0, `packet size is too little`);
                this.assert(packetId === sendidcheck, `different packetId on sendRaw. id=${packetId}`);
                this.assert(packetId === (ptr.readVarUint() & 0x3ff), `different packetId in buffer. id=${packetId}`);
                sendpacket++;
            });
        }

        const conns = new Set<NetworkIdentifier>();
        netevent.after(MinecraftPacketIds.Login).on((ptr, ni) => {
            this.assert(!conns.has(ni), '[test] logined without connected');
            conns.add(ni);
            setTimeout(() => {
                if (sendpacket === 0) {
                    this.error('[test] no send packet');
                }
            }, 1000);
        });
        NetworkIdentifier.close.on(ni => {
            this.assert(conns.delete(ni), '[test] disconnected without connected');
        });
    },

    cxxstring() {
        const str = new CxxStringWrapper(true);
        str[NativeType.ctor]();
        this.assert(str.length === 0, 'std::string invalid constructor');
        this.assert(str.capacity === 15, 'std::string invalid constructor');
        const shortcase = '111';
        const longcase = '123123123123123123123123';
        str.value = shortcase;
        this.assert(str.value === shortcase, 'failed with short text');
        str.value = longcase;
        this.assert(str.value === longcase, 'failed with long text');
        str[NativeType.dtor]();
    },

    makefunc() {
        const floatToDouble = asm().cvtss2sd_r_r(FloatRegister.xmm0, FloatRegister.xmm0).ret().make(RawTypeId.Float64, null, RawTypeId.Float32);
        this.assert(floatToDouble(123) === 123, 'float to double');
        const doubleToFloat = asm().cvtsd2ss_r_r(FloatRegister.xmm0, FloatRegister.xmm0).ret().make(RawTypeId.Float32, null, RawTypeId.Float64);
        this.assert(doubleToFloat(123) === 123, 'double to float');
        const getbool = asm().mov_r_c(Register.rax, 0x100).ret().make(RawTypeId.Boolean);
        this.assert(getbool() === false, 'bool return');
        const bool2int = asm().mov_r_r(Register.rax, Register.rcx).ret().make(RawTypeId.Int32, null, RawTypeId.Boolean);
        this.assert(bool2int(true) === 1, 'bool to int');
    },

    async command() {
        let passed = false;
        command.hook.on((cmd, origin, ctx) => {
            if (cmd === '/__dummy_command') {
                passed = origin === 'Server';
                ctx.origin.getDimension();
                const pos = ctx.origin.getWorldPosition();
                this.assert(pos.x === 0 && pos.y === 0 && pos.z === 0, 'world pos is not zero');
                const actor = ctx.origin.getEntity();
                this.assert(actor === null, 'origin.getEntity() is not null');
                const size = ctx.origin.getLevel().players.size();
                this.assert(size === 0, 'origin.getLevel().players.size is not zero');
            }
        });
        await new Promise<void>((resolve) => {
            bedrockServer.commandOutput.on(output => {
                if (output.startsWith('Unknown command: __dummy_command')) {
                    if (passed) resolve();
                    else this.error('command.hook.listener failed');
                    return CANCEL;
                }
            });
            bedrockServer.executeCommandOnConsole('__dummy_command');
        })
    },

});

let connectedNi: NetworkIdentifier;
let connectedId: string;

netevent.raw(MinecraftPacketIds.Login).on((ptr, size, ni) => {
    connectedNi = ni;
});
netevent.after(MinecraftPacketIds.Login).on(ptr => {
    connectedId = ptr.connreq.cert.getId();
});


