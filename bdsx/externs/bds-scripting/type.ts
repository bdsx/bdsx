import { HtmlSearcher } from "./htmlutil";
import { styling } from "./styling";
import { FileWriter } from "../../writer/filewriter";

const READONLY = /^READ ONLY. /;
const WILL_BE = / Will be: (.+)\.$/;
const CAN_BE = / Can be: (.+)\.$/;

const typeRemap = new Map<string, {
    type:string;
    comment?:boolean;
}>();
typeRemap.set('String', {type:'string'});
typeRemap.set('Positive Integer', {type:'number', comment: true});
typeRemap.set('Integer', {type:'number', comment: true});
typeRemap.set('JavaScript Object', {type:'any', comment: true});
typeRemap.set('Boolean', {type:'boolean'});
typeRemap.set('Decimal', {type:'number'});
typeRemap.set('JSON Object', {type: 'any'});
typeRemap.set('Range [a, b]', {type: '[number, number]'});
typeRemap.set('Minecraft Filter', {type: 'MinecraftFilter'});
typeRemap.set('Vector [a, b, c]', {type: 'VectorArray'});
typeRemap.set('List', {type: 'any[]'});

function stripRegExp(str:string, regexp:RegExp, onmatch:(matched:RegExpExecArray)=>void):string {
    const res = regexp.exec(str);
    if (res === null) return str;
    str = str.substr(0, res.index) + str.substr(res.index+res[0].length);
    onmatch(res);
    return str;
}

export interface DocFixItem {
    [key:string]:Record<string, string|DocFixItem|DocFixMethod>|string|boolean|null|undefined;
    type?:string;
    desc?:string;
    wrapToArray?:string|boolean;
    optional?:boolean;
    readonly?:boolean;
}

export interface DocFixMethod {
    [key:string]:DocFixItem|string|boolean|undefined;
    return?:string|DocFixItem;
    optional?:boolean;
    desc?:string;
}

export class DocField {

    constructor(
        public name:string,
        public type:DocType){
    }

    static fromRow(row:HtmlSearcher.TableRow):DocField{
        const name = row.Name?.text || '';
        let type:string = row.Type?.text || '';
        let desc = row.Description?.text || row.Value?.text || '';
        let readonly = false;
        const defval = row.DefaultValue?.text || '';

        desc = stripRegExp(desc, READONLY, ()=>{
            readonly = true;
        });
        desc = stripRegExp(desc, WILL_BE, matched=>{
            type = matched[1];
        });
        desc = stripRegExp(desc, CAN_BE, matched=>{
            type = matched[1].split(' or ').join('|');
        });
        const inner = row.Description?.table;
        let ntype:DocType;
        if (inner) {
            ntype = DocType.fromTable(inner);
            if (type === 'List') ntype.arrayWrapped = true;
        } else {
            ntype = new DocType;
            const remapped = typeRemap.get(type);
            if (remapped) {
                if (remapped.comment) desc = `${type}.\n${desc}`;
                ntype.inlineTypeName = remapped.type;
            } else {
                const iname = styling.apiObjectNameToInterfaceName(type);
                if (iname !== null) {
                    ntype.inlineTypeName = iname;
                } else {
                    ntype.inlineTypeName = type;
                }
            }
            if (type === 'JavaScript Object') {
                if (name.endsWith('_position')) {
                    ntype.inlineTypeName = 'VectorXYZ';
                } else switch (name) {
                case 'ticking_area': ntype.inlineTypeName = 'ITickingArea'; break;
                }
            }
        }
        if (defval) {
            desc += `\n@default ${defval}`;
            ntype.optional = true;
        }

        const field = new DocField(name, ntype);
        ntype.readonly = readonly;
        ntype.desc = desc;
        return field;
    }
}

const PARAM = /^param([0-9]+):(.+)$/;

export class DocMethod {
    public readonly params:DocField[] = [];
    public return:DocType|null = null;
    public deleted = false;
    public desc = '';

    constructor(
        public readonly name:string) {
    }

    static fromDocFix(name:string, docfix:DocFixMethod|null):DocMethod {
        const method = new DocMethod(name);
        if (docfix === null) {
            method.deleted = true;
        } else {
            method.desc = docfix.desc || '';
            (docfix as any).__proto__ = null;
            for (const param in docfix) {
                const reg = PARAM.exec(param);
                if (reg === null) continue;
                const fieldfix = DocType.fromDocFix(docfix[param] as DocFixItem);
                method.params[+reg[1]] = new DocField(reg[2], fieldfix);
            }
            for (let i=0;i<method.params.length;i++) {
                if (!method.params[i]) {
                    console.error(`${method.name}: ${i+1} parameter is not provided`);
                    method.params.length = i;
                    break;
                }
            }
            if (docfix.return != null) {
                method.return = DocType.fromDocFix(docfix.return);
            }
        }
        return method;
    }

    setCamel():void {
        for (const param of this.params) {
            param.name = styling.toCamelStyle(param.name, ' ');
        }
    }

    getField(name:string):DocField|null {
        for (const field of this.params) {
            if (!field) continue;
            if (field.name === name) return field;
        }
        return null;
    }

    patch(docfix:DocMethod):this {
        for (const param of this.params) {
            if (!param) continue;

            const paramFix = docfix.getField(param.name);
            if (paramFix === null) continue;
            const fixtype = paramFix.type;
            const type = paramFix.type;
            if (fixtype.inlineTypeName) type.inlineTypeName = fixtype.inlineTypeName;
            if (fixtype.optional) type.optional = true;
        }
        if (docfix.return !== null) {
            if (this.return === null) this.return = docfix.return;
            else this.return.patch(docfix.return);
        }
        if (docfix.deleted) this.deleted = true;
        if (docfix.desc) this.desc = docfix.desc;
        return this;
    }
}

export class DocType {
    public readonly fields:DocField[] = [];
    public readonly methods:DocMethod[] = [];
    public inlineTypeName = '';
    public desc = '';
    public optional:boolean|undefined = false;
    public readonly:boolean|undefined = false;
    public arrayWrapped = false;
    public wrapToArray = '';
    public deleted = false;

    static inline(name:string):DocType {
        const type = new DocType;
        type.inlineTypeName = name;
        return type;
    }

    static fromTable(table:HtmlSearcher.TableRow[]):DocType {
        const out = new DocType;
        for (const row of table) {
            out.fields.push(DocField.fromRow(row));
        }
        return out;
    }

    static fromDocFix(docfix:DocFixItem|string|null):DocType {
        const out = new DocType;
        if (docfix === null) {
            out.deleted = true;
        } else if (typeof docfix === 'string') {
            out.inlineTypeName = docfix;
            out.optional = undefined;
            out.readonly = undefined;
        } else {
            out.desc = docfix.desc || '';
            out.inlineTypeName = docfix.type || '';
            out.optional = docfix.optional;
            out.readonly = docfix.readonly;
            switch (typeof docfix.wrapToArray) {
            case 'string':
                out.wrapToArray = docfix.wrapToArray;
                break;
            case 'boolean':
                out.arrayWrapped = docfix.wrapToArray;
                break;
            }

            (docfix as any).__proto__ = null;
            for (const key in docfix) {
                const item = docfix[key];
                if (key.startsWith('field:')) {
                    const type = DocType.fromDocFix(item as DocFixItem|string);
                    out.fields.push(new DocField(key.substr(6), type));
                } else if (key.startsWith('method:')) {
                    const method = DocMethod.fromDocFix(key.substr(7), item as DocFixMethod);
                    out.methods.push(method);
                }
            }
        }
        return out;
    }

    isVectorXYZ():boolean {
        if (this.methods.length !== 0) return false;
        if (this.fields.length !== 3) return false;
        const obj = new Set<string>(['x','y','z']);
        for (let i=0;i<this.fields.length;i++) {
            const field = this.fields[i];
            if (field.type.inlineTypeName !== 'number') return false;
            if (!obj.delete(field.name)) return false;
        }
        console.assert(obj.size === 0);
        return true;
    }

    getFieldType(name:string):DocType|null {
        for (const field of this.fields) {
            if (field.name === name) return field.type;
        }
        return null;
    }

    getMethod(name:string):DocMethod|null {
        for (const method of this.methods) {
            if (method.name === name) return method;
        }
        return null;
    }

    patch(docfix:DocType):this {
        for (const fieldFix of docfix.fields) {
            const type = this.getFieldType(fieldFix.name);
            if (type === null) {
                this.fields.push(fieldFix);
                this.inlineTypeName = '';
            } else {
                type.patch(fieldFix.type);
            }
        }
        for (const methodFix of docfix.methods) {
            const method = this.getMethod(methodFix.name);
            if (method === null) {
                this.methods.push(methodFix);
                this.inlineTypeName = '';
            } else {
                method.patch(methodFix);
            }
        }
        if (docfix.deleted) this.deleted = true;
        if (docfix.desc) this.desc = docfix.desc;
        if (docfix.inlineTypeName) {
            this.inlineTypeName = docfix.inlineTypeName;
            this.fields.length = 0;
            this.methods.length = 0;
        }
        if (docfix.optional != null) this.optional = docfix.optional;
        if (docfix.readonly != null) this.readonly = docfix.readonly;
        if (docfix.wrapToArray) {
            const inner = new DocType;
            inner.set(this);
            inner.arrayWrapped = true;
            this.fields.push(new DocField(docfix.wrapToArray, inner));
        }
        if (docfix.arrayWrapped) {
            this.arrayWrapped = true;
        }
        return this;
    }

    set(other:DocType):void {
        this.fields.push(...other.fields);
        this.methods.push(...other.methods);
        this.inlineTypeName = other.inlineTypeName;
        this.desc = other.desc;
        this.optional = other.optional;
        this.readonly = other.readonly;
        this.arrayWrapped = other.arrayWrapped;
        this.deleted = other.deleted;
    }

    clear():void {
        this.fields.length = 0;
        this.methods.length = 0;
        this.inlineTypeName = '';
        this.desc = '';
        this.optional = false;
        this.readonly = false;
        this.arrayWrapped = false;
        this.deleted = false;
        this.wrapToArray = '';
    }

    async writeTo(name:string, writer:FileWriter):Promise<void>{
        if (this.deleted) return;

        const tab = '';
        if (this.desc) {
            await writer.write(`${tab}/**\n`);
            await writer.write(`${tab} * ${this.desc.replace(/\n/g, `\n${tab} * `)}\n`);
            await writer.write(`${tab} */\n`);
        }

        if (this.inlineTypeName !== '') {
            await writer.write(`type ${name} = ${this.inlineTypeName};\n\n`);
            return;
        }

        const tabi = '    ';
        if (this.arrayWrapped) await writer.write(`type ${name} = {`);
        else await writer.write(`interface ${name} {\n`);
        for (const field of this.fields) {
            if (field.type.deleted) continue;
            if (field.type.desc) {
                await writer.write(`${tabi}/**\n`);
                await writer.write(`${tabi} * ${field.type.desc.replace(/\n/g, `\n${tabi} * `)}\n`);
                await writer.write(`${tabi} */\n`);
            }
            await writer.write(`${tabi}${field.type.stringify(tabi, field.name, {ignoreOptional:true})};\n`);
        }
        for (const method of this.methods) {
            if (method.deleted) continue;
            await writer.write(`${tabi}/**\n`);
            if (method.desc) await writer.write(`${tabi} * ${method.desc}\n`);
            for (const param of method.params) {
                if (param.type.desc) {
                    await writer.write(`${tabi} * @param ${param.name} ${param.type.desc.replace(/\n/g, `\n${tabi} *    `)}\n`);
                }
            }
            if (method.return !== null) {
                if (method.return.desc) {
                    await writer.write(`${tabi} * @return ${method.return.desc.replace(/\n/g, `\n${tabi} *    `)}\n`);
                }
            }
            await writer.write(`${tabi} */\n`);
            const arr:string[] = [];
            for (const param of method.params) {
                if (param.type.deleted) continue;
                arr.push(`${param.type.stringify(tabi, param.name, {ignoreReadonly: true})}`);
            }
            await writer.write(`${tabi}${method.name}(${arr.join(', ')}):${method.return === null ? 'void' : method.return.stringify(tabi, '')};\n`);
        }
        if (this.arrayWrapped) await writer.write(`}[]\n`);
        else await writer.write(`}\n\n`);
    }

    stringify(tab:string, name:string, opts:{ignoreOptional?:boolean, ignoreReadonly?:boolean}={}):string {
        if (this.arrayWrapped) opts.ignoreOptional = false;

        if (name !== '') {
            name = styling.toFieldName(name);
            if (!opts.ignoreReadonly && this.readonly) name = `readonly ${name}`;
            if (!opts.ignoreOptional && this.optional) name += '?';
            name += ':';
        }
        let out = name;
        if (this.isVectorXYZ()) {
            out += 'VectorXYZ';
        } else {
            const tabi = `${tab}    `;
            if (this.inlineTypeName) {
                out += this.inlineTypeName.replace(/\n/g, `\n${tabi}`);
            } else {
                out +='{\n';
                for (const field of this.fields) {
                    if (field.type.desc) {
                        out += `${tabi}/**\n`;
                        out += `${tabi} * ${field.type.desc.replace(/\n/g, `\n${tabi} * `)}\n`;
                        out += `${tabi} */\n`;
                    }
                    out += `${tabi}${field.type.stringify(tabi, field.name, opts)},\n`;
                }
                out = out.substr(0, out.length-2);
                out += `\n${tab}}`;
            }
        }
        if (this.arrayWrapped) out += '[]';
        return out;
    }

    static async writeTableKeyUnion(name:string, prefix:string, rows:HtmlSearcher.TableRow[], key:string, value:((id:string)=>(string|null)), writer:FileWriter):Promise<void> {
        await writer.write(`interface ${name}Map {\n`);
        const tabi = '    ';
        for (const row of rows) {
            const id = row[key].text;
            if (!id.startsWith(prefix)) {
                console.error(`   └ ${id}: Prefix is not ${prefix}`);
                continue;
            }
            const v = value(id);
            if (v === null) continue;
            await writer.write(`${tabi}${JSON.stringify(v)}:void;\n`);
        }
        await writer.write(`}\n`);
        await writer.write(`type ${name} = keyof ${name}Map;\n\n`);
    }

}
