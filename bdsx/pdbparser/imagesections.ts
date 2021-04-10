import { dll } from "../dll";
import { NativeType } from "../nativetype";
import { makeSignature } from "../util";
import { IMAGE_DOS_HEADER, IMAGE_FIRST_SECTION, IMAGE_NT_HEADERS64, IMAGE_SECTION_HEADER } from "../windows_h";


const DOS_MAGIC = makeSignature('MZ');
const NT_MAGIC = makeSignature('PE');

export class ImageSectionHeader {
    constructor(
        public readonly name:string,
        public readonly rva:number,
        public readonly size:number) {
    }
}

export class ImageSections {
    private readonly sections:ImageSectionHeader[] = [];
    public readonly module = dll.current;

    constructor() {
        const header = this.module.as(IMAGE_DOS_HEADER);
        if (header.e_magic !== DOS_MAGIC) throw Error('Invalid DOS signature');
        const ntheader = header.addAs(IMAGE_NT_HEADERS64, header.e_lfanew);
        if (ntheader.Signature !== NT_MAGIC) throw Error('Invalid NT signature');
        const count = ntheader.FileHeader.NumberOfSections;
        const sectionHeaderSize = IMAGE_SECTION_HEADER[NativeType.size];
        let ptr = IMAGE_FIRST_SECTION(ntheader);
        for (let i=0;i<count;i++) {
            const array = ptr.Name.toArray();
            const len = array.indexOf(0);
            if (len !== -1) array.length = len;
            const name = String.fromCharCode(...array);
            this.sections.push(new ImageSectionHeader(name, ptr.VirtualAddress, ptr.SizeOfRawData));
            ptr = ptr.addAs(IMAGE_SECTION_HEADER, sectionHeaderSize);
        }
    }

    getSectionOfRva(rva:number):ImageSectionHeader|null {
        for (const section of this.sections) {
            if (rva >= section.rva) continue;
            if ((rva-section.rva) >= section.size) return null;
            return section;
        }
        return null;
    }
}

export const imageSections = new ImageSections;
