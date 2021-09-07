/**
 * These are unit tests for bdsx
 */

import { asm, FloatRegister, OperationSize, Register } from "bdsx/assembler";
import { Actor, ActorType, DimensionId } from "bdsx/bds/actor";
import { CommandContext } from "bdsx/bds/command";
import { JsonValue } from "bdsx/bds/connreq";
import { HashedString } from "bdsx/bds/hashedstring";
import { networkHandler, NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { AttributeData, PacketIdToType } from "bdsx/bds/packets";
import { serverInstance } from "bdsx/bds/server";
import { proc, proc2 } from "bdsx/bds/symbols";
import { bin } from "bdsx/bin";
import { capi } from "bdsx/capi";
import { CANCEL, emptyFunc } from "bdsx/common";
import { NativePointer } from "bdsx/core";
import { CxxMap } from "bdsx/cxxmap";
import { CxxVector, CxxVectorToArray } from "bdsx/cxxvector";
import { disasm } from "bdsx/disassembler";
import { dll } from "bdsx/dll";
import { events } from "bdsx/event";
import { Event } from "bdsx/eventtarget";
import { HashSet } from "bdsx/hashset";
import { bedrockServer } from "bdsx/launcher";
import { makefunc } from "bdsx/makefunc";
import { RelativeFloat } from "bdsx/minecraft";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, float64_t, GslStringSpan, int16_t, int32_t, uint16_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { PseudoRandom } from "bdsx/pseudorandom";
import { Tester } from "bdsx/tester";
import { hex } from "bdsx/util";

let sendidcheck = 0;
let nextTickPassed = false;
let chatCancelCounter = 0;

export function setRecentSendedPacketForTest(packetId: number): void {
    sendidcheck = packetId;
}

Tester.test({
    async globals() {
        this.assert(serverInstance.isNotNull(), 'serverInstance not found');
        this.assert(serverInstance.vftable.equals(proc2['??_7ServerInstance@@6BEnableNonOwnerReferences@Bedrock@@@']),
            'serverInstance is not ServerInstance');
        this.assert(networkHandler.isNotNull(), 'networkHandler not found');
        this.assert(networkHandler.vftable.equals(proc2['??_7NetworkHandler@@6BIGameConnectionInfoProvider@Social@@@']),
            'networkHandler is not NetworkHandler');
        this.assert(serverInstance.minecraft.vftable.equals(proc["Minecraft::`vftable'"]), 'minecraft is not Minecraft');
        this.assert(serverInstance.minecraft.getCommands().sender.vftable.equals(proc["CommandOutputSender::`vftable'"]), 'sender is not CommandOutputSender');

        this.assert(networkHandler.instance.vftable.equals(proc2["??_7RakNetInstance@@6BConnector@@@"]),
            'networkHandler.instance is not RaknetInstance');

        this.assert(networkHandler.instance.peer.vftable.equals(proc2["??_7RakPeer@RakNet@@6BRakPeerInterface@1@@"]),
            'networkHandler.instance.peer is not RakNet::RakPeer');

        const shandle = serverInstance.minecraft.getServerNetworkHandler();
        shandle.setMotd('TestMotd');
        this.equals(shandle.motd, 'TestMotd', 'unexpected motd');

        serverInstance.setMaxPlayers(10);
        this.equals(shandle.maxPlayers, 10, 'unexpected maxPlayers');
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
        const assert = (hexcode: string, asmcode: string, nonsamehex:boolean = false) => {
            const opers = disasm.check(hexcode, true);
            const disasem = opers.toString().replace(/\n/g, ';');
            this.equals(disasem, asmcode, ``);
            if (!nonsamehex) this.equals(hex(opers.asm().buffer()), hexcode.toUpperCase());
        };

        assert('f3 0f 11 89 a4 03 00 00', 'movss dword ptr [rcx+0x3a4], xmm1');
        assert('0F 84 7A 06 00 00 55 56 57 41 54 41 55 41 56', 'je 0x67a;push rbp;push rsi;push rdi;push r12;push r13;push r14');
        assert('80 79 48 00 74 18 48 83 C1 38', 'cmp byte ptr [rcx+0x48], 0x0;je 0x18;add rcx, 0x38');
        assert('48 8B D9', 'mov rbx, rcx', true);
        assert('0F 29 74 24 20 E8 8D 0D FE FF', 'movaps xmmword ptr [rsp+0x20], xmm6;call -0x1f273');
        assert('49 8B D8', 'mov rbx, r8', true);
        assert('48 8d 40 01', 'lea rax, qword ptr [rax+0x1]');
        assert('0F 10 02 48 8D 59 08 48 8D 54 24 20', 'movups xmm0, xmmword ptr [rdx];lea rbx, qword ptr [rcx+0x8];lea rdx, qword ptr [rsp+0x20]');
        assert('48 8B CB', 'mov rcx, rbx', true);
        assert('0F 10 02', 'movups xmm0, xmmword ptr [rdx]');
        assert('48 0f b6 c1', 'movzx rax, cl');
        assert('0f b6 c1', 'movzx eax, cl');
        assert('0f b7 c0', 'movzx eax, ax');
        assert('0f b6 c0', 'movzx eax, al');
        assert('0f bf c0', 'movsx eax, ax');
        assert('0f be 00', 'movsx eax, byte ptr [rax]');
        assert('44 0F B6 C1 49 BA B3 01 00 00 00 01 00 00', 'movzx r8d, cl;movabs r10, 0x100000001b3');
        assert('48 8D 04 40', 'lea rax, qword ptr [rax+rax*2]');
        assert('48 8D 14 59', 'lea rdx, qword ptr [rcx+rbx*2]');
        assert('0f 90 c0 0f 90 c1 0f 91 c0 0f 91 c1 0f 91 00', 'seto al;seto cl;setno al;setno cl;setno byte ptr [rax]');
        assert('ff 81 c0 07 00 00 48 ff c0 48 ff 00 48 ff 08 48 ff c0 ff 18 ff 10 ff 28 ff e0',
            'inc dword ptr [rcx+0x7c0];inc rax;inc qword ptr [rax];dec qword ptr [rax];inc rax;call fword ptr [rax];call qword ptr [rax];jmp fword ptr [rax];jmp rax');
        assert('41 b0 01 ba 38 00 00 00 48 89 CB e8 aa 6c fb ff',
            'mov r8b, 0x1;mov edx, 0x38;mov rbx, rcx;call -0x49356');
        this.assert(disasm.check('82', true).size === 0, 'asm bad');
        const opers = disasm.check('82', {
            fallback(asm){
                if (asm.readUint8() === 0x82) {
                    return 1; // opcode size
                } else {
                    return null; // failed
                }
            }, quiet: true});
        this.assert(opers.size === 1, 'fallback');
    },

    bin() {
        this.equals(bin.make64(1, 0), bin64_t.one, 'bin.make64(1, 0)', bin.toString);
        this.equals(bin.make64(0, 0), bin64_t.zero, 'bin.make64(0, 0)', bin.toString);
        this.equals(bin.make64(-1, -1), bin64_t.minus_one, 'bin.make64(-1, -1)', bin.toString);
        const small = bin.make64(0x100, 0);
        this.equals(small, '\u0100\0\0\0', 'bin.make64(0x100, 0)', bin.toString);
        const big = bin.make64(0x10002, 0);
        this.equals(big, '\u0002\u0001\0\0', 'bin.make64(0x10002, 0)', bin.toString);
        this.equals(bin.sub(big, small), '\uff02\0\0\0', 'bin.sub()', bin.toString);
        const big2 = bin.add(big, bin.add(big, small));
        this.equals(big2, '\u0104\u0002\0\0', 'bin.add()', bin.toString);
        const bigbig = bin.add(bin.add(bin.muln(big2, 0x100000000), small), bin64_t.one);
        this.equals(bigbig, '\u0101\u0000\u0104\u0002', 'bin.muln()', bin.toString);
        const dived = bin.divn(bigbig, 2);
        this.equals(dived[0], '\u0080\u0000\u0082\u0001', 'bin.divn()', bin.toString);
        this.equals(dived[1], 1, 'bin.divn()');
        this.equals(bin.toString(dived[0], 16), '1008200000080', 'bin.toString()');

        const ptr = capi.malloc(10);
        try {
            const bignum = bin.makeVar(123456789012345);
            ptr.add().writeVarBin(bignum);
            this.equals(ptr.add().readVarBin(), bignum, 'writevarbin / readvarbin', bin.toString);
        } finally {
            capi.free(ptr);
        }

        this.equals(bin.bitshl('\u1000\u0100\u0010\u1001', 0), '\u1000\u0100\u0010\u1001', 'bin.bitshl(0)', v=>bin.toString(v, 16));
        this.equals(bin.bitshr('\u1001\u0100\u0010\u0001', 0), '\u1001\u0100\u0010\u0001', 'bin.bitshr(0)', v=>bin.toString(v, 16));
        this.equals(bin.bitshl('\u1000\u0100\u0010\u1001', 4), '\u0000\u1001\u0100\u0010', 'bin.bitshl(4)', v=>bin.toString(v, 16));
        this.equals(bin.bitshr('\u1001\u0100\u0010\u0001', 4), '\u0100\u0010\u1001\u0000', 'bin.bitshr(4)', v=>bin.toString(v, 16));
        this.equals(bin.bitshl('\u1000\u0100\u0010\u1001', 16), '\u0000\u1000\u0100\u0010', 'bin.bitshl(16)', v=>bin.toString(v, 16));
        this.equals(bin.bitshr('\u1001\u0100\u0010\u0001', 16), '\u0100\u0010\u0001\u0000', 'bin.bitshr(16)', v=>bin.toString(v, 16));
        this.equals(bin.bitshl('\u1000\u0100\u0010\u1001', 20), '\u0000\u0000\u1001\u0100', 'bin.bitshl(20)', v=>bin.toString(v, 16));
        this.equals(bin.bitshr('\u1001\u0100\u0010\u0001', 20), '\u0010\u1001\u0000\u0000', 'bin.bitshr(20)', v=>bin.toString(v, 16));
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
        for (const v of hashset.values()) {
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

    memset() {
        const dest = new Uint8Array(12);
        const ptr = new NativePointer;
        ptr.setAddressFromBuffer(dest);
        dll.vcruntime140.memset(ptr, 1, 12);
        for (const v of dest) {
            this.equals(v, 1, 'wrong value: ' + v);
        }
    },

    cxxstring() {
        const str = CxxStringWrapper.construct();
        this.equals(str.length, 0, 'std::string invalid constructor');
        this.equals(str.capacity, 15, 'std::string invalid constructor');
        const shortcase = '111';
        const longcase = '123123123123123123123123';
        str.value = shortcase;
        this.equals(str.value, shortcase, 'failed with short text');
        str.value = longcase;
        this.equals(str.value, longcase, 'failed with long text');
        str.destruct();

        const hstr = HashedString.construct();
        this.equals(hstr.str, '', 'Invalid string');
        hstr.destruct();

        const data = AttributeData.construct();
        this.equals(data.name.str, '', 'Invalid string');
        data.destruct();
    },

    makefunc() {
        const test = asm().mov_rp_c(Register.rcx, 1, 0, 1, OperationSize.dword).mov_r_r(Register.rax, Register.rcx).make(int32_t, {structureReturn:true});
        this.equals(test(), 1, 'structureReturn int32_t');
        const floatToDouble = asm().cvtss2sd_f_f(FloatRegister.xmm0, FloatRegister.xmm0).make(float64_t, null, float32_t);
        this.equals(floatToDouble(123), 123, 'float to double');
        const doubleToFloat = asm().cvtsd2ss_f_f(FloatRegister.xmm0, FloatRegister.xmm0).make(float32_t, null, float64_t);
        this.equals(doubleToFloat(123), 123, 'double to float');
        const getbool = asm().mov_r_c(Register.rax, 0x100).make(bool_t);
        this.equals(getbool(), false, 'bool return');
        const bool2int = asm().mov_r_r(Register.rax, Register.rcx).make(int32_t, null, bool_t);
        this.equals(bool2int(true), 1, 'bool to int');
        const int2short_as_int = asm().movzx_r_r(Register.rax, Register.rcx, OperationSize.dword, OperationSize.word).make(int32_t, null, int32_t);
        this.equals(int2short_as_int(-1), 0xffff, 'int to short old');
        const int2short = asm().movzx_r_r(Register.rax, Register.rcx, OperationSize.dword, OperationSize.word).make(int16_t, null, int32_t);
        this.equals(int2short(-1), -1, 'int to short');
        this.equals(int2short(0xffff), -1, 'int to short');
        const int2ushort = asm().movzx_r_r(Register.rax, Register.rcx, OperationSize.dword, OperationSize.word).make(uint16_t, null, int32_t);
        this.equals(int2ushort(-1), 0xffff, 'int to ushort');
        this.equals(int2ushort(0xffff), 0xffff, 'int to ushort');
        const string2string = asm().mov_r_r(Register.rax, Register.rcx).make(CxxString, null, CxxString);
        this.equals(string2string('test'), 'test', 'string to string');
        this.equals(string2string('testtesta'), 'testtesta', 'test string over 8 bytes');
        this.equals(string2string('test string over 15 bytes'), 'test string over 15 bytes', 'string to string');
        const nullreturn = asm().xor_r_r(Register.rax, Register.rax).make(NativePointer);
        this.equals(nullreturn(), null, 'nullreturn does not return null');

        const gslstringspan = asm().mov_r_r(Register.rax, Register.rcx).ret().make(GslStringSpan, null, GslStringSpan);
        this.equals(gslstringspan('test'), 'test', 'gslstringspan() failed');

        const overTheFour = asm().mov_r_rp(Register.rax, Register.rsp, 1, 0x28).make(int32_t, null, int32_t, int32_t, int32_t, int32_t, int32_t);
        this.equals(overTheFour(0, 0, 0, 0, 1234), 1234, 'makefunc.js, overTheFour failed');
        const overTheFiveNative = makefunc.np(overTheFour, int32_t, null, int32_t, int32_t, int32_t, int32_t, int32_t);
        const overTheFiveRewrap = makefunc.js(overTheFiveNative, int32_t, null, int32_t, int32_t, int32_t, int32_t, int32_t);
        this.equals(overTheFiveRewrap(0, 0, 0, 0, 1234), 1234, 'makefunc.np, overTheFour failed');

        const CxxStringVectorToArray = CxxVectorToArray.make(CxxString);
        const CxxStringVector = CxxVector.make(CxxString);
        const class_to_array = asm().mov_r_r(Register.rax, Register.rcx).make(CxxStringVectorToArray, null, CxxStringVector);
        const clsvector = CxxStringVector.construct();
        clsvector.push('a','b','c','d');
        this.equals(class_to_array(clsvector).join(','), 'a,b,c,d', 'CxxVectorToArray, class_to_array');
        clsvector.destruct();

        const array_to_array = asm().mov_r_r(Register.rax, Register.rcx).make(CxxStringVectorToArray, null, CxxStringVectorToArray);
        this.equals(array_to_array(['a','b','c','d']).join(','), 'a,b,c,d', 'CxxVectorToArray, array_to_array');

        const rfloat_to_bin = asm().mov_r_r(Register.rax, Register.rcx).make(bin64_t, null, RelativeFloat);
        const value = RelativeFloat.create(123, true);
        this.equals(rfloat_to_bin(value), value.bin_value, 'rfloat_to_bin');
    },

    vectorcopy() {
        @nativeClass()
        class Class extends NativeClass {
            @nativeField(CxxVector.make(CxxString))
            vector:CxxVector<CxxString>;
            @nativeField(CxxVector.make(CxxStringWrapper))
            vector2:CxxVector<CxxStringWrapper>;
            @nativeField(CxxVector.make(CxxVector.make(CxxString)))
            vector3:CxxVector<CxxVector<CxxString>>;
        }

        const a = new Class(true);
        a.construct();
        a.vector.push('test');
        const str = new CxxStringWrapper(true);
        str.construct();
        str.value = 'test2';
        a.vector2.push(str);

        this.equals(a.vector.size(), 1, 'a.vector, invalid size');
        this.equals(a.vector2.size(), 1, 'a.vector2, invalid size');
        this.equals(a.vector.get(0), 'test', `a.vector, invalid value ${a.vector.get(0)}`);
        this.equals(a.vector2.get(0)!.value, 'test2', `a.vector2, invalid value ${a.vector2.get(0)!.value}`);

        const b = new Class(true);
        b.construct(a);
        this.equals(b.vector.size(), 1, 'b.vector, invalid size');
        this.equals(b.vector2.size(), 1, 'b.vector2, invalid size');
        this.equals(b.vector.get(0), 'test', `b.vector, invalid value ${b.vector.get(0)}`);
        this.equals(b.vector2.get(0)!.value, 'test2', `b.vector2, invalid value ${b.vector2.get(0)!.value}`);
        b.vector.get(0);

        b.destruct();

        a.vector.push('test1', 'test2', 'test3');
        this.equals(a.vector.size(), 4, 'a.vector, invalid size');
        this.equals([...a.vector].join(','), 'test,test1,test2,test3', 'a.vector, invalid size');

        a.destruct();

        for (let i=0;i<10;i++) {
            const vec = CxxVector.make(CxxString).construct();
            vec.push("1111111122222222");
            this.equals(vec.toArray().join(','), '1111111122222222', 'vector push 1');
            vec.push("2");
            this.equals(vec.toArray().join(','), '1111111122222222,2', 'vector push 2');
            vec.push("3");
            this.equals(vec.toArray().join(','), '1111111122222222,2,3', 'vector push 3');
            vec.push("4");
            this.equals(vec.toArray().join(','), '1111111122222222,2,3,4', 'vector push 4');
            vec.set(4, "5");
            this.equals(vec.toArray().join(','), '1111111122222222,2,3,4,5', 'vector set');

            vec.setFromArray(['1','2','3','4']);
            this.equals(vec.toArray().join(','), '1,2,3,4', ', setFromArray smaller');

            vec.setFromArray(['1','2','3','4','5','6','7','8','9']);
            this.equals(vec.toArray().join(','), '1,2,3,4,5,6,7,8,9', 'setFromArray larger');

            vec.resize(6);
            this.equals(vec.toArray().join(','), '1,2,3,4,5,6', 'resize smaller');
            vec.resize(32);
            this.equals(vec.toArray().join(','), '1,2,3,4,5,6,,,,,,,,,,,,,,,,,,,,,,,,,,', 'resize larger');
            vec.destruct();
            vec.construct();
            vec.splice(0, 0, '1','2','3','4');
            this.equals(vec.toArray().join(','), '1,2,3,4', 'splice to empty');
            vec.splice(1, 2, '3','4');
            this.equals(vec.toArray().join(','), '1,3,4,4', 'splice same size');
            vec.splice(1, 2, '5');
            this.equals(vec.toArray().join(','), '1,5,4', 'splice smaller');
            vec.splice(1, 1, '1','2','3','4');
            this.equals(vec.toArray().join(','), '1,1,2,3,4,4', 'splice larger');
            vec.destruct();
        }

        const vec = CxxVector.make(CxxString).construct();
        vec.resize(5);
        vec.set(0, 't1');
        vec.set(1, 't2');

        const clsvector = CxxVector.make(Class).construct();
        const cls = Class.construct();
        cls.vector.push('test1');
        cls.vector.push('test2');
        cls.vector2.push(str);
        cls.vector3.push(vec);
        cls.vector3.push(vec);
        clsvector.push(cls);
        clsvector.push(cls);

        const cloned = CxxVector.make(Class).construct(clsvector);
        this.equals(cloned.get(0)!.vector.toArray().join(','), 'test1,test2', 'class, string vector');
        this.equals(cloned.get(1)!.vector.toArray().join(','), 'test1,test2', 'cloned class, string vector');
        this.equals(cloned.get(0)!.vector2.toArray().map(v=>v.value).join(','), 'test2', 'class, string vector');
        this.equals(cloned.get(1)!.vector2.toArray().map(v=>v.value).join(','), 'test2', 'cloned class, string vector');
        this.equals(cloned.get(0)!.vector3.toArray().map(v=>v.toArray().join(',')).join(','), 't1,t2,,,,t1,t2,,,', 'class, string vector');
        this.equals(cloned.get(1)!.vector3.toArray().map(v=>v.toArray().join(',')).join(','), 't1,t2,,,,t1,t2,,,', 'cloned class, string vector');
        cloned.destruct();

        clsvector.destruct();
        str.destruct();


    },

    map() {
        const map = CxxMap.make(CxxString, int32_t).construct();
        map.set('a', 4);
        map.set('b', 5.5);
        map.set('abcdefg12345678910', 6);
        this.equals(map.get('a'), 4, 'map get a');
        this.equals(map.get('b'), 5, 'map get b');
        this.equals(map.get('abcdefg12345678910'), 6, 'cxxmap get long text');
        this.equals(map.size(), 3, 'map size');
        map.destruct();

        const map2 = CxxMap.make(CxxString, CxxVector.make(CxxString)).construct();
        const a = CxxVector.make(CxxString).construct();
        a.push('a');
        map2.set('1', a);
        a.push('b');
        map2.set('2', a);
        a.destruct();
        this.equals(map2.toArray().map(([a,b])=>[a, b.toArray().join('-')].join('-')).join(','), '1-a,2-a-b', 'cxxmap set with vector');
        map2.destruct();
    },

    json() {
        const v = new JsonValue(true);
        v.constructWith({test:0, test2:'a', test3:true});
        this.equals(v.get('test').value(), 0, 'json int');
        this.equals(v.get('test2').value(), 'a', 'json string');
        this.equals(v.get('test3').value(), true, 'json boolean');
        v.destruct();
    },

    hookAll() {
        for (const name in events) {
            const evtarget = (events as any)[name];
            if (evtarget instanceof Event) {
                evtarget.on(emptyFunc);
            }
        }
    },

    async command() {
        let passed = false;
        const cb = (cmd:string, origin:string, ctx:CommandContext) => {
            if (cmd === '/__dummy_command') {
                passed = origin === 'Server';
                this.assert(ctx.origin.getDimension().vftable.equals(proc2['??_7OverworldDimension@@6BLevelListener@@@']), 'unexpected dimension');
                const pos = ctx.origin.getWorldPosition();
                this.assert(pos.x === 0 && pos.y === 0 && pos.z === 0, 'world pos is not zero');
                const actor = ctx.origin.getEntity();
                this.assert(actor === null, `origin.getEntity() is not null. result = ${actor}`);
                const level = ctx.origin.getLevel();
                this.assert(level.vftable.equals(proc2['??_7ServerLevel@@6BILevel@@@']), 'origin.getLevel() is not ServerLevel');
                const size = level.players.size();
                this.equals(size, 0, 'origin.getLevel().players.size is not zero');
                this.assert(level.players.capacity() < 64, 'origin.getLevel().players has too big capacity');
                events.command.remove(cb);
            }
        };
        events.command.on(cb);
        await new Promise<void>((resolve) => {
            const outputcb = (output:string) => {
                if (output.startsWith('Unknown command: __dummy_command')) {
                    events.commandOutput.remove(outputcb);
                    if (passed) resolve();
                    else this.fail();
                    return CANCEL;
                }
            };
            events.commandOutput.on(outputcb);
            bedrockServer.executeCommandOnConsole('__dummy_command');
        });
    },

    async checkPacketNames() {
        const wrongNames = new Map<string, string>([
            ['ShowModalFormPacket', 'ModalFormRequestPacket'],
            ['SpawnParticleEffect', 'SpawnParticleEffectPacket'],
            ['ResourcePacksStackPacket', 'ResourcePackStackPacket'],
            ['PositionTrackingDBServerBroadcast', 'PositionTrackingDBServerBroadcastPacket'],
            ['PositionTrackingDBClientRequest', 'PositionTrackingDBClientRequestPacket'],
            ['NPCDialoguePacket', 'NpcDialoguePacket'],
            // ['EventPacket', 'TelemetryEventPacket'],
            // ['ClientboundMapItemDataPacket', 'MapItemDataPacket'],
            // ['AutomationClientConnectPacket', 'WSConnectPacket'],
            // ['UpdateBlockSyncedPacket', 'UpdateBlockPacketSynced'],
            // ['BiomeDefinitionListPacket', 'BiomeDefinitionList'],
            // ['MapCreateLockedCopyPacket', 'MapCreateLockedCopy'],
            // ['StructureTemplateDataResponsePacket', 'StructureTemplateDataExportPacket'],
            // ['ItemStackRequestPacket', 'ItemStackRequest'],
            // ['ItemStackResponsePacket', 'ItemStackResponse'],
        ]);

        for (const id in PacketIdToType) {
            const Packet = PacketIdToType[+id as keyof PacketIdToType];
            const packet = Packet.create();

            let cxxname = packet.getName();
            const renamed = wrongNames.get(cxxname);
            if (renamed != null) cxxname = renamed;

            let name = Packet.name;

            this.equals(cxxname, name);
            this.equals(packet.getId(), Packet.ID);

            const idx = name.lastIndexOf('Packet');
            if (idx !== -1) name = name.substr(0, idx) + name.substr(idx+6);
            this.equals(MinecraftPacketIds[Packet.ID], name);

            packet.dispose();
        }

        for (const id in MinecraftPacketIds) {
            if (!/^[0-9]+$/.test(id)) continue;
            const Packet = PacketIdToType[+id as keyof PacketIdToType];
            this.assert(!!Packet, `MinecraftPacketIds.${MinecraftPacketIds[id]}: class not found`);
        }
    },

    packetEvents() {
        let idcheck = 0;
        let sendpacket = 0;
        for (let i = 0; i < 255; i++) {
            events.packetRaw(i).on(this.wrap((ptr, size, ni, packetId) => {
                idcheck = packetId;
                this.assert(size > 0, `packet is too small (size = ${size})`);
                this.equals(packetId, (ptr.readVarUint() & 0x3ff), `different packetId in buffer. id=${packetId}`);
            }, 0));
            events.packetBefore<MinecraftPacketIds>(i).on(this.wrap((ptr, ni, packetId) => {
                this.equals(packetId, idcheck, `different packetId on before. id=${packetId}`);
                this.equals(ptr.getId(), idcheck, `different class.packetId on before. id=${packetId}`);
            }, 0));
            events.packetAfter<MinecraftPacketIds>(i).on(this.wrap((ptr, ni, packetId) => {
                this.equals(packetId, idcheck, `different packetId on after. id=${packetId}`);
                this.equals(ptr.getId(), idcheck, `different class.packetId on after. id=${packetId}`);
            }, 0));
            events.packetSend<MinecraftPacketIds>(i).on(this.wrap((ptr, ni, packetId) => {
                sendidcheck = packetId;
                this.equals(ptr.getId(), packetId, `different class.packetId on send. id=${packetId}`);
                sendpacket++;
            }, 0));
            events.packetSendRaw(i).on(this.wrap((ptr, size, ni, packetId) => {
                this.assert(size > 0, `packet size is too little`);
                if (chatCancelCounter === 0) {
                    this.equals(packetId, sendidcheck, `different packetId on sendRaw. id=${packetId}`);
                }
                this.equals(packetId, (ptr.readVarUint() & 0x3ff), `different packetId in buffer. id=${packetId}`);
                sendpacket++;
            }, 0));
        }

        const conns = new Set<NetworkIdentifier>();
        events.packetAfter(MinecraftPacketIds.Login).on(this.wrap((ptr, ni) => {
            this.assert(!conns.has(ni), '[test] login without connection');
            conns.add(ni);
            setTimeout(() => {
                if (sendpacket === 0) {
                    this.error('[test] no packet was sent');
                }
            }, 1000);
        }));
        events.networkDisconnected.on(this.wrap(ni => {
            this.assert(conns.delete(ni), '[test] disconnection without connection');
        }, 0));
        events.packetSend(MinecraftPacketIds.AvailableCommands).on(this.wrap(p=>{
            const commandArray = p.commands.toArray();
            for (let i = 0; i < commandArray.length; i++) {
                if (commandArray[i].name === "teleport") {
                    commandArray.splice(i, 1);
                    i--;
                }
            }
            p.commands.setFromArray(commandArray);
        }, 1));
    },

    actor() {
        const system = server.registerSystem(0, 0);
        system.listenForEvent('minecraft:entity_created', this.wrap(ev => {
            const level = serverInstance.minecraft.getLevel();
            this.equals(level.players.size(), 1, 'Unexpected player size');
            this.assert(level.players.capacity() > 0, 'Unexpected player capacity');

            try {
                const uniqueId = ev.data.entity.__unique_id__;
                const actor = Actor.fromEntity(ev.data.entity);
                if (ev.data.entity.__identifier__ === 'minecraft:player') {
                    this.assert(actor !== null, 'Actor.fromEntity of player is null');
                }

                if (actor !== null) {
                    this.assert(actor.getDimension().vftable.equals(proc2['??_7OverworldDimension@@6BLevelListener@@@']),
                        'getDimension() is not OverworldDimension');
                    this.equals(actor.getDimensionId(), DimensionId.Overworld, 'getDimensionId() is not overworld');

                    const actualId = actor.getUniqueIdLow() + ':' + actor.getUniqueIdHigh();
                    const expectedId = uniqueId["64bit_low"] + ':' + uniqueId["64bit_high"];
                    this.equals(actualId, expectedId,
                        `Actor uniqueId does not match (actual=${actualId}, expected=${expectedId})`);

                    if (ev.data.entity.__identifier__ === 'minecraft:player') {
                        const name = system.getComponent(ev.data.entity, 'minecraft:nameable')!.data.name;
                        this.equals(name, connectedId, 'id does not match');
                        this.equals(actor.getEntityTypeId(), ActorType.Player, 'player type does not match');
                        this.assert(actor.isPlayer(), 'player is not the player');
                        this.equals(actor.getNetworkIdentifier(), connectedNi, 'the network identifier does not match');
                    } else {
                        this.assert(!actor.isPlayer(), `an entity that is not a player is a player (identifier:${ev.data.entity.__identifier__})`);
                    }
                }
            } catch (err) {
                this.processError(err);
            }
        }, 5));
    },

    chat() {
        events.packetBefore(MinecraftPacketIds.Text).on((packet, ni) => {
            if (packet.message == "TEST YEY!") {
                const MAX_CHAT = 5;
                chatCancelCounter++;
                this.log(`test (${chatCancelCounter}/${MAX_CHAT})`);
                this.equals(connectedNi, ni, 'the network identifier does not match');
                if (chatCancelCounter === MAX_CHAT) {
                    this.log('> tested and stopping...');
                    setTimeout(() => bedrockServer.stop(), 1000);
                }
                return CANCEL;
            }
        });
    },
}, true);

let connectedNi: NetworkIdentifier;
let connectedId: string;

events.packetRaw(MinecraftPacketIds.Login).on((ptr, size, ni) => {
    connectedNi = ni;
});
events.packetAfter(MinecraftPacketIds.Login).on(ptr => {
    connectedId = ptr.connreq!.cert.getId();
});
