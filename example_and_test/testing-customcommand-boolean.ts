import { asm, Register } from "bdsx/assembler";
import { command } from "bdsx/command";
import { UNDNAME_NAME_ONLY } from "bdsx/dbghelp";
import { events } from "bdsx/event";
import { bool_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";


const hacker = ProcHacker.load('../pdbcache_by_example.ini', ['DayLockCommand::setup'], UNDNAME_NAME_ONLY);
const saved = hacker.saveAndWrite('DayLockCommand::setup', 0, asm().xor_r_r(Register.rax, Register.rax).ret());

events.serverOpen.on(()=>{
    // regist daylock
    command.register('daylock', 'commands.daylock.description', 1, 0, 0).overload((param, origin, output)=>{
        console.log(`boolean example> origin=${origin.getName()}`);
        console.log(`value: ${param.lock}`);
    }, {
        lock: [bool_t, true],
    }).alias('alwaysday');
    // saved.restore();
    // const setup = hacker.js('DayLockCommand::setup', void_t, null, CommandRegistry);
    // setup(serverInstance.minecraft.commands.getRegistry());
});
