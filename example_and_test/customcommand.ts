
// Custom Command
import { RelativeFloat } from "bdsx/bds/blockpos";
import { ActorWildcardCommandSelector, CommandRawText } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bool_t, CxxString, int32_t } from "bdsx/nativetype";
import { JsonValue } from "../bdsx/bds/connreq";

// raw text
command.register('aaa', 'bdsx command example').overload((param, origin, output)=>{
    console.log(param.rawtext.text);
    throw Error('test');
}, { rawtext:CommandRawText });

// optional
command.register('bbb', 'optional param example').overload((param, origin, output)=>{
    console.log(`optional param example> origin=${origin.getName()}`);
    console.log(`first: ${param.first}`);
    if (param.second !== undefined) console.log(`second: ${param.second}`);
}, {
    first: int32_t,
    second: [CxxString, true],
});

// empty parameters
command.register('ccc', 'empty params example').overload((param, origin, output)=>{
    console.log(`empty params example> origin=${origin.getName()}`);
}, {});

// relative float, /ccc ~~~
command.register('ddd', 'relative float example').overload((param, origin, output)=>{
    console.log(`relative float example> origin=${origin.getName()}`);
    console.log(param.x.value, param.x.is_relative);
    console.log(param.y.value, param.y.is_relative);
    console.log(param.z.value, param.z.is_relative);
}, {
    x: RelativeFloat,
    y: RelativeFloat,
    z: RelativeFloat,
});

// entity
command.register('eee', 'entity example').overload((param, origin, output)=>{
    console.log(`entity example> origin=${origin.getName()}`);
    for (const actor of param.target.newResults(origin)) {
        console.log(actor.getName());
    }
}, {
    target: ActorWildcardCommandSelector,
});

// boolean
command.register('fff', 'boolean example').overload((param, origin, output)=>{
    console.log(`boolean example> origin=${origin.getName()}`);
    console.log(`value: ${param.b}`);
}, {
    b: bool_t,
});

// json
command.register('ggg', 'json example').overload((param, origin, output)=>{
    console.log(`json example> origin=${origin.getName()}`);
    console.log(`value: ${JSON.stringify(param.json.value())}`);
}, {
    json: JsonValue,
});
