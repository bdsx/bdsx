
// Custom Command
import { bdsx } from "bdsx/v3";

// raw text
bdsx.command.register('aaa', 'bdsx command example').overload((param, origin, output)=>{
    console.log(param.rawtext);
}, { rawtext:bdsx.command.RawText });

// optional
bdsx.command.register('bbb', 'optional param example').overload((param, origin, output)=>{
    console.log(`optional param example> origin=${origin.getName()}`);
    console.log(`first: ${param.first}`);
    if (param.second !== undefined) console.log(`second: ${param.second}`);
}, {
    first: bdsx.command.Integer,
    second: bdsx.command.String.optional(),
});

// empty parameters
bdsx.command.register('ccc', 'empty params example').overload((param, origin, output)=>{
    console.log(`empty params example> origin=${origin.getName()}`);
}, {});

// relative float, /ccc ~~~
bdsx.command.register('ddd', 'relative float example').overload((param, origin, output)=>{
    console.log(`relative float example> origin=${origin.getName()}`);
    console.log(param.x.value, param.x.is_relative);
    console.log(param.y.value, param.y.is_relative);
    console.log(param.z.value, param.z.is_relative);
}, {
    x: bdsx.command.RelativeFloat,
    y: bdsx.command.RelativeFloat,
    z: bdsx.command.RelativeFloat,
});

// entity
bdsx.command.register('eee', 'entity example').overload((param, origin, output)=>{
    console.log(`entity example> origin=${origin.getName()}`);
    for (const entity of param.target) {
        console.log(entity.name);
    }
}, {
    target: bdsx.command.EntityWildcard,
});

// boolean
bdsx.command.register('fff', 'boolean example').overload((param, origin, output)=>{
    console.log(`boolean example> origin=${origin.getName()}`);
    console.log(`value: ${param.b}`);
}, {
    b: bdsx.command.Boolean,
});

// json
bdsx.command.register('ggg', 'json example').overload((param, origin, output)=>{
    console.log(`json example> origin=${origin.getName()}`);
    console.log(`value: ${JSON.stringify(param.json)}`);
}, {
    json: bdsx.command.Json,
});
