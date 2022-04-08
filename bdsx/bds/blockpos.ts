import { CommandParameterType } from "../commandparam";
import { abstract } from "../common";
import { nativeClass, nativeField, NativeStruct } from "../nativeclass";
import { bin64_t, bool_t, float32_t, int32_t, NativeType, uint16_t, uint8_t } from "../nativetype";
import { procHacker } from "./proc";

export enum Facing {
    Down,
    Up,
    North,
    South,
    West,
    East,

    Max,
}

export namespace Facing {
    export const convertYRotationToFacingDirection: (yRotation: number) => number = procHacker.js("Facing::convertYRotationToFacingDirection", uint8_t, null, float32_t);
}

@nativeClass()
export class BlockPos extends NativeStruct {
    @nativeField(int32_t)
    x:int32_t;
    @nativeField(int32_t)
    y:int32_t;
    @nativeField(int32_t)
    z:int32_t;

    set(pos:{x:number, y:number, z:number}):void {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }

    relative(facing:Facing, steps:number):BlockPos {
        abstract();
    }

    static create(pos: Vec3): BlockPos;
    static create(x:number, y:number, z:number):BlockPos;
    static create(a:number|{x:number, y:number, z:number}, b?:number, c?:number):BlockPos {
        const v = new BlockPos(true);
        if(typeof a === "number") {
            v.x = a;
            v.y = b!;
            v.z = c!;
        } else {
            v.x = a.x;
            v.y = a.y;
            v.z = a.z;
        }
        return v;
    }

    toJSON():VectorXYZ {
        return {x:this.x, y:this.y, z:this.z};
    }
}

BlockPos.prototype.relative = procHacker.js("BlockPos::relative", BlockPos, {this:BlockPos, structureReturn:true}, uint8_t, int32_t);

@nativeClass()
export class ChunkPos extends NativeStruct {
    @nativeField(int32_t)
    x:int32_t;
    @nativeField(int32_t)
    z:int32_t;

    set(pos:ChunkPos|{x:number, z:number}):void {
        this.x = pos.x;
        this.z = pos.z;
    }

    static create(x:number, z:number):ChunkPos;
    static create(pos:BlockPos):ChunkPos;
    static create(a:number|BlockPos, b?:number):ChunkPos {
        const v = new ChunkPos(true);
        if (typeof a === "number") {
            v.x = a;
            v.z = b!;
        } else {
            v.x = a.x >> 4;
            v.z = a.z >> 4;
        }
        return v;
    }

    toJSON():{x: number, z: number} {
        return {x:this.x, z:this.z};
    }
}

@nativeClass()
export class ChunkBlockPos extends NativeStruct {
    @nativeField(uint8_t)
    x:uint8_t;
    @nativeField(uint16_t)
    y:uint16_t;
    @nativeField(uint8_t)
    z:uint8_t;

    set(pos:ChunkBlockPos|{x:number, y:number, z:number}):void {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }

    static create(x:number, y:number, z:number):ChunkBlockPos;
    static create(pos:BlockPos):ChunkBlockPos;
    static create(a:number|BlockPos, b?:number, c?:number):ChunkBlockPos {
        const v = new ChunkBlockPos(true);
        if (typeof a === "number") {
            v.x = a;
            v.y = b!;
            v.z = c!;
        } else {
            v.x = a.x & 0xF;
            v.y = a.y;
            v.z = a.z & 0xF;
        }
        return v;
    }

    toJSON():VectorXYZ {
        return {x:this.x, y:this.y, z:this.z};
    }
}

@nativeClass()
export class Vec2 extends NativeStruct {
    @nativeField(float32_t)
    x:float32_t;
    @nativeField(float32_t)
    y:float32_t;

    set(pos:Vec2|{x:number, y:number}):void {
        this.x = pos.x;
        this.y = pos.y;
    }

    static create(x:number, y:number):Vec2 {
        const v = new Vec2(true);
        v.x = x;
        v.y = y;
        return v;
    }

    toJSON():{x: number, y: number} {
        return {x:this.x, y:this.y};
    }
}

@nativeClass()
export class Vec3 extends NativeStruct {
    @nativeField(float32_t)
    x:float32_t;
    @nativeField(float32_t)
    y:float32_t;
    @nativeField(float32_t)
    z:float32_t;

    set(pos:Vec3|{x:number, y:number, z:number}):void {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }

    static create(x:number, y:number, z:number):Vec3 {
        const v = new Vec3(true);
        v.x = x;
        v.y = y;
        v.z = z;
        return v;
    }

    toJSON():VectorXYZ {
        return {x:this.x, y:this.y, z:this.z};
    }
}

@nativeClass()
export class RelativeFloat extends NativeStruct {
    static readonly [CommandParameterType.symbol]:true;
    static readonly [NativeType.registerDirect] = true;
    @nativeField(float32_t)
    value:float32_t;
    @nativeField(bool_t)
    is_relative:bool_t;

    @nativeField(bin64_t, 0)
    bin_value:bin64_t;

    set(pos:RelativeFloat|{value:number, is_relative:boolean}):void {
        this.value = pos.value;
        this.is_relative = pos.is_relative;
    }

    static create(value:number, is_relative:boolean):RelativeFloat {
        const v = new RelativeFloat(true);
        v.value = value;
        v.is_relative = is_relative;
        return v;
    }
}
