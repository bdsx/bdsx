"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bdsx_1 = require("bdsx");
const netevent_1 = require("bdsx/netevent");
(() => __awaiter(void 0, void 0, void 0, function* () {
    let idcheck = 0;
    for (let i = 0; i < 255; i++) {
        bdsx_1.netevent.raw(i).on((ptr, size, ni, packetId) => {
            idcheck = packetId;
        });
        bdsx_1.netevent.after(i).on((ptr, ni, packetId) => {
            console.assert(packetId === idcheck, 'different packetId');
        });
        bdsx_1.netevent.before(i).on((ptr, ni, packetId) => {
            console.assert(packetId === idcheck, 'different packetId');
        });
    }
    const conns = new Set();
    bdsx_1.netevent.after(bdsx_1.PacketId.Login).on((ptr, ni) => {
        console.assert(!conns.has(ni), 'logined without connected');
        conns.add(ni);
    });
    netevent_1.close.on(ni => {
        console.assert(conns.delete(ni), 'disconnected without connected');
    });
    yield bdsx_1.fs.writeFile('./test.txt', 'test');
    console.assert((yield bdsx_1.fs.readFile('./test.txt')) === 'test', 'file reading failed');
    console.assert(bdsx_1.fs.deleteFileSync('./test.txt'), 'file deleting failed');
    bdsx_1.command.hook.on((cmd, origin) => {
        console.log({ cmd, origin });
        if (cmd === 'test') {
            bdsx_1.serverControl.stop();
        }
    });
    bdsx_1.command.net.on((ev) => {
        console.log('net: ' + ev.command);
    });
    try {
        const mariadb = new bdsx_1.MariaDB('localhost', 'test', '1234');
        const v = yield mariadb.execute('select 1');
        console.assert(v[0][0] === '1', 'mariadb: select 1 failed');
    }
    catch (err) {
        console.log(`mariadb test failed: ${err.message}`);
    }
}))().catch(console.error);
const system = server.registerSystem(0, 0);
system.listenForEvent("minecraft:entity_created" /* EntityCreated */, ev => {
    const uniqueId = ev.data.entity.__unique_id__;
    const actor2 = bdsx_1.Actor.fromUniqueId(uniqueId["64bit_low"], uniqueId["64bit_high"]);
    const actor = bdsx_1.Actor.fromEntity(ev.data.entity);
    console.assert(actor === actor2, 'Actor.fromEntity is not matched');
    console.assert(actor.getUniqueIdLow() === uniqueId["64bit_low"] && actor.getUniqueIdHigh() === uniqueId["64bit_high"], 'Actor uniqueId is not matched');
    if (ev.__identifier__ === 'minecraft:player') {
        console.assert(actor.getTypeId() == 0x13f, 'player type is not matched');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwrQkFBeUc7QUFDekcsNENBQXNDO0FBSXRDLENBQUMsR0FBTyxFQUFFO0lBRU4sSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQ3RCO1FBQ0ksZUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUMsRUFBRTtZQUMxQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsZUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBQyxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO1FBQ0gsZUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBQyxFQUFFO1lBQ3ZDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO0tBQ047SUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQUMzQyxlQUFRLENBQUMsS0FBSyxDQUFDLGVBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFDLEVBQUU7UUFDekMsT0FBTyxDQUFDLE1B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