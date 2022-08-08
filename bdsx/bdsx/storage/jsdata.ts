import { BufferReader, BufferWriter } from "../writer/bufferstream";

enum Opcode {
    PositiveInteger,
    NegativeInteger,
    String,
    Object,
    Array,
    Extra,

    Reserved1,
    Reserved2,
}
enum ExCode {
    Null = 0 << 4,
    Undefined = 1 << 4,
    True = 2 << 4,
    False = 3 << 4,
    Float32 = 4 << 4,
    Float64 = 5 << 4,
    Date = 6 << 4,

    Reserved2,
}

class Serializer {
    constructor(private readonly writer:BufferWriter) {
    }

    buffer():Uint8Array {
        return this.writer.buffer();
    }

    writeUint(opcode:number, n:number):void {
        const excode = n % 0x8;
        n = Math.floor(n / 0x8);
        if (n === 0) {
            this.writer.writeUint8((excode << 4) | opcode);
        } else {
            this.writer.writeUint8((excode << 4) | opcode | 0x80);
            for (;;) {
                const value = n % 0x80;
                n = Math.floor(n / 0x80);
                if (n === 0) {
                    this.writer.writeUint8(value);
                    break;
                } else {
                    this.writer.writeUint8(value | 0x80);
                }
            }
        }
    }
    writeNumber(n:number):void {
        if (Math.round(n) === n && Number.MIN_SAFE_INTEGER <= n && n <= Number.MAX_SAFE_INTEGER) {
            if (n >= 0) {
                this.writeUint(Opcode.PositiveInteger, n);
            } else {
                this.writeUint(Opcode.NegativeInteger, -n - 1);
            }
        } else {
            if (Math.fround(n) === n) {
                this.writer.writeUint8(Opcode.Extra | ExCode.Float32);
                this.writer.writeFloat32(n);
            } else {
                this.writer.writeUint8(Opcode.Extra | ExCode.Float64);
                this.writer.writeFloat64(n);
            }
        }
    }
    writeString(value:string):void {
        this.writeUint(Opcode.String, value.length);
        this.writer.write(Buffer.from(value, 'utf8'));
    }
    writeArray(list:unknown[]):void {
        this.writeUint(Opcode.Array, list.length);
        for (const item of list) {
            this.writeValue(item);
        }
    }
    writeObject(obj:Record<string, unknown>):void {
        const entries = Object.entries(obj);
        this.writeUint(Opcode.Object, entries.length);
        for (const [key, value] of entries) {
            this.writer.writeVarString(key);
            this.writeValue(value);
        }
    }
    writeDate(date:Date):void {
        let v = date.getTime();
        if (v < 0) {
            v = v*-2-1;
        } else {
            v *= 2;
        }
        this.writer.put(Opcode.Extra | ExCode.Date);
        this.writer.writeVarUint(v);
    }
    writeValue(value:unknown):void {
        switch (typeof value) {
        case 'number': this.writeNumber(value); break;
        case 'boolean': this.writer.writeUint8(Opcode.Extra | (value ? ExCode.True : ExCode.False)); break;
        case 'object':
            if (value instanceof Array) {
                this.writeArray(value);
            } else if (value instanceof Date) {
                this.writeDate(value);
            } else {
                if (value === null) {
                    this.writer.writeUint8(Opcode.Extra | ExCode.Null);
                } else {
                    this.writeObject(value as any);
                }
            }
            break;
        case 'string': this.writeString(value); break;
        case 'undefined': this.writer.writeUint8(Opcode.Extra | ExCode.Undefined); break;
        default:
            throw Error('not supported yet');
        }
    }
}

class Deserializer {
    constructor(private readonly reader:BufferReader) {
    }

    readUint(head:number):number {
        let value = head >>= 4;
        if ((value & 0x8) === 0) {
            return value;
        }
        value &= 0x7;
        let mul = 8;
        for (;;) {
            const v = this.reader.readUint8();
            if ((v & 0x80) === 0) {
                return (v & 0x7f) * mul + value;
            } else {
                value += v * mul;
            }
            mul *= 0x80;
        }
    }

    readString(head:number):string {
        const len = this.readUint(head);
        return this.reader.getBuffer(len).toString('utf8');
    }

    readObject(head:number):Record<string, any> {
        const len = this.readUint(head);
        const out:Record<string, any> = {};
        for (let i=0;i<len;i++) {
            const key = this.reader.readVarString();
            out[key] = this.readValue();
        }
        return out;
    }

    readArray(head:number):any[] {
        const len = this.readUint(head);
        const out = new Array<any>(len);
        for (let i=0;i<len;i++) {
            out[i] = this.readValue();
        }
        return out;
    }

    readDate():Date {
        const n = this.reader.readVarUint();
        if (n % 2 === 1) {
            return new Date(n * -0.5 - 0.5);
        } else {
            return new Date(n / 2);
        }
    }

    readValue():any {
        const head = this.reader.readUint8();
        const opcode = head & 0xf;
        switch (opcode) {
        case Opcode.PositiveInteger:
            return this.readUint(head);
        case Opcode.NegativeInteger:
            return -this.readUint(head)-1;
        case Opcode.String:
            return this.readString(head);
        case Opcode.Object:
            return this.readObject(head);
        case Opcode.Array:
            return this.readArray(head);
        case Opcode.Extra:
            switch (head & 0xf0) {
            case ExCode.Null:
                return null;
            case ExCode.Undefined:
                return undefined;
            case ExCode.True:
                return true;
            case ExCode.False:
                return false;
            case ExCode.Float32:
                return this.reader.readFloat32();
            case ExCode.Float64:
                return this.reader.readFloat64();
            case ExCode.Date:
                return this.readDate();
            }
        }
    }
}

export namespace jsdata {

    export function serialize(data:unknown, writer:BufferWriter = new BufferWriter(new Uint8Array(64), 0)):Uint8Array {
        const s = new Serializer(writer);
        s.writeValue(data);
        return s.buffer();
    }

    export function deserialize(buffer:Uint8Array|BufferReader):any {
        const ds = new Deserializer(buffer instanceof BufferReader ? buffer : new BufferReader(buffer));
        return ds.readValue();
    }

}
