import { imageSections } from "./imagesections";
import { PdbIdentifier } from "./symbolparser";
import fs = require('fs');
import path = require('path');


const outpath = path.join(__dirname, 'globals');
try {
    fs.mkdirSync(outpath);
} catch (err) {
}

interface Identifier extends PdbIdentifier {
    host?:TsFile;
    jsTypeName?:string;
}

const NAMES = ['T','U','V','W','X','Y','Z'];

type Filter = ((id:Identifier)=>boolean)|string|null|RegExp;

function filterToFunction(filters:Filter[]):(id:Identifier)=>boolean {
    filters = filters.filter(f=>f!==null);
    return id=>{
        for (const filter of filters) {
            switch (typeof filter) {
            case 'string':
                if (id.name === filter) return true;
                break;
            case 'function':
                if (filter(id)) return true;
                break;
            default:
                if (filter!.test(id.name)) return true;
                break;
            }
        }
        return false;
    };
}

function getFiltered(filters:Filter[]):Identifier[] {
    const filter = filterToFunction(filters);
    const filted:Identifier[] = [];
    for (let i=0;i<ids.length;) {
        const id = ids[i];
        if (filter(id)) {
            filted.push(id);
            if (i === ids.length-1) {
                ids.pop();
            } else {
                ids[i] = ids.pop()!;
            }
        } else {
            i++;
        }
    }
    return filted;
}

function templateSpecialized(name:string):((id:Identifier)=>boolean)|null {
    const base = PdbIdentifier.global.get(name);
    if (!base.isTemplate) return null;
    return id=>id === base || id.templateBase === base;
}

function templateArgs(name:string, idx:number):((id:Identifier)=>boolean)|null {
    const base = PdbIdentifier.global.get(name);
    if (!base.isTemplate) return null;
    const list = new WeakSet<Identifier>();
    for (const spec of base.specialized) {
        list.add(spec.arguments[idx]);
    }
    return id=>list.has(id);
}

function perTemplateArg(name:string, idx:number, ...filters:Filter[]):((id:Identifier)=>boolean)|null {
    const base = PdbIdentifier.global.get(name);
    if (!base.isTemplate) return null;

    const func = filterToFunction(filters);

    return id=>{
        if (id.templateBase !== base) return false;
        return func(id.arguments[idx]);
    };
}

class TsFile {
    private readonly ids:Identifier[];
    private readonly imports = new Map<string, Set<string>>();

    constructor(
        public readonly name:string,
        ...filters:Filter[]) {
        TsFile.all.push(this);
        this.ids = getFiltered(filters);
        this.ids.sort();
        for (const id of this.ids) {
            id.host = this;
        }
    }

    importName(path:string, ...items:string[]):void {
        const arr = this.imports.get(path);
        if (arr) {
            for (const item of items) {
                arr.add(item);
            }
        } else {
            this.imports.set(path, new Set(items));
        }
    }

    importId(id:Identifier):void {
        while (id.parent !== PdbIdentifier.global) {
            id = id.parent!;
        }
        if (/^[0-9]+$/.test(id.name)) {
            if (id.parent !== PdbIdentifier.global) {
                console.error(`Constant is not in global`);
            }
            return; // constant
        }
        if (id.host === this) return;
        if (id.jsTypeName !== undefined) {
            this.importName('../../nativetype', id.jsTypeName);
        } else if (id.host !== undefined) {
            this.importName('./'+id.host.name, id.name);
        } else {
            console.error(`${id.name}: host not found`);
        }
    }

    stringify(id:Identifier):string {
        this.importId(id);
        if (id === string_t) {
            return 'std.string';
        }
        if (id.jsTypeName !== undefined) {
            return id.jsTypeName;
        }
        if (id.isDecoedType && (id.name === '*' || id.name === '&')) {
            return this.stringify(id.parent!)+'.ref()';
        }
        if (id.templateBase !== null) {
            return `${this.stringify(id.templateBase)}.make(${id.arguments.map(id=>this.stringify(id)).join(', ')})`;
        }
        if (id.parent !== PdbIdentifier.global) {
            return `${this.stringify(id.parent!)}.${id.name}`;
        }
        return id.name;
    }

    write():void {
        let definations = '\n\n';
        let out = '\n';
        let nativeClass = false;
        let makefunc = false;
        let nativeTemplateClass = false;
        let staticPointer = false;
        let dll = false;

        for (const item of this.ids) {
            if (item.type === PdbIdentifier.Type.Function) {
                if (item.returnType === null) {
                    if (item.arguments.length !== 0) console.error(`${item.name}: no has the return type but has the arguments types`);
                    staticPointer = true;
                    dll = true;
                    out += `export const ${item.removeParameters().name} = dll.current.addAs(StaticPointer, ${item.address});\n`;
                    continue;
                }
                makefunc = true;
                const params = item.arguments.map(id=>this.stringify(id));
                params.unshift(this.stringify(item.returnType), 'null');

                const base = item.removeParameters();
                if (base.templateBase !== null) {
                    definations += `${this.stringify(base.templateBase)}.make(makefunc.js(${params.join(', ')}), ${item.arguments.map(id=>this.stringify(id)).join(', ')});\n`;
                } else {
                    out += `export const ${base.name} = makefunc.js(${params.join(', ')});\n`;
                }
            } else if (item.templateBase !== null) { // serialized template class
                definations += this.stringify(item);
                definations += ';\n';
            } else {
                if (item.isTemplate) {
                    const params:string[] = [];
                    if (item.specialized.length === 0) {
                        console.error(`${item.name}: has not the specialized class`);
                        params.push('T');
                    } else {
                        const first = item.specialized[0];
                        if (first.type === PdbIdentifier.Type.FunctionBase) {
                            nativeTemplateClass = true;
                            definations += `export const ${item.name} = NativeTemplateFunction.make();\n`;
                            continue;
                        }
                        const n = first.arguments.length;
                        for (let i=0;i<n;i++) {
                            params.push(NAMES[i]);
                        }
                    }
                    nativeTemplateClass = true;
                    out += `export class ${item.name}<${params.join(', ')}> extends NativeTemplateClass {\n`;
                    out += `}\n`;
                } else {
                    nativeClass = true;
                    out += `export class ${item.name} extends NativeClass {\n`;
                    out += `}\n`;
                }
            }
        }
        out += '\n\n';
        let importtext = '\n';
        if (nativeTemplateClass) {
            this.importName('../../template', 'NativeTemplateClass');
        }
        if (nativeClass) {
            this.importName('../../nativeclass', 'NativeClass');
        }
        if (makefunc) {
            this.importName('../../makefunc', 'makefunc');
        }
        if (staticPointer) {
            this.importName('../../core', 'StaticPointer');
        }
        if (dll) {
            this.importName('../../dll', 'dll');
        }
        for (const [path, items] of this.imports) {
            importtext += `import { ${[...items].join(', ')} } from "${path}";\n`;
        }
        importtext += '\n';
        fs.writeFileSync(path.join(outpath, this.name+'.ts'), importtext+out+definations);
    }

    public static readonly all:TsFile[] = [];

    static writeAll():void {
        for (const file of TsFile.all) {
            file.write();
        }
    }
}



const bool_t:Identifier = PdbIdentifier.global.get('bool');
const void_t:Identifier = PdbIdentifier.global.get('void');
const float_t:Identifier = PdbIdentifier.global.get('float');
const int_t:Identifier = PdbIdentifier.global.get('int');
const __int64_t:Identifier = PdbIdentifier.global.get('__int64');
const char_t:Identifier = PdbIdentifier.global.get('char');
const typename_t:Identifier = PdbIdentifier.global.get('typename');
const uint_t:Identifier = int_t.get('unsigned');
const voidptr_t:Identifier = void_t.get('*');
const std = PdbIdentifier.std;
const string_t = std.get('basic_string<char,std::char_traits<char>,std::allocator<char> >');
bool_t.jsTypeName = 'bool_t';
void_t.jsTypeName = 'void_t';
char_t.jsTypeName = 'int8_t';
int_t.jsTypeName = 'int32_t';
uint_t.jsTypeName = 'uint32_t';
__int64_t.jsTypeName = 'bin64_t';
voidptr_t.jsTypeName = 'VoidPointer';
float_t.jsTypeName = 'float32_t';

// remove useless identities

PdbIdentifier.global.children.delete('[type]');
PdbIdentifier.global.children.delete('void');
PdbIdentifier.global.children.delete('bool');
PdbIdentifier.global.children.delete('char');
PdbIdentifier.global.children.delete('short');
PdbIdentifier.global.children.delete('long');
PdbIdentifier.global.children.delete('int');
PdbIdentifier.global.children.delete('__int64');
PdbIdentifier.global.children.delete('float');
PdbIdentifier.global.children.delete('double');
for (const [key, value] of PdbIdentifier.global.children) {
    if (key.startsWith('`')) { // remove private symbols
        PdbIdentifier.global.children.delete(key);
    } else if (key.startsWith('<lambda_')) { // remove lambdas
        PdbIdentifier.global.children.delete(key);
    } else if (/^[0-9]+$/.test(key)) { // remove numbers
        PdbIdentifier.global.children.delete(key);
    } else if (key.startsWith('{')) { // code chunk?
        PdbIdentifier.global.children.delete(key);
    } else if (key === '...') { // variadic args
        PdbIdentifier.global.children.delete(key);
    } else if (key.startsWith('__imp_')) { // import
        PdbIdentifier.global.children.delete(key);
    } else if (/^main\$dtor\$[0-9]+$/.test(key)) { // dtor in main
        PdbIdentifier.global.children.delete(key);
    } else if (value.type === PdbIdentifier.Type.FunctionBase) { // not actual id
        PdbIdentifier.global.children.delete(key);
    } else if (value.isType && value.returnType !== null) { // function type
        PdbIdentifier.global.children.delete(key);
    } else if (value.templateBase !== null && /^[A-Z]/.test(value.name) && value.address === 0) { // expect
        value.setAsClass();
        value.templateBase.setAsClass();
    } else if (value.address !== 0) {
        const section = imageSections.getSectionOfRva(value.address);
        if (section === null) {
            console.error(`${value.name}: Unknown section`);
            continue;
        }

        switch (section.name) {
        case '.pdata': // exception info
            PdbIdentifier.global.children.delete(key);
            break;
        case '.data': // user section?
        case '.rdata': // readonly
            value.setAsFunction();
            break;
        default:
            console.error(`${section.name}, ${value.name}: unspecified section`);
            break;
        }
    }
}

const ids = [...PdbIdentifier.global.children.values()];
// new TsFile('commandbase', /^Command/, /CommandOrigin$/);
// new TsFile('commands', /Command$/);
// new TsFile('packets', /Packet$/);
// new TsFile('makepacket', /^make_packet/);
// new TsFile('packethandlers', /^PacketHandlerDispatcherInstance/);
// new TsFile('components', /Component$/);
// new TsFile('definations', /Definition$/, templateSpecialized('DefinitionSerializer'), templateSpecialized('DefinitionInstanceTyped'), templateSpecialized('EntityComponentDefinition'), templateSpecialized('definition'));
// new TsFile('receips', /Recipe$/);
// new TsFile('listeners', /Listener$/);
// new TsFile('filters', /Test$/, templateSpecialized('FilterOperationNode'), templateSpecialized('FilteredTransformationAttributes'));
// new TsFile('items', /Item$/, perTemplateArg('SharedPtr', 0, /Item$/), perTemplateArg('WeakPtr', 0, /Item$/));
// new TsFile('blocks', /Block[2-4]?$/, perTemplateArg('SharedPtr', 0, /Block[2-4]?$/, perTemplateArg('WeakPtr', 0, /Block[2-4]?$/)));
// new TsFile('actorbases', /Actor$/, /Player$/);
// new TsFile('actors', templateArgs('_actorFromClass', 0));
// new TsFile('actorfrom', /^_actorFromClass/);
// new TsFile('definations', templateSpecialized('DefinitionInstance'));
// new TsFile('scripts', /^Script/);
// new TsFile('actorgoals', templateArgs('ActorGoalDefinition', 0), templateArgs('ActorGoalDefinition', 1), templateSpecialized('ActorGoalDefinition'));
// new TsFile('descriptions', /Description$/);
// new TsFile('filtertest', /^FilterTest/);
// new TsFile('structures', /Pieces$/, /^Structure/);
// new TsFile('biomes', templateSpecialized('BiomeDecorationAttributes'), templateSpecialized('WeightedBiomeAttributes'), /^Biome/);
// new TsFile('molang', /^Molang/);
// new TsFile('features', /Feature$/, /Features$/);
// new TsFile('attributes', /^Attribute/);
// new TsFile('itemstates', templateSpecialized('ItemStateVariant'), templateArgs('ItemStateVariant', 0));
// new TsFile('server',
//     'ServerInstance',
//     'Minecraft',
//     'MinecraftEventing',
//     'VanilaGameModuleServer',
//     'MinecraftScheduler',
//     'MinecraftWorkerPool');
// new TsFile('typeid', /^type_id/, /^typeid_t/);
new TsFile('raknet', 'RakNet');
new TsFile('std', 'std',
    'strchr', 'strcmp', 'strcspn', 'strerror_s', 'strncmp', 'strncpy', 'strrchr',
    'strspn', 'strstart', 'strstr', 'strtol', 'strtoul', 'wcsstr', 'wchar_t',
    'tan', 'tanh', 'cos', 'cosf', 'cosh', 'sin', 'sinf', 'sinh', 'log', 'log10', 'log1p', 'log2', 'logf', 'fabs',
    'asin', 'asinf', 'asinh', 'atan2f',
    'fclose', 'feof', 'ferror', 'fgets', 'fflush',
    'free', 'malloc', '_aligned_malloc', 'delete', 'delete[]', 'delete[](void * __ptr64)', 'delete[](void * __ptr64,unsigned __int64)');
new TsFile('zlib', /^unz/, /^zip/, /^zc/, /^zlib_/, 'z_errmsg');
new TsFile('quickjs', /^js_/, /^JS_/, /^lre_/, /^string_/);
new TsFile('openssl',
    /^EVP_/, /^OPENSSL_/, /^OSSL_/, /^RSA_/, /^SEED_/,
    /^SHA1/, /^SHA224/, /^SHA256/, /^SHA384/, /^SHA3/, /^SHA512/,
    /^X509/, /^X509V3/, /^X448/, /^X25519/, /^XXH64/, /^curve448_/, /^openssl_/, /^rand_/,
    /^d2i_/, /^ec_/, /^i2a_/, /^hmac_/, /^i2c_/, /^i2d_/, /^i2o_/, /^i2s_/, /^i2t_/, /^i2v_/, /^o2i_/, /^v3_/, /^v2i_/,
    /^x448_/, /^x509_/, /^ecdh_/, /^dsa_/, /_meth$/, /^CMS_/, /^CRYPTO_/, /^AES_/, /^ASN1_/);
// new TsFile('classes', id=>id.isClassLike);
// new TsFile('remainings', ()=>true);
new TsFile('minecraft', ()=>true);
TsFile.writeAll();
console.log(`global id count: ${PdbIdentifier.global.children.size}`);
