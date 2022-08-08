
const API_OBJECT_SUFFIX = ' JS API Object';
const VAR_NAME = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/;

export namespace styling {
    export function toCamelStyle(content:string, seperator:string|RegExp, firstUpper?:boolean):string {
        const names = content.split(seperator).filter(v=>v !== '');
        let out = names.shift()!;
        if (firstUpper) out = out.charAt(0).toUpperCase() + out.substr(1);
        else {
            if (/^[A-Z]*$/.test(out)) {
                out = out.toLowerCase();
            } else {
                out = out.charAt(0).toLowerCase() + out.substr(1);
            }
        }
        for (const name of names) {
            out += name.charAt(0).toUpperCase() + name.substr(1);
        }
        return out;
    }

    export function apiObjectNameToInterfaceName(id:string):string|null {
        if (!id.endsWith(API_OBJECT_SUFFIX)) return null;
        return id = `I${id.substr(0, id.length-API_OBJECT_SUFFIX.length).replace(/ /g, '')}`;
    }

    export function toFieldName(name:string):string {
        return VAR_NAME.test(name) ? name : JSON.stringify(name);
    }
}
