
import { dll } from 'bdsx/dll';
import { NativeType } from 'bdsx/nativetype';
import { IMAGE_DOS_HEADER, IMAGE_IMPORT_DESCRIPTOR, IMAGE_NT_HEADERS64, IMAGE_SECTION_HEADER } from 'bdsx/windows_h';
import colors = require('colors');

function IMAGE_FIRST_SECTION(ntheader:IMAGE_NT_HEADERS64):IMAGE_SECTION_HEADER {
    return ntheader.addAs(IMAGE_SECTION_HEADER, IMAGE_NT_HEADERS64.offsetOf('OptionalHeader') + ntheader.FileHeader.SizeOfOptionalHeader);
}

const LOAD_LIBRARY_AS_DATAFILE = 0x00000002;

enum DepsError
{
    NotFound,
    InvalidDosSignature,
    InvalidNtSignature,
    InvalidTooSmall
}

function stringToSignature(str:string):number {
    let sig = 0;
    let shift = 0;
    for (let i=0;i<str.length;i++) {
        sig |= str.charCodeAt(i) << shift;
        shift += 8;
    }
    return sig;
}

const SIGNATURE_MZ = stringToSignature('MZ');
const SIGNATURE_PE = stringToSignature('PE');

interface DepsResultTree {
    [key:string]:DepsResult
}
type DepsResult = DepsError|DepsResultTree;

class DllWalker {
    private readonly tested = new Set<string>();

    constructor(private errorOnly:boolean) {
    }

    getDeps(filename:string):DepsResult|null {
        if (filename.startsWith("api-ms-win-")) return null;

        if (this.tested.has(filename)) return null;
        this.tested.add(filename);

        const module = dll.kernel32.LoadLibraryExW(filename, null, LOAD_LIBRARY_AS_DATAFILE);
        if (module.isNull()) {
            return DepsError.NotFound;
        }
        if ((module.getAddressLow()&1) === 0) {
            return this.errorOnly ? null : {}; // already loaded
        }

        try {
            for (;;) {
                const dos = module.subAs(IMAGE_DOS_HEADER, 1);
                if (dos.e_magic !== SIGNATURE_MZ) {
                    return DepsError.InvalidDosSignature;
                }
                
                const nt = dos.addAs(IMAGE_NT_HEADERS64, dos.e_lfanew);
                if (nt.Signature !== SIGNATURE_PE) {
                    return DepsError.InvalidNtSignature;
                }
    
                if (nt.OptionalHeader.NumberOfRvaAndSizes < 2) break;
    
                const importdesc_vaddr = nt.OptionalHeader.DataDirectory[1].VirtualAddress;
                if (importdesc_vaddr === 0) break;

                let obj:DepsResultTree|null = null;
                let count = 0;
    
                {
                    const sectionCount = nt.FileHeader.NumberOfSections;
                    let section = IMAGE_FIRST_SECTION(nt);
                    for (let i = 0; i < sectionCount; i++) {
                        if ((section.VirtualAddress <= importdesc_vaddr) && (importdesc_vaddr < section.VirtualAddress + section.SizeOfRawData)) {
                            const off = section.PointerToRawData - section.VirtualAddress;
                            let importdesc = dos.addAs(IMAGE_IMPORT_DESCRIPTOR, importdesc_vaddr + off);
                            for (;;) {
                                if (importdesc.Name === 0 && 
                                    importdesc.Characteristics === 0 &&
                                    importdesc.FirstThunk === 0 &&
                                    importdesc.ForwarderChain === 0 &&
                                    importdesc.OriginalFirstThunk === 0 &&
                                    importdesc.TimeDateStamp === 0) {
                                    break;
                                }
                                const name = dos.add(importdesc.Name + off).getString();
                                const child = this.getDeps(name);
                                if (child !== null) {
                                    if (obj === null) obj = {};
                                    obj[name] = child;
                                    count++;
                                }

                                importdesc = importdesc.addAs(IMAGE_IMPORT_DESCRIPTOR, IMAGE_IMPORT_DESCRIPTOR[NativeType.size]);
                            }
                            break;
                        }
                        section = section.addAs(IMAGE_SECTION_HEADER, IMAGE_SECTION_HEADER[NativeType.size]);
                    }
                }
                if (count === 0) break;
                return obj;
            }
            return this.errorOnly ? null : {};
        } finally {
            dll.kernel32.FreeLibrary(module);
        }
    }
}

export namespace dllchecker {
    const messages:{[key:number]:string} = {
        [DepsError.NotFound]: 'not found',
        [DepsError.InvalidDosSignature]: 'Invalid DLL, DOS signature does not match',
        [DepsError.InvalidNtSignature]: 'Invalid DLL, NT signature does not match',
        [DepsError.InvalidTooSmall]: 'Invalid DLL, File size is too small',
    };
    
    export function getDependency(filename:string, errorOnly:boolean):DepsResult|null {
        const walker = new DllWalker(errorOnly);
        return walker.getDeps(filename);
    }

    export function check(path:string):void {
        const err = getDependency(path, true);
        if (typeof err === 'number') {
            console.error(`${colors.red(path)}: ${colors.red(messages[err] || 'ERR#'+err)}`);
            return;
        }
        if (err === null) {
            console.error(`${path}: No problem`);
            return;
        }
        console.error(`${path}`);
        dump(err);
    }

    export function dump(deps:DepsResultTree, indent:string = ''):void {
        
        const entires = Object.entries(deps);
        const last = entires.length - 1;
    
        for (let i=0;i<entires.length;i++) {
            const [dllname, err] = entires[i];
            const branch = i === last ? '└' : '├';
            if (typeof err === 'number') {
                console.error(`${indent}${branch} ${colors.red(dllname)}: ${colors.red(messages[err] || 'ERR#'+err)}`);
            } else {
                console.error(`${indent}${branch} ${dllname}`);
                dump(err!, indent + (i === last ? '　' : '│'));
            }
        }
    }
    
}
