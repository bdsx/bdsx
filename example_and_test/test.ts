/**
 * These are unit tests for bdsx
 */

import { asm, FloatRegister, OperationSize, Register } from "bdsx/assembler";
import { AbilitiesIndex } from "bdsx/bds/abilities";
import { Actor, ActorType, DimensionId, ItemActor } from "bdsx/bds/actor";
import { AttributeId } from "bdsx/bds/attribute";
import { Block } from "bdsx/bds/block";
import { BlockPos, RelativeFloat, Vec3 } from "bdsx/bds/blockpos";
import { CommandContext, CommandPermissionLevel } from "bdsx/bds/command";
import { JsonValue } from "bdsx/bds/connreq";
import { CxxOptionalToUndefUnion } from "bdsx/bds/cxxoptional";
import { Dimension } from "bdsx/bds/dimension";
import { HashedString } from "bdsx/bds/hashedstring";
import { CreativeItemCategory, ItemStack, NetworkItemStackDescriptor } from "bdsx/bds/inventory";
import {
    ByteArrayTag,
    ByteTag,
    CompoundTag,
    DoubleTag,
    EndTag,
    FloatTag,
    Int64Tag,
    IntArrayTag,
    IntTag,
    ListTag,
    NBT,
    ShortTag,
    StringTag,
    Tag,
} from "bdsx/bds/nbt";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { Packet } from "bdsx/bds/packet";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { AttributeData, ModalFormResponsePacket, PacketIdToType } from "bdsx/bds/packets";
import { Player, PlayerPermission, SimulatedPlayer } from "bdsx/bds/player";
import { proc } from "bdsx/bds/symbols";
import { bin } from "bdsx/bin";
import { capi } from "bdsx/capi";
import { command, CommandFieldOptions } from "bdsx/command";
import { CommandParameterType } from "bdsx/commandparam";
import { CommandResultType } from "bdsx/commandresult";
import { AttributeName, CANCEL } from "bdsx/common";
import { NativePointer } from "bdsx/core";
import { CxxMap } from "bdsx/cxxmap";
import { CxxVector, CxxVectorToArray } from "bdsx/cxxvector";
import { disasm } from "bdsx/disassembler";
import { dll } from "bdsx/dll";
import { dllraw } from "bdsx/dllraw";
import { events } from "bdsx/event";
import { HashSet } from "bdsx/hashset";
import { bedrockServer } from "bdsx/launcher";
import { makefunc } from "bdsx/makefunc";
import { mce } from "bdsx/mce";
import { AbstractClass, nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, float64_t, int16_t, int32_t, int64_as_float_t, int8_t, uint16_t } from "bdsx/nativetype";
import { pdbcache } from "bdsx/pdbcache";
import { CxxStringWrapper } from "bdsx/pointer";
import { procHacker } from "bdsx/prochacker";
import { PseudoRandom } from "bdsx/pseudorandom";
import { jsdata } from "bdsx/storage/jsdata";
import { Tester } from "bdsx/tester";
import { arrayEquals, getEnumKeys, hex, stripSlashes } from "bdsx/util";
import { getRecentSentPacketId } from "./net-rawpacket";

let sendidcheck = 0;
let chatCancelCounter = 0;

const dimensionVFTables = new Set<string>(
    [proc["??_7OverworldDimension@@6BIDimension@@@"], proc["??_7NetherDimension@@6BIDimension@@@"], proc["??_7TheEndDimension@@6BIDimension@@@"]].map(addr =>
        addr.getAddressBin(),
    ),
);
function isDimensionClass(dimension: Dimension): boolean {
    return dimensionVFTables.has(dimension.vftable.getAddressBin());
}
enum PacketPhase {
    Raw,
    Before,
    After,
}
let nextPacketPhase = PacketPhase.Raw;
let nextEventTimeout:NodeJS.Timeout|null = null;
let nextPacketSendPhase = PacketPhase.Before;

type PromiseFunc = () => Promise<PromiseFunc>;

const INT32_MIN = 0x80000000;
const INT32_MAX = 0x7fffffff;

const FLOAT32_MIN = -3.40282347e38;
const FLOAT32_MAX = 3.40282347e38;

function checkCommandRegister(
    tester: Tester,
    testname: string,
    testcases: [CommandParameterType<any> | [CommandParameterType<any>, CommandFieldOptions | boolean], string | null, any][],
    opts: { throughConsole?: boolean } = {},
): PromiseFunc {
    const paramsobj: Record<string, CommandParameterType<any> | [CommandParameterType<any>, CommandFieldOptions | boolean]> = {};
    const n = testcases.length;
    for (let i = 0; i < n; i++) {
        paramsobj["arg" + i] = testcases[i][0];
    }

    const cmdname = "testcommand_" + testname;
    let cmdline = cmdname;
    for (const testcase of testcases) {
        const strparam = testcase[1];
        if (strparam === null) continue;
        cmdline += " ";
        cmdline += strparam;
    }

    command.register(cmdname, "command for test").overload((param, origin, output) => {
        for (let i = 0; i < n; i++) {
            const [opts, name, expected] = testcases[i];
            const actual = param["arg" + i];
            if (expected !== actual) {
                output.error(`failed`);
                const type = opts instanceof Array ? opts[0] : opts;
                tester.equals(actual, expected, `type=${type.name}, value=${name} mismatched`);
                return;
            }
        }
        output.success("passed");
    }, paramsobj);

    function run(): Promise<PromiseFunc> {
        return new Promise<PromiseFunc>((resolve, reject) => {
            const outputcb = (output: string) => {
                if (output === "passed") {
                    clearTimeout(timeout);
                    events.commandOutput.remove(outputcb);
                    resolve(run);
                    return CANCEL;
                }
                if (output === "failed") {
                    clearTimeout(timeout);
                    events.commandOutput.remove(outputcb);
                    reject(Error(`${cmdname} failed`));
                    return CANCEL;
                }
            };
            events.commandOutput.on(outputcb);

            const timeout = setTimeout(() => {
                reject(Error(`${cmdname} does not callback`));
            }, 3000);

            if (opts.throughConsole) {
                bedrockServer.executeCommandOnConsole(cmdline);
            } else {
                const res = bedrockServer.executeCommand(cmdline, CommandResultType.OutputAndData);
                if (!res.isSuccess()) {
                    tester.error(`${cmdname} failed`, 5);
                } else {
                    tester.equals(res.data.statusMessage, "passed", `${cmdname}, unexpected statusMessage`);
                    tester.equals(res.data.statusCode, res.getFullCode(), `${cmdname}, unexpected statusCode`);
                }
            }
        });
    }
    return run;
}

@nativeClass()
class VectorClass extends NativeClass {
    @nativeField(CxxVector.make(CxxString))
    vector: CxxVector<CxxString>;
    @nativeField(CxxVector.make(CxxStringWrapper))
    vector2: CxxVector<CxxStringWrapper>;
    @nativeField(CxxVector.make(CxxVector.make(CxxString)))
    vector3: CxxVector<CxxVector<CxxString>>;
}

/**
 * too many packets to hook. skip them.
 */
const tooHeavy = new Set<number>();
tooHeavy.add(0xae); // SubChunkPacket
tooHeavy.add(0xaf); // SubChunkRequestPacket

Tester.concurrency(
    {
        async nexttick() {
            let timer: NodeJS.Timer;
            for (let i = 0; i < 2; i++) {
                await Promise.race([
                    new Promise<boolean>(resolve =>
                        process.nextTick(() => {
                            clearTimeout(timer);
                            resolve(true);
                        }),
                    ),
                    new Promise<boolean>(resolve => {
                        timer = setTimeout(() => {
                            this.fail();
                            resolve(false);
                        }, 1000);
                    }),
                ]);
            }
        },
    },
    {
        async globals() {
            const serverInstance = bedrockServer.serverInstance;
            this.assert(!!serverInstance && serverInstance.isNotNull(), "serverInstance not found");
            this.equals(serverInstance.vftable, proc["??_7ServerInstance@@6BEnableNonOwnerReferences@Bedrock@@@"], "serverInstance is not ServerInstance");
            const networkSystem = bedrockServer.networkSystem;
            this.assert(!!networkSystem && networkSystem.isNotNull(), "networkSystem not found");
            this.equals(bedrockServer.commandOutputSender.vftable, proc["??_7CommandOutputSender@@6B@"], "sender is not CommandOutputSender");

            const shandle = bedrockServer.serverNetworkHandler;
            shandle.setMotd("TestMotd");
            this.equals(shandle.motd, "TestMotd", "unexpected motd");

            serverInstance.setMaxPlayers(10);
            this.equals(shandle.maxPlayers, 10, "unexpected maxPlayers");
            [...bedrockServer.commandRegistry.enumValues];
            [...bedrockServer.commandRegistry.enums].map(v => v.name);
            [...bedrockServer.commandRegistry.enumLookup.keys()];
            [...bedrockServer.commandRegistry.enumValueLookup.keys()];
            // [...bedrockServer.commandRegistry.commandSymbols].map(v => v.value);
            [...bedrockServer.commandRegistry.softEnums].map(v => v.name);
            [...bedrockServer.commandRegistry.softEnumLookup.keys()];
            for (const dim of [DimensionId.Overworld, DimensionId.Nether, DimensionId.TheEnd]) {
                this.equals(bedrockServer.level.createDimension(dim).getDimensionId(), dim);
                this.equals(bedrockServer.level.getDimension(dim)?.getDimensionId(), dim);
            }
        },
    },
    {
        disasm() {
            const assert = (hexcode: string, asmcode: string, nonsamehex: boolean = false) => {
                const opers = disasm.check(hexcode, true);
                const disasem = opers.toString().replace(/\n/g, ";");
                this.equals(disasem, asmcode, ``);
                if (!nonsamehex) this.equals(hex(opers.asm().buffer()), hexcode.toUpperCase());
            };

            assert("0f 57 c1", "xorps xmm0, xmm1");
            assert("83 39 00", "cmp dword ptr [rcx], 0x0");
            assert("8b 0c 31", "mov ecx, dword ptr [rcx+rsi]");
            assert("f3 0f 11 89 a4 03 00 00", "movss dword ptr [rcx+0x3a4], xmm1");
            assert("0F 84 7A 06 00 00 55 56 57 41 54 41 55 41 56", "je 0x67a;push rbp;push rsi;push rdi;push r12;push r13;push r14");
            assert("80 79 48 00 74 18 48 83 C1 38", "cmp byte ptr [rcx+0x48], 0x0;je 0x18;add rcx, 0x38");
            assert("48 8B D9", "mov rbx, rcx", true);
            assert("0F 29 74 24 20 E8 8D 0D FE FF", "movaps xmmword ptr [rsp+0x20], xmm6;call -0x1f273");
            assert("49 8B D8", "mov rbx, r8", true);
            assert("48 8d 40 01", "lea rax, qword ptr [rax+0x1]");
            assert("0F 10 02 48 8D 59 08 48 8D 54 24 20", "movups xmm0, xmmword ptr [rdx];lea rbx, qword ptr [rcx+0x8];lea rdx, qword ptr [rsp+0x20]");
            assert("48 8B CB", "mov rcx, rbx", true);
            assert("0F 10 02", "movups xmm0, xmmword ptr [rdx]");
            assert("48 0f b6 c1", "movzx rax, cl");
            assert("0f b6 c1", "movzx eax, cl");
            assert("0f b7 c0", "movzx eax, ax");
            assert("0f b6 c0", "movzx eax, al");
            assert("0f bf c0", "movsx eax, ax");
            assert("0f be 00", "movsx eax, byte ptr [rax]");
            assert("44 0F B6 C1 49 BA B3 01 00 00 00 01 00 00", "movzx r8d, cl;movabs r10, 0x100000001b3");
            assert("48 8D 04 40", "lea rax, qword ptr [rax+rax*2]");
            assert("48 8D 14 59", "lea rdx, qword ptr [rcx+rbx*2]");
            assert("0f 90 c0 0f 90 c1 0f 91 c0 0f 91 c1 0f 91 00", "seto al;seto cl;setno al;setno cl;setno byte ptr [rax]");
            assert(
                "ff 81 c0 07 00 00 48 ff c0 48 ff 00 48 ff 08 48 ff c0 ff 18 ff 10 ff 28 ff e0",
                "inc dword ptr [rcx+0x7c0];inc rax;inc qword ptr [rax];dec qword ptr [rax];inc rax;call fword ptr [rax];call qword ptr [rax];jmp fword ptr [rax];jmp rax",
            );
            assert("41 b0 01 ba 38 00 00 00 48 89 CB e8 aa 6c fb ff", "mov r8b, 0x1;mov edx, 0x38;mov rbx, rcx;call -0x49356");
            assert("d1 e8 c1 e8 00 c1 e0 00 d1 e0 d1 f8 c1 f8 00", "shr eax, 0x1;shr eax, 0x0;shl eax, 0x0;shl eax, 0x1;sar eax, 0x1;sar eax, 0x0");
            this.assert(disasm.check("82", true).size === 0, "asm bad");
            const opers = disasm.check("82", {
                fallback(asm) {
                    if (asm.readUint8() === 0x82) {
                        return 1; // opcode size
                    } else {
                        return null; // failed
                    }
                },
                quiet: true,
            });
            this.assert(opers.size === 1, "fallback");
        },

        bin() {
            this.equals(bin.parse("0"), "", 'bin.parse("0")');
            this.equals(bin.make64(1, 0), bin64_t.one, "bin.make64(1, 0)", bin.toString);
            this.equals(bin.make64(0, 0), bin64_t.zero, "bin.make64(0, 0)", bin.toString);
            this.equals(bin.make64(-1, -1), bin64_t.minus_one, "bin.make64(-1, -1)", bin.toString);
            const small = bin.make64(0x100, 0);
            this.equals(small, "\u0100\0\0\0", "bin.make64(0x100, 0)", bin.toString);
            const big = bin.make64(0x10002, 0);
            this.equals(big, "\u0002\u0001\0\0", "bin.make64(0x10002, 0)", bin.toString);
            this.equals(bin.sub(big, small), "\uff02\0\0\0", "bin.sub()", bin.toString);
            const big2 = bin.add(big, bin.add(big, small));
            this.equals(big2, "\u0104\u0002\0\0", "bin.add()", bin.toString);
            const bigbig = bin.add(bin.add(bin.muln(big2, 0x100000000), small), bin64_t.one);
            this.equals(bigbig, "\u0101\u0000\u0104\u0002", "bin.muln()", bin.toString);
            const dived = bin.divn(bigbig, 2);
            this.equals(dived[0], "\u0080\u0000\u0082\u0001", "bin.divn()", bin.toString);
            this.equals(dived[1], 1, "bin.divn()");
            this.equals(bin.toString(dived[0], 16), "1008200000080", "bin.toString()");

            const ptr = capi.malloc(10);
            try {
                const bignum = bin.makeVar(123456789012345);
                ptr.add().writeVarBin(bignum);
                this.equals(ptr.add().readVarBin(), bignum, "writevarbin / readvarbin", bin.toString);
            } finally {
                capi.free(ptr);
            }

            this.equals(bin.bitshl("\u1000\u0100\u0010\u1001", 0), "\u1000\u0100\u0010\u1001", "bin.bitshl(0)", v => bin.toString(v, 16));
            this.equals(bin.bitshr("\u1001\u0100\u0010\u0001", 0), "\u1001\u0100\u0010\u0001", "bin.bitshr(0)", v => bin.toString(v, 16));
            this.equals(bin.bitshl("\u1000\u0100\u0010\u1001", 4), "\u0000\u1001\u0100\u0010", "bin.bitshl(4)", v => bin.toString(v, 16));
            this.equals(bin.bitshr("\u1001\u0100\u0010\u0001", 4), "\u0100\u0010\u1001\u0000", "bin.bitshr(4)", v => bin.toString(v, 16));
            this.equals(bin.bitshl("\u1000\u0100\u0010\u1001", 16), "\u0000\u1000\u0100\u0010", "bin.bitshl(16)", v => bin.toString(v, 16));
            this.equals(bin.bitshr("\u1001\u0100\u0010\u0001", 16), "\u0100\u0010\u0001\u0000", "bin.bitshr(16)", v => bin.toString(v, 16));
            this.equals(bin.bitshl("\u1000\u0100\u0010\u1001", 20), "\u0000\u0000\u1001\u0100", "bin.bitshl(20)", v => bin.toString(v, 16));
            this.equals(bin.bitshr("\u1001\u0100\u0010\u0001", 20), "\u0010\u1001\u0000\u0000", "bin.bitshr(20)", v => bin.toString(v, 16));
            this.equals(bin.toString(bin.parse("18446744069414584321")), "18446744069414584321", "bin.parse");
            this.equals(bin.toString(bin.parse("0x123456789", null, 2), 16), "23456789", "bin.parse, limit count");

            const longnumber = "123123123123123123123123123123123123123123123123123123123123123";
            this.equals(bin.toString(bin.parse(longnumber)), longnumber, "bin.parse");
        },

        hashset() {
            class HashItem {
                constructor(public readonly value: number) {}

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
            for (let i = 0; i < TEST_COUNT; ) {
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
                    this.error("hashset.has failed, found on empty");
                }
            }
        },

        jsdata() {
            const test = (value: unknown) => {
                const converted = jsdata.deserialize(jsdata.serialize(value));
                this.deepEquals(converted, value, `${typeof value} jsdata mismatched`, v => JSON.stringify(v));
            };
            test(1);
            test(-1);
            test(1234567890123);
            test(-1234567890123);
            test("2");
            test("very very long text");
            test(true);
            test(false);
            test(null);
            test(undefined);
            test([1, "2"]);
            test({ a: 1, b: "2" });
            test(new Date());
            test([1, ["2", 3], { a: 4, b: 5 }, true, false, null, undefined]);
        },

        memset() {
            const dest = new Uint8Array(12);
            const ptr = new NativePointer();
            ptr.setAddressFromBuffer(dest);
            dll.vcruntime140.memset(ptr, 1, 12);
            for (const v of dest) {
                this.equals(v, 1, "wrong value: " + v);
            }
        },

        cxxstring() {
            const str = CxxStringWrapper.construct();
            this.equals(str.length, 0, "std::string invalid constructor");
            this.equals(str.capacity, 15, "std::string invalid constructor");
            const shortcase = "111";
            const longcase = "123123123123123123123123";
            str.value = shortcase;
            this.equals(str.value, shortcase, "failed with short text");
            str.value = longcase;
            this.equals(str.value, longcase, "failed with long text");
            str.destruct();

            const hstr = HashedString.construct();
            this.equals(hstr.str, "", "Invalid string");
            hstr.destruct();

            const data = AttributeData.construct();
            this.equals(data.name.str, "", "Invalid string");
            data.destruct();
        },

        makefunc() {
            const structureReturn = asm().mov_rp_c(Register.rcx, 1, 0, 1, OperationSize.dword).mov_r_r(Register.rax, Register.rcx).make(int32_t, {
                structureReturn: true,
                name: "test, structureReturn",
            });
            this.equals(structureReturn(), 1, "structureReturn int32_t");
            const floatToDouble = asm().cvtss2sd_f_f(FloatRegister.xmm0, FloatRegister.xmm0).make(float64_t, { name: "test, floatToDouble" }, float32_t);
            this.equals(floatToDouble(123), 123, "float to double");
            const doubleToFloat = asm().cvtsd2ss_f_f(FloatRegister.xmm0, FloatRegister.xmm0).make(float32_t, { name: "test, doubleToFloat" }, float64_t);
            this.equals(doubleToFloat(123), 123, "double to float");
            const getbool = asm().mov_r_c(Register.rax, 0x100).make(bool_t, { name: "test, return 100" });
            const sum = makefunc.js(
                makefunc.np((a, b, c, d) => a + b + c + d, int32_t, null, int8_t, int16_t, int32_t, int64_as_float_t),
                int32_t,
                null,
                int8_t,
                int16_t,
                int32_t,
                int64_as_float_t,
            );
            this.equals(sum(1, 2, 3, 4), 10, "4 parameters");
            this.equals(getbool(), false, "bool return");
            const bool2int = asm().mov_r_r(Register.rax, Register.rcx).make(int32_t, { name: "test, return param" }, bool_t);
            this.equals(bool2int(true), 1, "bool to int");
            this.equals(bool2int(false), 0, "bool to int");
            const int2bool = asm().mov_r_r(Register.rax, Register.rcx).make(bool_t, { name: "test, return param" }, int32_t);
            this.equals(int2bool(1), true, "int to bool");
            this.equals(int2bool(0), false, "int to bool");
            const int2short_as_int = asm()
                .movzx_r_r(Register.rax, Register.rcx, OperationSize.dword, OperationSize.word)
                .make(int32_t, { name: "test, int2short_as_int" }, int32_t);
            this.equals(int2short_as_int(-1), 0xffff, "int to short old");
            const int2short = asm()
                .movzx_r_r(Register.rax, Register.rcx, OperationSize.dword, OperationSize.word)
                .make(int16_t, { name: "test, int2short" }, int32_t);
            this.equals(int2short(-1), -1, "int to short");
            this.equals(int2short(0xffff), -1, "int to short");
            const int2ushort = asm()
                .movzx_r_r(Register.rax, Register.rcx, OperationSize.dword, OperationSize.word)
                .make(uint16_t, { name: "test, int2ushort" }, int32_t);
            this.equals(int2ushort(-1), 0xffff, "int to ushort");
            this.equals(int2ushort(0xffff), 0xffff, "int to ushort");
            const string2string = asm().mov_r_r(Register.rax, Register.rcx).make(CxxString, { name: "test, string2string" }, CxxString);
            this.equals(string2string("test"), "test", "string to string");
            this.equals(string2string("testtesta"), "testtesta", "test string over 8 bytes");
            this.equals(string2string("test string over 15 bytes"), "test string over 15 bytes", "string to string");
            const nullreturn = asm().xor_r_r(Register.rax, Register.rax).make(NativePointer, { name: "test, nullreturn" });
            this.equals(nullreturn(), null, "nullreturn does not return null");

            const returning = asm().mov_r_r(Register.rax, Register.rcx).make(int32_t, { name: "test, returning" }, int32_t);
            this.equals(returning(1), 1, "makefunc.js, returning failed");
            const returningNative = makefunc.np(returning, int32_t, { name: "test, overTheFiveNative" }, int32_t);
            const returningRewrap = makefunc.js(returningNative, int32_t, { name: "test, overTheFiveRewrap" }, int32_t);
            this.equals(returningRewrap(1), 1, "makefunc.np, returning failed");

            const overTheFour = asm()
                .mov_r_rp(Register.rax, Register.rsp, 1, 0x28)
                .make(int32_t, { name: "test, overTheFour" }, int32_t, int32_t, int32_t, int32_t, int32_t);
            this.equals(overTheFour(0, 0, 0, 0, 1234), 1234, "makefunc.js, overTheFour failed");
            const overTheFiveNative = makefunc.np(overTheFour, int32_t, { name: "test, overTheFiveNative" }, int32_t, int32_t, int32_t, int32_t, int32_t);
            const overTheFiveRewrap = makefunc.js(overTheFiveNative, int32_t, { name: "test, overTheFiveRewrap" }, int32_t, int32_t, int32_t, int32_t, int32_t);
            this.equals(overTheFiveRewrap(0, 0, 0, 0, 1234), 1234, "makefunc.np, overTheFour failed");

            const CxxStringVectorToArray = CxxVectorToArray.make(CxxString);
            const CxxStringVector = CxxVector.make(CxxString);
            const class_to_array = asm().mov_r_r(Register.rax, Register.rcx).make(CxxStringVectorToArray, { name: "test, class_to_array" }, CxxStringVector);
            const clsvector = CxxStringVector.construct();
            clsvector.push("a", "b", "c", "d");
            this.equals(class_to_array(clsvector).join(","), "a,b,c,d", "CxxVectorToArray, class_to_array");
            clsvector.destruct();

            const array_to_array = asm().mov_r_r(Register.rax, Register.rcx).make(CxxStringVectorToArray, { name: "test, array_to_array" }, CxxStringVectorToArray);
            this.equals(array_to_array(["a", "b", "c", "d"]).join(","), "a,b,c,d", "CxxVectorToArray, array_to_array");

            const rfloat_to_bin = asm().mov_r_r(Register.rax, Register.rcx).make(bin64_t, { name: "test, rfloat_to_bin" }, RelativeFloat);
            const value = RelativeFloat.create(123, true);
            this.equals(rfloat_to_bin(value), value.bin_value, "rfloat_to_bin");

            const strStructureReturn = makefunc.js(
                makefunc.np(str => str, CxxString, { structureReturn: true }, CxxString),
                CxxString,
                { structureReturn: true },
                CxxString,
            );
            this.equals(strStructureReturn("test"), "test", "CxxString structureReturn failed");
        },

        vectorcopy() {
            const a = new VectorClass(true);
            a.construct();
            a.vector.push("test");
            const str = new CxxStringWrapper(true);
            str.construct();
            str.value = "test2";
            a.vector2.push(str);

            this.equals(a.vector.size(), 1, "a.vector, invalid size");
            this.equals(a.vector2.size(), 1, "a.vector2, invalid size");
            this.equals(a.vector.get(0), "test", `a.vector, invalid value ${a.vector.get(0)}`);
            this.equals(a.vector2.get(0)!.value, "test2", `a.vector2, invalid value ${a.vector2.get(0)!.value}`);

            const b = new VectorClass(true);
            b.construct(a);
            this.equals(b.vector.size(), 1, "b.vector, invalid size");
            this.equals(b.vector2.size(), 1, "b.vector2, invalid size");
            this.equals(b.vector.get(0), "test", `b.vector, invalid value ${b.vector.get(0)}`);
            this.equals(b.vector2.get(0)!.value, "test2", `b.vector2, invalid value ${b.vector2.get(0)!.value}`);
            b.vector.get(0);

            b.destruct();

            a.vector.push("test1", "test2", "test3");
            this.equals(a.vector.size(), 4, "a.vector, invalid size");
            this.equals([...a.vector].join(","), "test,test1,test2,test3", "a.vector, invalid size");

            a.destruct();

            for (let i = 0; i < 2; i++) {
                const vec = CxxVector.make(CxxString).construct();
                vec.push("1111111122222222");
                this.equals(vec.toArray().join(","), "1111111122222222", "vector push 1");
                vec.push("2");
                this.equals(vec.toArray().join(","), "1111111122222222,2", "vector push 2");
                vec.push("3");
                this.equals(vec.toArray().join(","), "1111111122222222,2,3", "vector push 3");
                vec.push("4");
                this.equals(vec.toArray().join(","), "1111111122222222,2,3,4", "vector push 4");
                vec.set(4, "5");
                this.equals(vec.toArray().join(","), "1111111122222222,2,3,4,5", "vector set");

                vec.setFromArray(["1", "2", "3", "4"]);
                this.equals(vec.toArray().join(","), "1,2,3,4", ", setFromArray smaller");

                vec.setFromArray(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
                this.equals(vec.toArray().join(","), "1,2,3,4,5,6,7,8,9", "setFromArray larger");

                vec.resize(6);
                this.equals(vec.toArray().join(","), "1,2,3,4,5,6", "resize smaller");
                vec.resize(32);
                this.equals(vec.toArray().join(","), "1,2,3,4,5,6,,,,,,,,,,,,,,,,,,,,,,,,,,", "resize larger");
                vec.destruct();
                vec.construct();
                vec.splice(0, 0, "1", "2", "3", "4");
                this.equals(vec.toArray().join(","), "1,2,3,4", "splice to empty");
                vec.splice(1, 2, "3", "4");
                this.equals(vec.toArray().join(","), "1,3,4,4", "splice same size");
                vec.splice(1, 2, "5");
                this.equals(vec.toArray().join(","), "1,5,4", "splice smaller");
                vec.splice(1, 1, "1", "2", "3", "4");
                this.equals(vec.toArray().join(","), "1,1,2,3,4,4", "splice larger");
                vec.destruct();
            }
            str.destruct();
        },

        classvectorcopy() {
            const vec = CxxVector.make(CxxString).construct();
            vec.resize(5);
            vec.set(0, "t1");
            vec.set(1, "t2");

            const str = new CxxStringWrapper(true);
            str.construct();
            str.value = "test2";

            const clsvector = CxxVector.make(VectorClass).construct();
            const cls = VectorClass.construct();
            cls.vector.push("test1");
            cls.vector.push("test2");
            cls.vector2.push(str);
            cls.vector3.push(vec);
            cls.vector3.push(vec);
            clsvector.push(cls);
            clsvector.push(cls);
            cls.destruct();

            const cloned = CxxVector.make(VectorClass).construct(clsvector);
            this.equals(cloned.get(0)!.vector.toArray().join(","), "test1,test2", "class, string vector");
            this.equals(cloned.get(1)!.vector.toArray().join(","), "test1,test2", "cloned class, string vector");
            this.equals(
                cloned
                    .get(0)!
                    .vector2.toArray()
                    .map(v => v.value)
                    .join(","),
                "test2",
                "class, string vector",
            );
            this.equals(
                cloned
                    .get(1)!
                    .vector2.toArray()
                    .map(v => v.value)
                    .join(","),
                "test2",
                "cloned class, string vector",
            );
            this.equals(
                cloned
                    .get(0)!
                    .vector3.toArray()
                    .map(v => v.toArray().join(","))
                    .join(","),
                "t1,t2,,,,t1,t2,,,",
                "class, string vector",
            );
            this.equals(
                cloned
                    .get(1)!
                    .vector3.toArray()
                    .map(v => v.toArray().join(","))
                    .join(","),
                "t1,t2,,,,t1,t2,,,",
                "cloned class, string vector",
            );
            cloned.destruct();
            clsvector.destruct();
        },

        optional() {
            const optionalInt = CxxOptionalToUndefUnion.make(int32_t);
            const optionalJs = asm()
                .mov_r_rp(Register.rax, Register.rdx, 1, 0)
                .mov_rp_r(Register.rcx, 1, 0, Register.rax)
                .mov_r_r(Register.rax, Register.rcx)
                .make(optionalInt, { structureReturn: true }, optionalInt);
            const optionalNp = makefunc.js(
                makefunc.np(v => v, optionalInt, { structureReturn: true }, optionalInt),
                optionalInt,
                { structureReturn: true },
                optionalInt,
            );
            this.equals(optionalJs(32), 32, "optionalJs fail");
            this.equals(optionalJs(undefined), undefined, "optionalJs fail");
            this.equals(optionalNp(32), 32, "optionalNp fail");
            this.equals(optionalNp(undefined), undefined, "optionalNp fail");
        },

        map() {
            const map = CxxMap.make(CxxString, int32_t).construct();
            map.set("a", 4);
            map.set("b", 5.5);
            map.set("abcdefg12345678910", 6);
            this.equals(map.get("a"), 4, "map get a");
            this.equals(map.get("b"), 5, "map get b");
            this.equals(map.get("abcdefg12345678910"), 6, "cxxmap get long text");
            this.equals(map.size(), 3, "map size");
            map.destruct();

            const map2 = CxxMap.make(CxxString, CxxVector.make(CxxString)).construct();
            const a = CxxVector.make(CxxString).construct();
            a.push("a");
            map2.set("1", a);
            a.push("b");
            map2.set("2", a);
            a.destruct();
            this.equals(
                map2
                    .toArray()
                    .map(([a, b]) => [a, b.toArray().join("-")].join("-"))
                    .join(","),
                "1-a,2-a-b",
                "cxxmap set with vector",
            );
            map2.destruct();
        },

        json() {
            const v = new JsonValue(true);
            v.constructWith({ test: 3, test2: "a", test3: true });
            this.equals(v.get("test").value(), 3, "json int");
            this.equals(v.get("test2").value(), "a", "json string");
            this.equals(v.get("test3").value(), true, "json boolean");
            const proxy = v.proxy();
            this.equals(proxy.test, 3, "json int");
            this.equals(proxy.test2, "a", "json string");
            this.equals(proxy.test3, true, "json boolean");

            v.destruct();
        },

        async commandregistery() {
            const sig = bedrockServer.commandRegistry.findCommand("give")!;
            this.equals(sig.command, "give");
            this.equals(sig.description, "commands.give.description");
            this.equals(sig.permissionLevel, CommandPermissionLevel.Operator);
        },

        async command() {
            // command hook test, error test, parameter type test
            let passed = false;
            const cb = (cmd: string, origin: string, ctx: CommandContext) => {
                if (cmd === "/__dummy_command") {
                    passed = origin === "Server";
                    this.equals(ctx.origin.vftable, proc["??_7ServerCommandOrigin@@6B@"], "invalid origin");
                    const dimension = ctx.origin.getDimension();
                    this.assert(isDimensionClass(dimension), "invalid dimension");
                    this.equals(dimension.getDefaultBiomeString(), "ocean", "invalid getDefaultBiomeString");
                    const pos = ctx.origin.getWorldPosition();
                    this.assert(pos.x === 0 && pos.y === 0 && pos.z === 0, "world pos is not zero");
                    const actor = ctx.origin.getEntity();
                    this.assert(actor === null, `origin.getEntity() is not null. result = ${actor}`);
                    const level = ctx.origin.getLevel();
                    this.equals(level.vftable, proc["??_7ServerLevel@@6BILevel@@@"], "origin.getLevel() is not ServerLevel");
                    const players = level.getPlayers();
                    const size = players.length;
                    this.equals(size, 0, "origin.getLevel().players.size is not zero");
                    this.assert(players.length < 64, "origin.getLevel().players has too big capacity");
                    this.equals(ctx.origin.getRequestId(), "00000000-0000-0000-0000-000000000000", "unexpected id");
                    events.command.remove(cb);
                }
            };
            events.command.on(cb);
            await new Promise<void>(resolve => {
                const outputcb = (output: string) => {
                    if (output.startsWith("Unknown command: __dummy_command")) {
                        events.commandOutput.remove(outputcb);
                        if (passed) resolve();
                        else this.fail();
                        return CANCEL;
                    }
                };
                events.commandOutput.on(outputcb);
                bedrockServer.executeCommandOnConsole("__dummy_command");
            });
        },

        async commandregister() {
            // command register test, parameter test
            await checkCommandRegister(this, "cmdtest", [], {
                throughConsole: true,
            })();
            await checkCommandRegister(this, "cmdtest2", [])();
            await checkCommandRegister(this, "cmdtest3", [[CxxString, "a", "a"]])();
            await checkCommandRegister(this, "cmdtest4", [
                [CxxString, "a", "a"],
                [[CxxString, true], null, undefined],
            ])();

            const tests: PromiseFunc[] = [];
            for (let i = 0; i < 100; i++) {
                tests.push(checkCommandRegister(this, "repeat" + i, [[CxxString, "a", "a"]]));
            }
            for (const test of tests) {
                await test();
            }
        },

        async commandenum() {
            const enumtype = command.enum("EnumType", "enum1", "Enum2", "ENUM3");
            command.enum("EnumType", "enum4"); // duplicate check

            const ts_enum = command.enum("DimensionId", DimensionId);

            await checkCommandRegister(this, "mappercheck", [[enumtype, "enum1", "enum1"]])();
            await checkCommandRegister(this, "mappers", [
                // Tests for enums with strings and the string mapper
                [enumtype, "ENUM1", "enum1"],
                [enumtype, "enum3", "ENUM3"],
                [enumtype, "enum4", undefined],
                [command.enum("EnumType2", ["test"]), "test", "test"],
                // Tests for enums with numeric values
                [ts_enum, "overworld", 0],
                [ts_enum, "Nether", 1],
                [ts_enum, "THEEND", 2],
            ])();
        },

        async commandrawenum() {
            const gameModeEnum = command.rawEnum("GameMode");
            this.arrayEquals(gameModeEnum.getValues(), ["default", "creative", "spectator", "survival", "adventure", "d", "c", "s", "a"]);

            for (let i = 0; i < 2; i++) {
                await checkCommandRegister(this, "raw" + i, [
                    [command.rawEnum("GameMode"), "default", 5], // Test for built-in enums with numeric values
                    [command.rawEnum("IntGameRule"), "maxcommandchainlength", "maxcommandchainlength"], // Test for built-in enums with strings
                    [command.rawEnum("EntityType"), "minecraft:zombie", "minecraft:zombie"], // Test for built-in enums with custom type (ActorDefinitionIdentifier for this case, but maps to string)
                    [command.rawEnum("Enchant"), "fire_protection", "fire_protection"],
                ])();
            }

            // await checkCommandRegister('extends', [
            //     [command.enum('EntityType', {a: 0}), 'a', 0], // Test for built-in enums with custom type (ActorDefinitionIdentifier for this case, but maps to number) and the new value 'a' as 0
            //     [command.enum('EntityType', 'custom'), 'custom', 'custom'], // Test for built-in enums with custom type (ActorDefinitionIdentifier for this case, but maps to string) and the new value 'custom'
            //     [command.enum('Difficulty', 'aaa'), 'aaa', 'aaa'], // Test for built-in enums and the new value 'aaa'
            // ])();
        },

        async commandsoftenum() {
            await checkCommandRegister(this, "soft", [
                [command.softEnum("Soft1", "softenum"), "anything", "anything"], // Test for soft enums
                [command.softEnum("Soft2", "first", "Second!!", "THI R D"), '"thi r d"', "thi r d"], // Test for soft enums
                [command.softEnum("Tool", "Override", "another"), "Override", "Override"], // Test for built-in soft enums with new values
            ])();
        },

        async checkPacketNames() {
            const deletePackets = new Set([MinecraftPacketIds.AdventureSettings]);
            for (const id in PacketIdToType) {
                try {
                    const Packet = PacketIdToType[+id as keyof PacketIdToType];
                    let packet: Packet;
                    try {
                        packet = Packet.allocate();
                    } catch (err) {
                        if (err.message.endsWith(" is not created")) {
                            this.assert(deletePackets.has(+id), err.message);
                            continue;
                        } else {
                            throw err;
                        }
                    }

                    const rva = pdbcache.search(`?getId@${Packet.name}@@UEBA?AW4MinecraftPacketIds@@XZ`);
                    this.assert(rva !== -1, `${Packet.name}: class name not found, getName()=${packet.getName()}`);
                    this.equals(packet.getId(), Packet.ID);
                    if (rva !== -1) {
                        this.equals(makefunc.js(dllraw.current.add(rva), int32_t)(), Packet.ID, `${Packet.name}, class name mismatched`);
                    }

                    let name = Packet.name;
                    const idx = name.lastIndexOf("Packet");
                    if (idx !== -1) name = name.substr(0, idx) + name.substr(idx + 6);
                    this.equals(MinecraftPacketIds[Packet.ID], name, "packet ID name mismatch");

                    packet.dispose();
                } catch (err) {
                    this.error(err.message);
                }
            }

            for (const id in MinecraftPacketIds) {
                if (!/^\d+$/.test(id)) continue;
                const Packet = PacketIdToType[+id as keyof PacketIdToType];
                this.assert(!!Packet, `MinecraftPacketIds.${MinecraftPacketIds[id]}: class not found`);
            }
        },

        classFields() {
            {
                const packet = ModalFormResponsePacket.allocate();
                this.equals(packet.id, 0);
                this.equals(packet.response.value(), undefined);
                packet.id = 10;
                packet.response.initValue();
                packet.response.value()!.setValue("test");
                packet.dispose();
            }

            {
                const itemStack = ItemStack.constructWith("minecraft:dirt", 12, 1);
                this.equals(itemStack.block, Block.create("minecraft:dirt", 1), "itemStack.block");
                this.equals(itemStack.valid, true, "itemStack.vaild");
                this.equals(itemStack.showPickup, true, "itemStack.showPickup");
                this.equals(itemStack.canPlaceOn.size(), 0, "itemStack.canPlaceOn");
                this.equals(itemStack.canDestroy.size(), 0, "itemStack.canDestroy");
                this.equals(itemStack.amount, 12, "itemStack.amount");

                const itemDesc = NetworkItemStackDescriptor.constructWith(itemStack);
                this.equals(itemDesc._unknown, "\0\0\0\0\0\0\0\0\0\0", "itemDesc._unknown");
                itemDesc._unknown = "over 15 bytes string";
                itemDesc.destruct();
                itemStack.destruct();
            }
        },

        packetEvents() {
            let idcheck = 0;
            let sendpacket = 0;
            let ignoreEndingPacketsAfter = 0; // ignore ni check of send for the avoiding disconnected ni.

            for (let i = 0; i < 255; i++) {
                if (tooHeavy.has(i)) continue;
                events.packetRaw(i).on(
                    this.wrap((ptr, size, ni, packetId) => {
                        this.equals(nextPacketPhase, PacketPhase.Raw, `unexpected phase, id=${packetId}`);
                        nextPacketPhase = PacketPhase.Before;
                        this.assert(nextEventTimeout === null, "timeout exists");
                        nextEventTimeout = setTimeout(()=>{
                            this.error("packet before did not fire, id="+packetId);
                        }, 3000);
                        this.assert(ni.getAddress() !== "UNASSIGNED_SYSTEM_ADDRESS", "packetRaw, Invalid ni, id=" + packetId);
                        idcheck = packetId;
                        this.assert(size > 0, `packetRaw, packet is too small (size = ${size})`);
                        this.equals(packetId, ptr.readVarUint() & 0x3ff, `packetRaw, different packetId in buffer. id=${packetId}`);
                    }, 0),
                );
                events.packetBefore<MinecraftPacketIds>(i).on(
                    this.wrap((ptr, ni, packetId) => {
                        this.equals(nextPacketPhase, PacketPhase.Before, `unexpected phase, id=${packetId}`);
                        nextPacketPhase = PacketPhase.After;
                        this.assert(nextEventTimeout !== null, "no timeout");
                        clearTimeout(nextEventTimeout!);
                        nextEventTimeout = setTimeout(()=>{
                            this.error("packet after did not fire, id="+packetId);
                        }, 3000);
                        this.assert(ni.getAddress() !== "UNASSIGNED_SYSTEM_ADDRESS", "packetBefore, Invalid ni, id=" + packetId);
                        this.equals(packetId, idcheck, `packetBefore, different packetId on before. id=${packetId}`);
                        this.equals(ptr.getId(), idcheck, `packetBefore, different class.packetId on before. id=${packetId}`);
                    }, 0),
                );
                events.packetAfter<MinecraftPacketIds>(i).on(
                    this.wrap((ptr, ni, packetId) => {
                        this.equals(nextPacketPhase, PacketPhase.After, `unexpected phase, id=${packetId}`);
                        nextPacketPhase = PacketPhase.Raw;
                        this.assert(nextEventTimeout !== null, "no timeout");
                        clearTimeout(nextEventTimeout!);
                        nextEventTimeout = null;
                        this.assert(ni.getAddress() !== "UNASSIGNED_SYSTEM_ADDRESS", "packetAfter, Invalid ni, id=" + packetId);
                        this.equals(packetId, idcheck, `packetAfter, different packetId on after. id=${packetId}`);
                        this.equals(ptr.getId(), idcheck, `packetAfter, different class.packetId on after. id=${packetId}`);
                    }, 0),
                );
                events.packetSend<MinecraftPacketIds>(i).on(
                    this.wrap((ptr, ni, packetId) => {
                        this.equals(nextPacketSendPhase, PacketPhase.Before, `unexpected phase, id=${packetId}`);
                        nextPacketSendPhase = PacketPhase.Raw;
                        if (Date.now() < ignoreEndingPacketsAfter) {
                            this.assert(ni.getAddress() !== "UNASSIGNED_SYSTEM_ADDRESS", "packetSend, Invalid ni, id=" + packetId);
                        }
                        sendidcheck = packetId;
                        this.equals(ptr.getId(), packetId, `packetSend, different class.packetId on send. id=${packetId}`);
                        sendpacket++;
                    }, 0),
                );
                events.packetSendRaw(i).on(
                    this.wrap((ptr, size, ni, packetId) => {
                        const recentSent = getRecentSentPacketId();
                        if (recentSent !== null) {
                            // example raw packet
                            nextPacketSendPhase = PacketPhase.Raw;
                        }
                        this.equals(nextPacketSendPhase, PacketPhase.Raw, `unexpected phase, id=${packetId}`);
                        nextPacketSendPhase = PacketPhase.Before;
                        if (recentSent !== null) {
                            sendidcheck = recentSent;
                        }
                        if (Date.now() < ignoreEndingPacketsAfter) {
                            this.assert(ni.getAddress() !== "UNASSIGNED_SYSTEM_ADDRESS", "packetSendRaw, Invalid ni, id=" + packetId);
                        }
                        this.assert(size > 0, `packetSendRaw, packet size is too little`);
                        if (chatCancelCounter === 0 && packetId !== MinecraftPacketIds.PacketViolationWarning) {
                            this.equals(packetId, sendidcheck, `packetSendRaw, different packetId on sendRaw. id=${packetId}`);
                        }
                        this.equals(packetId, ptr.readVarUint() & 0x3ff, `packetSendRaw, different packetId in buffer. id=${packetId}`);
                        sendpacket++;
                    }, 0),
                );
            }

            const conns = new Set<NetworkIdentifier>();
            events.packetAfter(MinecraftPacketIds.Login).on(
                this.wrap((ptr, ni) => {
                    ignoreEndingPacketsAfter = Date.now() + 2000;
                    this.assert(!conns.has(ni), "[test] login without connection");
                    conns.add(ni);

                    const connreq = ptr.connreq;
                    this.assert(connreq !== null, "no ConnectionRequest, client version mismatched?");
                    if (connreq !== null) {
                        const cert = connreq.getCertificate();
                        let uuid = cert.json.value()["extraData"]["identity"];
                        this.equals(cert.getIdentityString(), uuid, "getIdentityString() !== extraData.identity");
                    }

                    setTimeout(() => {
                        if (sendpacket === 0) {
                            this.error("[test] no packet was sent");
                        }
                    }, 1000);
                }),
            );
            events.networkDisconnected.on(
                this.wrap(ni => {
                    this.assert(conns.delete(ni), "[test] disconnection without connection");
                }, 0),
            );
            events.packetSend(MinecraftPacketIds.AvailableCommands).on(
                this.wrap(p => {
                    const commandArray = p.commands.toArray();
                    for (let i = 0; i < commandArray.length; i++) {
                        if (commandArray[i].name === "teleport") {
                            commandArray.splice(i, 1);
                            i--;
                        }
                    }
                    // p.commands.setFromArray(commandArray); // TODO: implement AvailableCommandsCommandData fully
                }, 1),
            );
        },

        actor() {
            events.entityCreated.on(
                this.wrap(ev => {
                    const level = bedrockServer.level;

                    try {
                        const actor = ev.entity;
                        const identifier = actor.getIdentifier();
                        this.assert(identifier.startsWith("minecraft:"), "Invalid identifier");
                        if (identifier === "minecraft:player") {
                            this.equals(level.getPlayers().length, bedrockServer.serverInstance.getActivePlayerCount(), "Unexpected player size");
                            this.assert(actor !== null, "Actor.fromEntity of player is null");
                        }

                        if (actor !== null) {
                            const dim = actor.getDimension();
                            this.assert(isDimensionClass(dim), "getDimension() is invalid");
                            this.equals(actor.getDimensionId(), dim.getDimensionId(), "getDimensionId() is invalid");
                            if (actor instanceof Player) {
                                const abilities = actor.getAbilities();
                                const cmdlevel = abilities.getCommandPermissions();
                                this.assert(CommandPermissionLevel.Normal <= cmdlevel && cmdlevel <= CommandPermissionLevel.Internal, "invalid actor.abilities");
                                this.equals(actor.getCommandPermissionLevel(), cmdlevel, "Invalid command permission level");
                                const playerlevel = abilities.getPlayerPermissions();
                                this.assert(PlayerPermission.VISITOR <= playerlevel && playerlevel <= PlayerPermission.CUSTOM, "invalid actor.abilities");
                                this.equals(actor.getPermissionLevel(), playerlevel, "Invalid player permission level");

                                if (!(actor instanceof SimulatedPlayer)) {
                                    this.equals(actor.getCertificate().getXuid(), connectedXuid, "xuid mismatch");
                                }

                                const pos = actor.getSpawnPosition();
                                const dim = actor.getSpawnDimension();
                                this.equals(dim, DimensionId.Undefined, "respawn dimension mismatch");

                                actor.setRespawnPosition(BlockPos.create(1, 2, 3), DimensionId.TheEnd);
                                const newPos = actor.getSpawnPosition();
                                const respawnpointCheck = newPos.x === 1 && newPos.y === 2 && newPos.z === 3 && actor.getSpawnDimension() === DimensionId.TheEnd;
                                this.assert(respawnpointCheck, "respawn position/dimension mismatch");
                                if (!respawnpointCheck) process.exit(-1); // terminate it for not saving it.

                                actor.setRespawnPosition(pos, dim);

                                const item = ItemStack.constructWith("minecraft:cobblestone");
                                const cloned = item.clone();
                                actor.addItem(item);
                                item.destruct();

                                actor.addItem(cloned);
                                cloned.destruct();

                                // test for hasFamily
                                this.assert(actor.hasFamily("player") === true, "the actor must be a Player");
                                this.assert(actor.hasFamily("undead") === false, "the actor must be not a Undead Mob");
                                const ROUND_UP_AXIS = 0x10000;
                                const checkAbility = (index: AbilitiesIndex, expected: boolean | number): void => {
                                    const abil = abilities.getAbility(index);
                                    let actual = abil.getValue();
                                    if (typeof actual === "number") actual = Math.round(actual * ROUND_UP_AXIS) / ROUND_UP_AXIS;
                                    if (typeof expected === "number") expected = Math.round(expected * ROUND_UP_AXIS) / ROUND_UP_AXIS;
                                    this.equals(actual, expected, `unexpected ${AbilitiesIndex[index]} value`, { stackOffset: 1 });
                                };
                                checkAbility(AbilitiesIndex.Build, true);
                                checkAbility(AbilitiesIndex.Mine, true);
                                checkAbility(AbilitiesIndex.DoorsAndSwitches, true);
                                checkAbility(AbilitiesIndex.OpenContainers, true);
                                checkAbility(AbilitiesIndex.AttackMobs, true);
                                // checkAbility(AbilitiesIndex.Invulnerable, false); // skip for creative
                                // checkAbility(AbilitiesIndex.Flying, false); // skip for creative
                                // checkAbility(AbilitiesIndex.MayFly, false); // skip for creative
                                // checkAbility(AbilitiesIndex.Instabuild, false); // skip for creative
                                checkAbility(AbilitiesIndex.Lightning, false);
                                checkAbility(AbilitiesIndex.FlySpeed, 0.05);
                                checkAbility(AbilitiesIndex.WalkSpeed, 0.1);
                                checkAbility(AbilitiesIndex.Muted, false);
                                checkAbility(AbilitiesIndex.WorldBuilder, false);
                                checkAbility(AbilitiesIndex.NoClip, false);
                            }

                            if (identifier === "minecraft:player") {
                                const players = level.getPlayers();
                                const last = players[players.length - 1];
                                this.assert(last === actor, "the joined player is not a last player");
                                const name = actor.getNameTag();
                                if (!(actor instanceof SimulatedPlayer)) {
                                    this.equals(name, connectedId, "id does not match");
                                    this.equals(actor.getNetworkIdentifier(), connectedNi, "the network identifier does not match");
                                    this.assert(actor === connectedNi.getActor(), "ni.getActor() is not actor");
                                    actor.setName("test");
                                    this.equals(actor.getNameTag(), "test", "name is not set");
                                    actor.setName(name);
                                }
                                this.equals(actor.getEntityTypeId(), ActorType.Player, "player type does not match");
                                this.assert(actor.isPlayer(), "player is not the player");
                                this.assert(Actor.fromEntity(actor.getEntity()) === actor, "actor.getEntity is not entity");
                            } else {
                                this.assert(!actor.isPlayer(), `an entity that is not a player is a player (identifier:${identifier})`);
                            }
                        }
                    } catch (err) {
                        this.processError(err);
                    }
                }, 5),
            );

            events.playerJoin.on(
                this.wrap(ev => {
                    const player = ev.player;
                    try {
                        this.equals(player.playerUIContainer.vftable, proc["??_7PlayerUIContainer@@6B@"], "player.playerUIContainer is broken");
                        const netId = player.getNetworkIdentifier();
                        this.equals(player.deviceId, bedrockServer.serverNetworkHandler.fetchConnectionRequest(netId).getDeviceId(), "player.deviceId is broken");

                        const region = player.getRegion();
                        const levelChunk = region.getChunkAt(BlockPos.create(player.getPosition()));
                        if (levelChunk) {
                            const entityRefs = levelChunk.getChunkEntities();
                            for (const entityRef of entityRefs) {
                                const entityFromRef = entityRef.tryUnwrapActor();
                                if (entityFromRef) {
                                    const actorId = entityFromRef.getUniqueIdBin();
                                    const entityFromChunk = levelChunk.getEntity(actorId);
                                    this.assert(entityFromRef === entityFromChunk, "fetched entity is wrong");
                                } else {
                                    this.error("failed to get entity from WeakEntityRef");
                                }
                            }
                        }
                    } catch (err) {
                        this.processError(err);
                    }
                }),
            );
        },

        chat() {
            const MAX_CHAT = 6;
            events.packetSend(MinecraftPacketIds.Text).on((ev, ni) => {
                if (chatCancelCounter >= 2) return;
                if (ev.message === "TEST YEY!") {
                    chatCancelCounter++;
                    this.log(`test (${chatCancelCounter}/${MAX_CHAT})`);
                    if (chatCancelCounter === 2) {
                        nextPacketSendPhase = PacketPhase.Before;
                        ni.getActor()!.sendMessage(`test (2/${MAX_CHAT})`);
                        return CANCEL; // canceling
                    }
                    if (chatCancelCounter === 1) {
                        ev.message = `test (1/${MAX_CHAT})`;
                    }
                }
            });

            events.packetBefore(MinecraftPacketIds.Text).on((packet, ni) => {
                if (chatCancelCounter < 2) return;
                if (packet.message == "TEST YEY!") {
                    chatCancelCounter++;
                    this.log(`test (${chatCancelCounter}/${MAX_CHAT})`);
                    this.equals(connectedNi, ni, "the network identifier does not match");
                    if (chatCancelCounter === MAX_CHAT) {
                        this.log("> tested and stopping...");
                        setTimeout(() => bedrockServer.stop(), 1000);
                    }
                    nextPacketPhase = PacketPhase.Raw;
                    if (nextEventTimeout !== null) {
                        clearTimeout(nextEventTimeout);
                        nextEventTimeout = null;
                    }
                    ni.getActor()!.sendMessage(`test (${chatCancelCounter}/${MAX_CHAT})`);
                    return CANCEL;
                }
            });
        },

        attributeNames() {
            @nativeClass(null)
            class Attribute extends AbstractClass {
                @nativeField(int32_t)
                u: int32_t;
                @nativeField(int32_t)
                id: int32_t;
                @nativeField(HashedString)
                readonly name: HashedString;
            }
            const getByName = procHacker.js("?getByName@Attribute@@SAAEAV1@AEBVHashedString@@@Z", Attribute, null, HashedString);
            for (const key of getEnumKeys(AttributeId)) {
                const name = AttributeName[key];
                if (key === "ZombieSpawnReinforcementsChange") continue; // deleted
                const hashname = HashedString.construct();
                hashname.set(name);
                const attr = getByName(hashname);
                this.equals(attr.id, AttributeId[key], `AttributeId(${name}) mismatch`);
                hashname.destruct();
            }
        },

        testPlayerCount() {
            events.queryRegenerate.once(
                this.wrap(v => {
                    this.equals(v.currentPlayers, 0, "player count mismatch");
                    this.equals(v.maxPlayers, bedrockServer.serverInstance.getMaxPlayers(), "max player mismatch");
                }),
            );
            bedrockServer.serverNetworkHandler.updateServerAnnouncement();

            events.packetAfter(MinecraftPacketIds.Login).once(
                this.wrap((packet, ni) => {
                    setTimeout(
                        this.wrap(() => {
                            events.queryRegenerate.once(v => {
                                this.equals(v.currentPlayers, 1, "player count mismatch");
                            });
                        }),
                        1000,
                    );
                }),
            );
        },

        etc() {
            const item = ItemStack.constructWith("minecraft:acacia_boat");
            item.destruct();

            const CreativeItemCategoryFromString = procHacker.js(
                "?CreativeItemCategoryFromString@@YA?AW4CreativeItemCategory@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
                int32_t,
                null,
                CxxString,
            );
            this.equals(CreativeItemCategoryFromString("construction"), CreativeItemCategory.Construction);
            this.equals(CreativeItemCategoryFromString("nature"), CreativeItemCategory.Nature);
            this.equals(CreativeItemCategoryFromString("equipment"), CreativeItemCategory.Equipment);
            this.equals(CreativeItemCategoryFromString("items"), CreativeItemCategory.Items);
            this.equals(CreativeItemCategoryFromString("commands"), CreativeItemCategory.Commands);
            this.equals(CreativeItemCategoryFromString("none"), CreativeItemCategory.None);
        },

        nbt() {
            const tagTypes: (typeof Tag)[] = [
                EndTag,
                ByteTag,
                ShortTag,
                IntTag,
                Int64Tag,
                FloatTag,
                DoubleTag,
                ByteArrayTag,
                StringTag,
                ListTag,
                CompoundTag,
                IntArrayTag,
            ];

            for (let i = 0; i < 10; i++) {
                for (const tagType of tagTypes) {
                    const allocated = tagType.allocate();
                    allocated.dispose();
                }

                const barray = ByteArrayTag.allocateWith([1, 2, 3, 4, 5]);
                const iarray = IntArrayTag.allocateWith([1, 2, 3, 4]);
                const str = StringTag.allocateWith("12345678901234567890");
                const map = CompoundTag.allocate();
                const list = ListTag.allocate();
                list.push(str);

                this.assert(list.equals(list), "list.equals");

                const mapLoop = 20;
                const mapItemCount = 4;
                for (let j = 0; j < mapLoop; j++) {
                    map.set("barray" + j, barray);
                    map.set("iarray" + j, iarray);
                    map.set("str" + j, str);
                    map.set("list" + j, list);
                }
                this.equals(map.size(), mapLoop * mapItemCount, "Compound key count check");

                const cloned = iarray.allocateClone();
                barray.dispose();
                iarray.dispose();
                str.dispose();
                list.dispose();

                this.assert(arrayEquals(cloned.toInt32Array(), [1, 2, 3, 4]), "IntArrayTag check");
                cloned.dispose();

                const mapvalue = map.value();
                for (let j = 0; j < mapLoop; j++) {
                    this.assert(mapvalue["barray" + j] instanceof Uint8Array && arrayEquals([1, 2, 3, 4, 5], mapvalue["barray" + j]), "ByteArrayTag check");
                    this.assert(mapvalue["iarray" + j] instanceof Int32Array && arrayEquals([1, 2, 3, 4], mapvalue["iarray" + j]), "IntArrayTag check");
                    this.equals(mapvalue["str" + j], "12345678901234567890", "StringTag check");
                    this.assert(mapvalue["list" + j] instanceof Array && arrayEquals(["12345678901234567890"], mapvalue["list" + j]), "ListTag check");
                }
                this.equals(Object.keys(mapvalue).length, mapLoop * mapItemCount, "Compound key count check");
                map.dispose();
            }

            const nbtSample = {
                int: 123,
                true: true,
                false: false,
                byte: NBT.byte(1),
                short: NBT.short(2),
                int2: NBT.int(3),
                int64: NBT.int64(4),
                string: "string",
                list: [1, 2, 3, 4, "1", "2", "3", "4", [], {}],
                emptyList: [],
                byteArray: NBT.byteArray([1, 2, 3]),
                emptyByteArray: NBT.byteArray([]),
                intArray: NBT.intArray([1]),
                emptyIntArray: NBT.intArray([]),
                compound: {
                    compound: { a: "a", b: "b", c: "c" },
                    0: 0,
                    1: 1,
                    2: 2,
                },
                emptyCompound: {},
                "\\": "backslash test\\",
                "\\\\": "backslash test\\\\",
                "\\\\\\": "backslash test\\\\\\",
                '\\"\\\\\\': 'backslash test\\\\\\"\\',
            };

            const snbt = NBT.stringify(nbtSample, 4);
            const oldone = NBT.allocate(nbtSample);
            const newone = NBT.allocate(NBT.parse(snbt));
            if (!oldone.equals(newone)) {
                this.error("SNBT converting mismatch");
            }
            this.equals(stripSlashes("\\\\\\\"\\n\\r\\b\\v\\f\\t\\'\\u0031\\x31"), "\\\"\n\r\b\v\f\t'11", "stripSlashes");
            this.equals(
                NBT.stringify(NBT.parse("{\"true\":true,false:false,'string':'string',\"longArray\":[L;1l,2l,3l,4l]}")),
                '{true:1b,false:0b,string:"string",longArray:[1l,2l,3l,4l]}',
                "SNBT parse only feature",
            );

            const nbt_ex = "[3.4028234663852886e+38]";
            this.equals(NBT.stringify(NBT.parse(nbt_ex)), "[3.4028234663852886e+38d]");
        },

        itemActor() {
            events.playerJoin.once(
                this.wrap(ev => {
                    const pos = ev.player.getPosition();
                    const region = ev.player.getRegion();
                    const actor = Actor.summonAt(region, pos, ActorType.Item, -1);
                    this.assert(actor instanceof ItemActor, "ItemActor summoning");
                    this.equals((actor as ItemActor).itemStack.vftable, proc["??_7ItemStack@@6B@"], "ItemActor.itemStack is not ItemStack");
                    actor.despawn();
                }),
            );
        },

        actorRunCommand() {
            events.playerJoin.once(
                this.wrap(ev => {
                    this.assert(ev.player.runCommand("testcommand_cmdtest").isSuccess(), "Actor.runCommand failed");
                }),
            );
        },

        block() {
            this.equals(Block.create("dirt")?.getName(), "minecraft:dirt");
            this.equals(Block.create("minecraft:dirt")?.getName(), "minecraft:dirt");
            this.equals(Block.create("minecraft:air")?.getName(), "minecraft:air");
            this.equals(Block.create("minecraft:element_111")?.getName(), "minecraft:element_111");
            this.equals(Block.create("minecraft:_no_block_"), null, "minecraft:_no_block_ is not null");
            this.equals(Block.create("dirt")!, Block.create("dirt"), "dirt is not dirt");
            this.notEquals(Block.create("planks", 0)!, Block.create("planks", 1), "planks#0 is planks#1");
        },

        blockPos() {
            this.assert(BlockPos.MIN.equal(BlockPos.create(INT32_MIN, INT32_MIN, INT32_MIN)), "Broken BlockPos.MIN");
            this.assert(BlockPos.MAX.equal(BlockPos.create(INT32_MAX, INT32_MAX, INT32_MAX)), "Broken BlockPos.MAX");

            this.assert(BlockPos.ZERO.equal(BlockPos.create(0, 0, 0)), "Broken BlockPos.ZERO");
            this.assert(BlockPos.ONE.equal(BlockPos.create(1, 1, 1)), "Broken BlockPos.ONE");

            this.assert(Vec3.MIN.equal(Vec3.create(FLOAT32_MIN, FLOAT32_MIN, FLOAT32_MIN)), "Broken Vec3.MIN");
            this.assert(Vec3.MAX.equal(Vec3.create(FLOAT32_MAX, FLOAT32_MAX, FLOAT32_MAX)), "Broken Vec3.MAX");

            this.assert(Vec3.ZERO.equal(Vec3.create(0, 0, 0)), "Broken Vec3.ZERO");
            this.assert(Vec3.HALF.equal(Vec3.create(0.5, 0.5, 0.5)), "Broken Vec3.HALF");
            this.assert(Vec3.ONE.equal(Vec3.create(1, 1, 1)), "Broken Vec3.ONE");
            this.assert(Vec3.TWO.equal(Vec3.create(2, 2, 2)), "Broken Vec3.TWO");

            this.assert(Vec3.UNIT_X.equal(Vec3.create(1, 0, 0)), "Broken Vec3.UNIT_X");
            this.assert(Vec3.NEG_UNIT_X.equal(Vec3.create(-1, 0, 0)), "Broken Vec3.NEG_UNIT_X");

            this.assert(Vec3.UNIT_Y.equal(Vec3.create(0, 1, 0)), "Broken Vec3.UNIT_Y");
            this.assert(Vec3.NEG_UNIT_Y.equal(Vec3.create(0, -1, 0)), "Broken Vec3.NEG_UNIT_Y");

            this.assert(Vec3.UNIT_Z.equal(Vec3.create(0, 0, 1)), "Broken Vec3.UNIT_Z");
            this.assert(Vec3.NEG_UNIT_Z.equal(Vec3.create(0, 0, -1)), "Broken BlockPos.NEG_UNIT_Z");
        },

        blob() {
            const blob = mce.Blob.construct();
            blob.setFromArray([1, 2, 3, 4]);
            this.arrayEquals(blob.toArray(), [1, 2, 3, 4]);
            blob.setFromBuffer(new Uint8Array([1, 2, 3, 4, 5, 6]));
            this.arrayEquals<ArrayLike<number>>(blob.toBuffer(), [1, 2, 3, 4, 5, 6]);
            blob.destruct();
        },
    },
);

let connectedNi: NetworkIdentifier;
let connectedId: string;
let connectedXuid: string;

events.packetRaw(MinecraftPacketIds.Login).on((ptr, size, ni) => {
    connectedNi = ni;
});
events.packetAfter(MinecraftPacketIds.Login).on(ptr => {
    const connreq = ptr.connreq;
    if (connreq === null) return;
    const cert = connreq.getCertificate();
    connectedId = cert.getId();
    connectedXuid = cert.getXuid();
});
