import { NativeClass } from "bdsx/nativeclass";
import { Level } from "./level";

// struct VFTable
// {
//     void (*destructor)(ScriptCommandOrigin*);
//     Level* (*getLevel)(ScriptCommandOrigin*);
// };
// VFTable* vftable;

export class ScriptCommandOrigin extends NativeClass
{
    destructor:()=>void;
    getLevel:()=>Level;
}
ScriptCommandOrigin.abstract({});
