import { bin } from "./bin";
import { VoidPointer } from "./core";
import { NativeArray, nativeClass, NativeClass, nativeField } from "./nativeclass";
import { bin64_t, int32_t, uint16_t, uint32_t, uint8_t } from "./nativetype";

const UBYTE = uint8_t;
type UBYTE = uint8_t;
const USHORT = uint16_t;
type USHORT = uint16_t;
const ULONG = uint32_t;
type ULONG = uint32_t;

export const MAX_PATH = 260;

export const PAGE_NOACCESS =                    0x01;
export const PAGE_READONLY =                    0x02;
export const PAGE_READWRITE =                   0x04;
export const PAGE_WRITECOPY =                   0x08;
export const PAGE_EXECUTE =                     0x10;
export const PAGE_EXECUTE_READ =                0x20;
export const PAGE_EXECUTE_READWRITE =           0x40;
export const PAGE_EXECUTE_WRITECOPY =           0x80;
export const PAGE_GUARD =                       0x100;
export const PAGE_NOCACHE =                     0x200;
export const PAGE_WRITECOMBINE =                0x400;
export const PAGE_GRAPHICS_NOACCESS =           0x0800;
export const PAGE_GRAPHICS_READONLY =           0x1000;
export const PAGE_GRAPHICS_READWRITE =          0x2000;
export const PAGE_GRAPHICS_EXECUTE =            0x4000;
export const PAGE_GRAPHICS_EXECUTE_READ =       0x8000;
export const PAGE_GRAPHICS_EXECUTE_READWRITE =  0x10000;
export const PAGE_GRAPHICS_COHERENT =           0x20000;
export const PAGE_ENCLAVE_THREAD_CONTROL =      0x80000000;
export const PAGE_REVERT_TO_FILE_MAP =          0x80000000;
export const PAGE_TARGETS_NO_UPDATE =           0x40000000;
export const PAGE_TARGETS_INVALID =             0x40000000;
export const PAGE_ENCLAVE_UNVALIDATED =         0x20000000;
export const PAGE_ENCLAVE_DECOMMIT =            0x10000000;
export const MEM_COMMIT =                       0x00001000;
export const MEM_RESERVE =                      0x00002000;
export const MEM_REPLACE_PLACEHOLDER =          0x00004000;
export const MEM_RESERVE_PLACEHOLDER =          0x00040000;
export const MEM_RESET =                        0x00080000;
export const MEM_TOP_DOWN =                     0x00100000;
export const MEM_WRITE_WATCH =                  0x00200000;
export const MEM_PHYSICAL =                     0x00400000;
export const MEM_ROTATE =                       0x00800000;
export const MEM_DIFFERENT_IMAGE_BASE_OK =      0x00800000;
export const MEM_RESET_UNDO =                   0x01000000;
export const MEM_LARGE_PAGES =                  0x20000000;
export const MEM_4MB_PAGES =                    0x80000000;
export const MEM_64K_PAGES =                    (MEM_LARGE_PAGES | MEM_PHYSICAL);
export const MEM_UNMAP_WITH_TRANSIENT_BOOST =   0x00000001;
export const MEM_COALESCE_PLACEHOLDERS =        0x00000001;
export const MEM_PRESERVE_PLACEHOLDER =         0x00000002;
export const MEM_DECOMMIT =                     0x00004000;
export const MEM_RELEASE =                      0x00008000;
export const MEM_FREE =                         0x00010000;

export const CHAR = uint8_t;
export type CHAR = uint8_t;
export const BYTE = uint8_t;
export type BYTE = uint8_t;
export const WORD = uint16_t;
export type WORD = uint16_t;
export const DWORD = uint32_t;
export type DWORD = uint32_t;
export const LONG = int32_t;
export type LONG = int32_t;
export const ULONGLONG = bin64_t;
export type ULONGLONG = bin64_t;
export const ULONG_PTR = bin64_t;
export type ULONG_PTR = bin64_t;

export const IMAGE_NUMBEROF_DIRECTORY_ENTRIES = 16;
export const IMAGE_DOS_SIGNATURE = 0x5A4D;      // MZ

export const IMAGE_DIRECTORY_ENTRY_EXPORT =          0;   // Export Directory
export const IMAGE_DIRECTORY_ENTRY_IMPORT =          1;   // Import Directory
export const IMAGE_DIRECTORY_ENTRY_RESOURCE =        2;   // Resource Directory
export const IMAGE_DIRECTORY_ENTRY_EXCEPTION =       3;   // Exception Directory
export const IMAGE_DIRECTORY_ENTRY_SECURITY =        4;   // Security Directory
export const IMAGE_DIRECTORY_ENTRY_BASERELOC =       5;   // Base Relocation Table
export const IMAGE_DIRECTORY_ENTRY_DEBUG =           6;   // Debug Directory
//      IMAGE_DIRECTORY_ENTRY_COPYRIGHT       7   // (X86 usage)
export const IMAGE_DIRECTORY_ENTRY_ARCHITECTURE =    7;   // Architecture Specific Data
export const IMAGE_DIRECTORY_ENTRY_GLOBALPTR =       8;   // RVA of GP
export const IMAGE_DIRECTORY_ENTRY_TLS =             9;   // TLS Directory
export const IMAGE_DIRECTORY_ENTRY_LOAD_CONFIG =    10;   // Load Configuration Directory
export const IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT =   11;   // Bound Import Directory in headers
export const IMAGE_DIRECTORY_ENTRY_IAT =            12;   // Import Address Table
export const IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT =   13;   // Delay Load Import Descriptors
export const IMAGE_DIRECTORY_ENTRY_COM_DESCRIPTOR = 14;   // COM Runtime descriptor

export const IMAGE_ORDINAL_FLAG64 = bin.make64(0, 0x80000000);
export const IMAGE_ORDINAL_FLAG32 = 0x80000000;
export const b64_LOW_WORD = bin.make(0xffff, 4);
export function IMAGE_ORDINAL64(Ordinal:string):string { return (bin.bitand(Ordinal, b64_LOW_WORD)); }
export function IMAGE_SNAP_BY_ORDINAL64(Ordinal:string):boolean { return (bin.bitand(Ordinal, IMAGE_ORDINAL_FLAG64) !== bin64_t.zero); }

@nativeClass()
export class IMAGE_DATA_DIRECTORY extends NativeClass {
    @nativeField(DWORD)
    VirtualAddress:DWORD;
    @nativeField(DWORD)
    Size:DWORD;
}
@nativeClass()
export class IMAGE_DOS_HEADER extends NativeClass {
    @nativeField(WORD)
    e_magic: WORD;                     // Magic number
    @nativeField(WORD)
    e_cblp: WORD;                      // Bytes on last page of file
    @nativeField(WORD)
    e_cp: WORD;                        // Pages in file
    @nativeField(WORD)
    e_crlc: WORD;                      // Relocations

    @nativeField(WORD)
    e_cparhdr: WORD;                   // Size of header in paragraphs
    @nativeField(WORD)
    e_minalloc: WORD;                  // Minimum extra paragraphs needed
    @nativeField(WORD)
    e_maxalloc: WORD;                  // Maximum extra paragraphs needed
    @nativeField(WORD)
    e_ss: WORD;                        // Initial (relative) SS value

    @nativeField(WORD)
    e_sp: WORD;                        // Initial SP value
    @nativeField(WORD)
    e_csum: WORD;                      // Checksum
    @nativeField(WORD)
    e_ip: WORD;                        // Initial IP value
    @nativeField(WORD)
    e_cs: WORD;                        // Initial (relative) CS value

    @nativeField(WORD)
    e_lfarlc: WORD;                    // File address of relocation table
    @nativeField(WORD)
    e_ovno: WORD;                      // Overlay number
    @nativeField(NativeArray.make(WORD, 4))
    e_res: NativeArray<WORD>;       // Reserved words

    @nativeField(WORD)
    e_oemid: WORD;                     // OEM identifier (for e_oeminfo)
    @nativeField(WORD)
    e_oeminfo: WORD;                   // OEM information; e_oemid specific
    @nativeField(NativeArray.make(WORD, 10))
    e_res2: NativeArray<WORD>;     // Reserved words
    @nativeField(WORD)
    e_lfanew: LONG;                    // File address of new exe header
}
@nativeClass()
export class IMAGE_FILE_HEADER extends NativeClass {
    @nativeField(WORD)
    Machine: WORD;
    @nativeField(WORD)
    NumberOfSections: WORD;
    @nativeField(DWORD)
    TimeDateStamp: DWORD;
    @nativeField(DWORD)
    PointerToSymbolTable: DWORD;
    @nativeField(DWORD)
    NumberOfSymbols: DWORD;
    @nativeField(WORD)
    SizeOfOptionalHeader: WORD;
    @nativeField(WORD)
    Characteristics: WORD;
}
@nativeClass()
export class IMAGE_OPTIONAL_HEADER64 extends NativeClass {
    @nativeField(WORD)
    Magic: WORD;
    @nativeField(BYTE)
    MajorLinkerVersion: BYTE;
    @nativeField(BYTE)
    MinorLinkerVersion: BYTE;
    @nativeField(DWORD)
    SizeOfCode: DWORD;
    @nativeField(DWORD)
    SizeOfInitializedData: DWORD;
    @nativeField(DWORD)
    SizeOfUninitializedData: DWORD;
    @nativeField(DWORD)
    AddressOfEntryPoint: DWORD;
    @nativeField(DWORD)
    BaseOfCode: DWORD;
    @nativeField(ULONGLONG)
    ImageBase: ULONGLONG;
    @nativeField(DWORD)
    SectionAlignment: DWORD;
    @nativeField(DWORD)
    FileAlignment: DWORD;
    @nativeField(WORD)
    MajorOperatingSystemVersion: WORD;
    @nativeField(WORD)
    MinorOperatingSystemVersion: WORD;
    @nativeField(WORD)
    MajorImageVersion: WORD;
    @nativeField(WORD)
    MinorImageVersion: WORD;
    @nativeField(WORD)
    MajorSubsystemVersion: WORD;
    @nativeField(WORD)
    MinorSubsystemVersion: WORD;
    @nativeField(DWORD)
    Win32VersionValue: DWORD;
    @nativeField(DWORD)
    SizeOfImage: DWORD;
    @nativeField(DWORD)
    SizeOfHeaders: DWORD;
    @nativeField(DWORD)
    CheckSum: DWORD;
    @nativeField(WORD)
    Subsystem: WORD;
    @nativeField(WORD)
    DllCharacteristics: WORD;
    @nativeField(ULONGLONG)
    SizeOfStackReserve: ULONGLONG;
    @nativeField(ULONGLONG)
    SizeOfStackCommit: ULONGLONG;
    @nativeField(ULONGLONG)
    SizeOfHeapReserve: ULONGLONG;
    @nativeField(ULONGLONG)
    SizeOfHeapCommit: ULONGLONG;
    @nativeField(DWORD)
    LoaderFlags: DWORD;
    @nativeField(DWORD)
    NumberOfRvaAndSizes: DWORD;
    @nativeField(NativeArray.make<IMAGE_DATA_DIRECTORY>(IMAGE_DATA_DIRECTORY, IMAGE_NUMBEROF_DIRECTORY_ENTRIES))
    DataDirectory: NativeArray<IMAGE_DATA_DIRECTORY>;
}
@nativeClass()
export class IMAGE_NT_HEADERS64 extends NativeClass {
    @nativeField(DWORD)
    Signature: DWORD;
    @nativeField(IMAGE_FILE_HEADER)
    FileHeader: IMAGE_FILE_HEADER;
    @nativeField(IMAGE_OPTIONAL_HEADER64)
    OptionalHeader: IMAGE_OPTIONAL_HEADER64;
}
@nativeClass()
export class IMAGE_DEBUG_DIRECTORY extends NativeClass {
    @nativeField(DWORD)
    Characteristics: DWORD;
    @nativeField(DWORD)
    TimeDateStamp: DWORD;
    @nativeField(WORD)
    MajorVersion: WORD;
    @nativeField(WORD)
    MinorVersion: WORD;
    @nativeField(DWORD)
    Type: DWORD;
    @nativeField(DWORD)
    SizeOfData: DWORD;
    @nativeField(DWORD)
    AddressOfRawData: DWORD;
    @nativeField(DWORD)
    PointerToRawData: DWORD;
}
@nativeClass()
export class IMAGE_IMPORT_DESCRIPTOR extends NativeClass {
    @nativeField(WORD)
    Characteristics:DWORD;                  // 0 for terminating null import descriptor
    @nativeField(WORD)
    OriginalFirstThunk:DWORD;               // RVA to original unbound IAT (PIMAGE_THUNK_DATA)

    @nativeField(DWORD)
    TimeDateStamp: DWORD;                   // 0 if not bound,
                                            // -1 if bound, and real date\time stamp
                                            //     in IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT (new BIND)
                                            // O.W. date/time stamp of DLL bound to (Old BIND)

    @nativeField(DWORD)
    ForwarderChain: DWORD;                  // -1 if no forwarders
    @nativeField(DWORD)
    Name: DWORD;
    @nativeField(DWORD)
    FirstThunk: DWORD;                      // RVA to IAT (if bound this IAT has actual addresses)
}

class IMAGE_THUNK_DATA64_union extends NativeClass {
    ForwarderString:ULONGLONG;  // PBYTE
    Function:ULONGLONG;         // PDWORD
    Ordinal:ULONGLONG;
    AddressOfData:ULONGLONG;    // PIMAGE_IMPORT_BY_NAME
}
IMAGE_THUNK_DATA64_union.defineAsUnion({
    ForwarderString:ULONGLONG,  // PBYTE
    Function:ULONGLONG,         // PDWORD
    Ordinal:ULONGLONG,
    AddressOfData:ULONGLONG,    // PIMAGE_IMPORT_BY_NAME
});

@nativeClass()
export class IMAGE_THUNK_DATA64 extends NativeClass {
    @nativeField(IMAGE_THUNK_DATA64_union)
    u1:IMAGE_THUNK_DATA64_union;
}

class IMAGE_SECTION_HEADER_Misc extends NativeClass {
    PhysicalAddress:DWORD;
    VirtualSize:DWORD;
}
IMAGE_SECTION_HEADER_Misc.defineAsUnion({
    PhysicalAddress:DWORD,
    VirtualSize:DWORD,
});

const IMAGE_SIZEOF_SHORT_NAME = 8;
@nativeClass()
export class IMAGE_SECTION_HEADER extends NativeClass {
    @nativeField(NativeArray.make(BYTE, IMAGE_SIZEOF_SHORT_NAME))
    Name: NativeArray<BYTE>;
    @nativeField(IMAGE_SECTION_HEADER_Misc)
    Misc:IMAGE_SECTION_HEADER_Misc;
    @nativeField(DWORD)
    VirtualAddress:DWORD;
    @nativeField(DWORD)
    SizeOfRawData:DWORD;
    @nativeField(DWORD)
    PointerToRawData:DWORD;
    @nativeField(DWORD)
    PointerToRelocations:DWORD;
    @nativeField(DWORD)
    PointerToLinenumbers:DWORD;
    @nativeField(WORD)
    NumberOfRelocations:WORD;
    @nativeField(WORD)
    NumberOfLinenumbers:WORD;
    @nativeField(DWORD)
    Characteristics:DWORD;
}

const EXCEPTION_MAXIMUM_PARAMETERS = 15; // maximum number of exception parameters

@nativeClass()
export class EXCEPTION_RECORD extends NativeClass {
    @nativeField(DWORD)
    ExceptionCode:DWORD;
    @nativeField(DWORD)
    ExceptionFlags:DWORD;
    @nativeField(VoidPointer)
    ExceptionRecord:VoidPointer;
    @nativeField(VoidPointer)
    ExceptionAddress:VoidPointer;
    @nativeField(DWORD)
    NumberParameters:DWORD;
    @nativeField(DWORD)
    dummy:DWORD;
    @nativeField(NativeArray.make(ULONG_PTR, EXCEPTION_MAXIMUM_PARAMETERS))
    ExceptionInformation:NativeArray<ULONG_PTR>;
}

// typedef struct DECLSPEC_ALIGN(16) DECLSPEC_NOINITALL _CONTEXT {

//     //
//     // Register parameter home addresses.
//     //
//     // N.B. These fields are for convience - they could be used to extend the
//     //      context record in the future.
//     //

//     DWORD64 P1Home;
//     DWORD64 P2Home;
//     DWORD64 P3Home;
//     DWORD64 P4Home;
//     DWORD64 P5Home;
//     DWORD64 P6Home;

//     //
//     // Control flags.
//     //

//     DWORD ContextFlags;
//     DWORD MxCsr;

//     //
//     // Segment Registers and processor flags.
//     //

//     WORD   SegCs;
//     WORD   SegDs;
//     WORD   SegEs;
//     WORD   SegFs;
//     WORD   SegGs;
//     WORD   SegSs;
//     DWORD EFlags;

//     //
//     // Debug registers
//     //

//     DWORD64 Dr0;
//     DWORD64 Dr1;
//     DWORD64 Dr2;
//     DWORD64 Dr3;
//     DWORD64 Dr6;
//     DWORD64 Dr7;

//     //
//     // Integer registers.
//     //

//     DWORD64 Rax;
//     DWORD64 Rcx;
//     DWORD64 Rdx;
//     DWORD64 Rbx;
//     DWORD64 Rsp;
//     DWORD64 Rbp;
//     DWORD64 Rsi;
//     DWORD64 Rdi;
//     DWORD64 R8;
//     DWORD64 R9;
//     DWORD64 R10;
//     DWORD64 R11;
//     DWORD64 R12;
//     DWORD64 R13;
//     DWORD64 R14;
//     DWORD64 R15;

//     //
//     // Program counter.
//     //

//     DWORD64 Rip;

//     //
//     // Floating point state.
//     //

//     union {
//         XMM_SAVE_AREA32 FltSave;
//         struct {
//             M128A Header[2];
//             M128A Legacy[8];
//             M128A Xmm0;
//             M128A Xmm1;
//             M128A Xmm2;
//             M128A Xmm3;
//             M128A Xmm4;
//             M128A Xmm5;
//             M128A Xmm6;
//             M128A Xmm7;
//             M128A Xmm8;
//             M128A Xmm9;
//             M128A Xmm10;
//             M128A Xmm11;
//             M128A Xmm12;
//             M128A Xmm13;
//             M128A Xmm14;
//             M128A Xmm15;
//         } DUMMYSTRUCTNAME;
//     } DUMMYUNIONNAME;

//     //
//     // Vector registers.
//     //

//     M128A VectorRegister[26];
//     DWORD64 VectorControl;

//     //
//     // Special debug control registers.
//     //

//     DWORD64 DebugControl;
//     DWORD64 LastBranchToRip;
//     DWORD64 LastBranchFromRip;
//     DWORD64 LastExceptionToRip;
//     DWORD64 LastExceptionFromRip;
// } CONTEXT, *PCONTEXT;

@nativeClass()
export class EXCEPTION_POINTERS extends NativeClass {
    @nativeField(EXCEPTION_RECORD.ref())
    ExceptionRecord:EXCEPTION_RECORD;
    @nativeField(VoidPointer)
    ContextRecord:VoidPointer; // CONTEXT
}

@nativeClass()
export class FILETIME extends NativeClass {
    @nativeField(DWORD)
    dwLowDateTime: DWORD;
    @nativeField(DWORD)
    dwHighDateTime: DWORD;
}

export function IMAGE_FIRST_SECTION(ntheader:IMAGE_NT_HEADERS64):IMAGE_SECTION_HEADER {
    return ntheader.addAs(IMAGE_SECTION_HEADER, IMAGE_NT_HEADERS64.offsetOf('OptionalHeader') + ntheader.FileHeader.SizeOfOptionalHeader);
}

export const EXCEPTION_BREAKPOINT = 0x80000003|0;
export const EXCEPTION_ACCESS_VIOLATION = 0xC0000005|0;
export const STATUS_INVALID_PARAMETER = 0xC000000D|0;
export const EXCEPTION_NONCONTINUABLE_EXCEPTION = 0xC0000025|0;

export const FORMAT_MESSAGE_ALLOCATE_BUFFER  = 0x00000100;
export const FORMAT_MESSAGE_IGNORE_INSERTS   = 0x00000200;
export const FORMAT_MESSAGE_FROM_STRING      = 0x00000400;
export const FORMAT_MESSAGE_FROM_HMODULE     = 0x00000800;
export const FORMAT_MESSAGE_FROM_SYSTEM      = 0x00001000;
export const FORMAT_MESSAGE_ARGUMENT_ARRAY   = 0x00002000;
export const FORMAT_MESSAGE_MAX_WIDTH_MASK   = 0x000000FF;

export function MAKELANGID(p:number, s:number):number {
    return (s << 10) | p;
}
export function PRIMARYLANGID(lgid:number):number {
    return lgid & 0x3ff;
}
export function SUBLANGID(lgid:number):number {
    return (lgid & 0xffff) >>> 10;
}

export const LANG_NEUTRAL =                     0x00;
export const LANG_INVARIANT =                   0x7f;

export const LANG_AFRIKAANS =                   0x36;
export const LANG_ALBANIAN =                    0x1c;
export const LANG_ALSATIAN =                    0x84;
export const LANG_AMHARIC =                     0x5e;
export const LANG_ARABIC =                      0x01;
export const LANG_ARMENIAN =                    0x2b;
export const LANG_ASSAMESE =                    0x4d;
export const LANG_AZERI =                       0x2c;   // for Azerbaijani, LANG_AZERBAIJANI is preferred
export const LANG_AZERBAIJANI =                 0x2c;
export const LANG_BANGLA =                      0x45;
export const LANG_BASHKIR =                     0x6d;
export const LANG_BASQUE =                      0x2d;
export const LANG_BELARUSIAN =                  0x23;
export const LANG_BENGALI =                     0x45;   // Some prefer to use LANG_BANGLA
export const LANG_BRETON =                      0x7e;
export const LANG_BOSNIAN =                     0x1a;   // Use with SUBLANG_BOSNIAN_* Sublanguage IDs
export const LANG_BOSNIAN_NEUTRAL =           0x781a;   // Use with the ConvertDefaultLocale function
export const LANG_BULGARIAN =                   0x02;
export const LANG_CATALAN =                     0x03;
export const LANG_CENTRAL_KURDISH =             0x92;
export const LANG_CHEROKEE =                    0x5c;
export const LANG_CHINESE =                     0x04;   // Use with SUBLANG_CHINESE_* Sublanguage IDs
export const LANG_CHINESE_SIMPLIFIED =          0x04;   // Use with the ConvertDefaultLocale function
export const LANG_CHINESE_TRADITIONAL =       0x7c04;   // Use with the ConvertDefaultLocale function
export const LANG_CORSICAN =                    0x83;
export const LANG_CROATIAN =                    0x1a;
export const LANG_CZECH =                       0x05;
export const LANG_DANISH =                      0x06;
export const LANG_DARI =                        0x8c;
export const LANG_DIVEHI =                      0x65;
export const LANG_DUTCH =                       0x13;
export const LANG_ENGLISH =                     0x09;
export const LANG_ESTONIAN =                    0x25;
export const LANG_FAEROESE =                    0x38;
export const LANG_FARSI =                       0x29;   // Deprecated: use LANG_PERSIAN instead
export const LANG_FILIPINO =                    0x64;
export const LANG_FINNISH =                     0x0b;
export const LANG_FRENCH =                      0x0c;
export const LANG_FRISIAN =                     0x62;
export const LANG_FULAH =                       0x67;
export const LANG_GALICIAN =                    0x56;
export const LANG_GEORGIAN =                    0x37;
export const LANG_GERMAN =                      0x07;
export const LANG_GREEK =                       0x08;
export const LANG_GREENLANDIC =                 0x6f;
export const LANG_GUJARATI =                    0x47;
export const LANG_HAUSA =                       0x68;
export const LANG_HAWAIIAN =                    0x75;
export const LANG_HEBREW =                      0x0d;
export const LANG_HINDI =                       0x39;
export const LANG_HUNGARIAN =                   0x0e;
export const LANG_ICELANDIC =                   0x0f;
export const LANG_IGBO =                        0x70;
export const LANG_INDONESIAN =                  0x21;
export const LANG_INUKTITUT =                   0x5d;
export const LANG_IRISH =                       0x3c;   // Use with the SUBLANG_IRISH_IRELAND Sublanguage ID
export const LANG_ITALIAN =                     0x10;
export const LANG_JAPANESE =                    0x11;
export const LANG_KANNADA =                     0x4b;
export const LANG_KASHMIRI =                    0x60;
export const LANG_KAZAK =                       0x3f;
export const LANG_KHMER =                       0x53;
export const LANG_KICHE =                       0x86;
export const LANG_KINYARWANDA =                 0x87;
export const LANG_KONKANI =                     0x57;
export const LANG_KOREAN =                      0x12;
export const LANG_KYRGYZ =                      0x40;
export const LANG_LAO =                         0x54;
export const LANG_LATVIAN =                     0x26;
export const LANG_LITHUANIAN =                  0x27;
export const LANG_LOWER_SORBIAN =               0x2e;
export const LANG_LUXEMBOURGISH =               0x6e;
export const LANG_MACEDONIAN =                  0x2f;   // the Former Yugoslav Republic of Macedonia
export const LANG_MALAY =                       0x3e;
export const LANG_MALAYALAM =                   0x4c;
export const LANG_MALTESE =                     0x3a;
export const LANG_MANIPURI =                    0x58;
export const LANG_MAORI =                       0x81;
export const LANG_MAPUDUNGUN =                  0x7a;
export const LANG_MARATHI =                     0x4e;
export const LANG_MOHAWK =                      0x7c;
export const LANG_MONGOLIAN =                   0x50;
export const LANG_NEPALI =                      0x61;
export const LANG_NORWEGIAN =                   0x14;
export const LANG_OCCITAN =                     0x82;
export const LANG_ODIA =                        0x48;
export const LANG_ORIYA =                       0x48;   // Deprecated: use LANG_ODIA, instead.
export const LANG_PASHTO =                      0x63;
export const LANG_PERSIAN =                     0x29;
export const LANG_POLISH =                      0x15;
export const LANG_PORTUGUESE =                  0x16;
export const LANG_PULAR =                       0x67;   // Deprecated: use LANG_FULAH instead
export const LANG_PUNJABI =                     0x46;
export const LANG_QUECHUA =                     0x6b;
export const LANG_ROMANIAN =                    0x18;
export const LANG_ROMANSH =                     0x17;
export const LANG_RUSSIAN =                     0x19;
export const LANG_SAKHA =                       0x85;
export const LANG_SAMI =                        0x3b;
export const LANG_SANSKRIT =                    0x4f;
export const LANG_SCOTTISH_GAELIC =             0x91;
export const LANG_SERBIAN =                     0x1a;   // Use with the SUBLANG_SERBIAN_* Sublanguage IDs
export const LANG_SERBIAN_NEUTRAL =           0x7c1a;   // Use with the ConvertDefaultLocale function
export const LANG_SINDHI =                      0x59;
export const LANG_SINHALESE =                   0x5b;
export const LANG_SLOVAK =                      0x1b;
export const LANG_SLOVENIAN =                   0x24;
export const LANG_SOTHO =                       0x6c;
export const LANG_SPANISH =                     0x0a;
export const LANG_SWAHILI =                     0x41;
export const LANG_SWEDISH =                     0x1d;
export const LANG_SYRIAC =                      0x5a;
export const LANG_TAJIK =                       0x28;
export const LANG_TAMAZIGHT =                   0x5f;
export const LANG_TAMIL =                       0x49;
export const LANG_TATAR =                       0x44;
export const LANG_TELUGU =                      0x4a;
export const LANG_THAI =                        0x1e;
export const LANG_TIBETAN =                     0x51;
export const LANG_TIGRIGNA =                    0x73;
export const LANG_TIGRINYA =                    0x73;   // Preferred spelling in locale
export const LANG_TSWANA =                      0x32;
export const LANG_TURKISH =                     0x1f;
export const LANG_TURKMEN =                     0x42;
export const LANG_UIGHUR =                      0x80;
export const LANG_UKRAINIAN =                   0x22;
export const LANG_UPPER_SORBIAN =               0x2e;
export const LANG_URDU =                        0x20;
export const LANG_UZBEK =                       0x43;
export const LANG_VALENCIAN =                   0x03;
export const LANG_VIETNAMESE =                  0x2a;
export const LANG_WELSH =                       0x52;
export const LANG_WOLOF =                       0x88;
export const LANG_XHOSA =                       0x34;
export const LANG_YAKUT =                       0x85;   // Deprecated: use LANG_SAKHA,instead
export const LANG_YI =                          0x78;
export const LANG_YORUBA =                      0x6a;
export const LANG_ZULU =                        0x35;

export const SUBLANG_NEUTRAL =                             0x00;    // language neutral
export const SUBLANG_DEFAULT =                             0x01;    // user default
export const SUBLANG_SYS_DEFAULT =                         0x02;    // system default
export const SUBLANG_CUSTOM_DEFAULT =                      0x03;    // default custom language/locale
export const SUBLANG_CUSTOM_UNSPECIFIED =                  0x04;    // custom language/locale
export const SUBLANG_UI_CUSTOM_DEFAULT =                   0x05;    // Default custom MUI language/locale


export const SUBLANG_AFRIKAANS_SOUTH_AFRICA =              0x01;    // Afrikaans (South Africa) 0x0436 af-ZA
export const SUBLANG_ALBANIAN_ALBANIA =                    0x01;    // Albanian (Albania) 0x041c sq-AL
export const SUBLANG_ALSATIAN_FRANCE =                     0x01;    // Alsatian (France) 0x0484
export const SUBLANG_AMHARIC_ETHIOPIA =                    0x01;    // Amharic (Ethiopia) 0x045e
export const SUBLANG_ARABIC_SAUDI_ARABIA =                 0x01;    // Arabic (Saudi Arabia)
export const SUBLANG_ARABIC_IRAQ =                         0x02;    // Arabic (Iraq)
export const SUBLANG_ARABIC_EGYPT =                        0x03;    // Arabic (Egypt)
export const SUBLANG_ARABIC_LIBYA =                        0x04;    // Arabic (Libya)
export const SUBLANG_ARABIC_ALGERIA =                      0x05;    // Arabic (Algeria)
export const SUBLANG_ARABIC_MOROCCO =                      0x06;    // Arabic (Morocco)
export const SUBLANG_ARABIC_TUNISIA =                      0x07;    // Arabic (Tunisia)
export const SUBLANG_ARABIC_OMAN =                         0x08;    // Arabic (Oman)
export const SUBLANG_ARABIC_YEMEN =                        0x09;    // Arabic (Yemen)
export const SUBLANG_ARABIC_SYRIA =                        0x0a;    // Arabic (Syria)
export const SUBLANG_ARABIC_JORDAN =                       0x0b;    // Arabic (Jordan)
export const SUBLANG_ARABIC_LEBANON =                      0x0c;    // Arabic (Lebanon)
export const SUBLANG_ARABIC_KUWAIT =                       0x0d;    // Arabic (Kuwait)
export const SUBLANG_ARABIC_UAE =                          0x0e;    // Arabic (U.A.E)
export const SUBLANG_ARABIC_BAHRAIN =                      0x0f;    // Arabic (Bahrain)
export const SUBLANG_ARABIC_QATAR =                        0x10;    // Arabic (Qatar)
export const SUBLANG_ARMENIAN_ARMENIA =                    0x01;    // Armenian (Armenia) 0x042b hy-AM
export const SUBLANG_ASSAMESE_INDIA =                      0x01;    // Assamese (India) 0x044d
export const SUBLANG_AZERI_LATIN =                         0x01;    // Azeri (Latin) - for Azerbaijani, SUBLANG_AZERBAIJANI_AZERBAIJAN_LATIN preferred
export const SUBLANG_AZERI_CYRILLIC =                      0x02;    // Azeri (Cyrillic) - for Azerbaijani, SUBLANG_AZERBAIJANI_AZERBAIJAN_CYRILLIC preferred
export const SUBLANG_AZERBAIJANI_AZERBAIJAN_LATIN =        0x01;    // Azerbaijani (Azerbaijan, Latin)
export const SUBLANG_AZERBAIJANI_AZERBAIJAN_CYRILLIC =     0x02;    // Azerbaijani (Azerbaijan, Cyrillic)
export const SUBLANG_BANGLA_INDIA =                        0x01;    // Bangla (India)
export const SUBLANG_BANGLA_BANGLADESH =                   0x02;    // Bangla (Bangladesh)
export const SUBLANG_BASHKIR_RUSSIA =                      0x01;    // Bashkir (Russia) 0x046d ba-RU
export const SUBLANG_BASQUE_BASQUE =                       0x01;    // Basque (Basque) 0x042d eu-ES
export const SUBLANG_BELARUSIAN_BELARUS =                  0x01;    // Belarusian (Belarus) 0x0423 be-BY
export const SUBLANG_BENGALI_INDIA =                       0x01;    // Bengali (India) - Note some prefer SUBLANG_BANGLA_INDIA
export const SUBLANG_BENGALI_BANGLADESH =                  0x02;    // Bengali (Bangladesh) - Note some prefer SUBLANG_BANGLA_BANGLADESH
export const SUBLANG_BOSNIAN_BOSNIA_HERZEGOVINA_LATIN =    0x05;    // Bosnian (Bosnia and Herzegovina - Latin) 0x141a bs-BA-Latn
export const SUBLANG_BOSNIAN_BOSNIA_HERZEGOVINA_CYRILLIC = 0x08;    // Bosnian (Bosnia and Herzegovina - Cyrillic) 0x201a bs-BA-Cyrl
export const SUBLANG_BRETON_FRANCE =                       0x01;    // Breton (France) 0x047e
export const SUBLANG_BULGARIAN_BULGARIA =                  0x01;    // Bulgarian (Bulgaria) 0x0402
export const SUBLANG_CATALAN_CATALAN =                     0x01;    // Catalan (Catalan) 0x0403
export const SUBLANG_CENTRAL_KURDISH_IRAQ =                0x01;    // Central Kurdish (Iraq) 0x0492 ku-Arab-IQ
export const SUBLANG_CHEROKEE_CHEROKEE =                   0x01;    // Cherokee (Cherokee) 0x045c chr-Cher-US
export const SUBLANG_CHINESE_TRADITIONAL =                 0x01;    // Chinese (Taiwan) 0x0404 zh-TW
export const SUBLANG_CHINESE_SIMPLIFIED =                  0x02;    // Chinese (PR China) 0x0804 zh-CN
export const SUBLANG_CHINESE_HONGKONG =                    0x03;    // Chinese (Hong Kong S.A.R., P.R.C.) 0x0c04 zh-HK
export const SUBLANG_CHINESE_SINGAPORE =                   0x04;    // Chinese (Singapore) 0x1004 zh-SG
export const SUBLANG_CHINESE_MACAU =                       0x05;    // Chinese (Macau S.A.R.) 0x1404 zh-MO
export const SUBLANG_CORSICAN_FRANCE =                     0x01;    // Corsican (France) 0x0483
export const SUBLANG_CZECH_CZECH_REPUBLIC =                0x01;    // Czech (Czech Republic) 0x0405
export const SUBLANG_CROATIAN_CROATIA =                    0x01;    // Croatian (Croatia)
export const SUBLANG_CROATIAN_BOSNIA_HERZEGOVINA_LATIN =   0x04;    // Croatian (Bosnia and Herzegovina - Latin) 0x101a hr-BA
export const SUBLANG_DANISH_DENMARK =                      0x01;    // Danish (Denmark) 0x0406
export const SUBLANG_DARI_AFGHANISTAN =                    0x01;    // Dari (Afghanistan)
export const SUBLANG_DIVEHI_MALDIVES =                     0x01;    // Divehi (Maldives) 0x0465 div-MV
export const SUBLANG_DUTCH =                               0x01;    // Dutch
export const SUBLANG_DUTCH_BELGIAN =                       0x02;    // Dutch (Belgian)
export const SUBLANG_ENGLISH_US =                          0x01;    // English (USA)
export const SUBLANG_ENGLISH_UK =                          0x02;    // English (UK)
export const SUBLANG_ENGLISH_AUS =                         0x03;    // English (Australian)
export const SUBLANG_ENGLISH_CAN =                         0x04;    // English (Canadian)
export const SUBLANG_ENGLISH_NZ =                          0x05;    // English (New Zealand)
export const SUBLANG_ENGLISH_EIRE =                        0x06;    // English (Irish)
export const SUBLANG_ENGLISH_SOUTH_AFRICA =                0x07;    // English (South Africa)
export const SUBLANG_ENGLISH_JAMAICA =                     0x08;    // English (Jamaica)
export const SUBLANG_ENGLISH_CARIBBEAN =                   0x09;    // English (Caribbean)
export const SUBLANG_ENGLISH_BELIZE =                      0x0a;    // English (Belize)
export const SUBLANG_ENGLISH_TRINIDAD =                    0x0b;    // English (Trinidad)
export const SUBLANG_ENGLISH_ZIMBABWE =                    0x0c;    // English (Zimbabwe)
export const SUBLANG_ENGLISH_PHILIPPINES =                 0x0d;    // English (Philippines)
export const SUBLANG_ENGLISH_INDIA =                       0x10;    // English (India)
export const SUBLANG_ENGLISH_MALAYSIA =                    0x11;    // English (Malaysia)
export const SUBLANG_ENGLISH_SINGAPORE =                   0x12;    // English (Singapore)
export const SUBLANG_ESTONIAN_ESTONIA =                    0x01;    // Estonian (Estonia) 0x0425 et-EE
export const SUBLANG_FAEROESE_FAROE_ISLANDS =              0x01;    // Faroese (Faroe Islands) 0x0438 fo-FO
export const SUBLANG_FILIPINO_PHILIPPINES =                0x01;    // Filipino (Philippines) 0x0464 fil-PH
export const SUBLANG_FINNISH_FINLAND =                     0x01;    // Finnish (Finland) 0x040b
export const SUBLANG_FRENCH =                              0x01;    // French
export const SUBLANG_FRENCH_BELGIAN =                      0x02;    // French (Belgian)
export const SUBLANG_FRENCH_CANADIAN =                     0x03;    // French (Canadian)
export const SUBLANG_FRENCH_SWISS =                        0x04;    // French (Swiss)
export const SUBLANG_FRENCH_LUXEMBOURG =                   0x05;    // French (Luxembourg)
export const SUBLANG_FRENCH_MONACO =                       0x06;    // French (Monaco)
export const SUBLANG_FRISIAN_NETHERLANDS =                 0x01;    // Frisian (Netherlands) 0x0462 fy-NL
export const SUBLANG_FULAH_SENEGAL =                       0x02;    // Fulah (Senegal) 0x0867 ff-Latn-SN
export const SUBLANG_GALICIAN_GALICIAN =                   0x01;    // Galician (Galician) 0x0456 gl-ES
export const SUBLANG_GEORGIAN_GEORGIA =                    0x01;    // Georgian (Georgia) 0x0437 ka-GE
export const SUBLANG_GERMAN =                              0x01;    // German
export const SUBLANG_GERMAN_SWISS =                        0x02;    // German (Swiss)
export const SUBLANG_GERMAN_AUSTRIAN =                     0x03;    // German (Austrian)
export const SUBLANG_GERMAN_LUXEMBOURG =                   0x04;    // German (Luxembourg)
export const SUBLANG_GERMAN_LIECHTENSTEIN =                0x05;    // German (Liechtenstein)
export const SUBLANG_GREEK_GREECE =                        0x01;    // Greek (Greece)
export const SUBLANG_GREENLANDIC_GREENLAND =               0x01;    // Greenlandic (Greenland) 0x046f kl-GL
export const SUBLANG_GUJARATI_INDIA =                      0x01;    // Gujarati (India (Gujarati Script)) 0x0447 gu-IN
export const SUBLANG_HAUSA_NIGERIA_LATIN =                 0x01;    // Hausa (Latin, Nigeria) 0x0468 ha-NG-Latn
export const SUBLANG_HAWAIIAN_US =                         0x01;    // Hawiian (US) 0x0475 haw-US
export const SUBLANG_HEBREW_ISRAEL =                       0x01;    // Hebrew (Israel) 0x040d
export const SUBLANG_HINDI_INDIA =                         0x01;    // Hindi (India) 0x0439 hi-IN
export const SUBLANG_HUNGARIAN_HUNGARY =                   0x01;    // Hungarian (Hungary) 0x040e
export const SUBLANG_ICELANDIC_ICELAND =                   0x01;    // Icelandic (Iceland) 0x040f
export const SUBLANG_IGBO_NIGERIA =                        0x01;    // Igbo (Nigeria) 0x0470 ig-NG
export const SUBLANG_INDONESIAN_INDONESIA =                0x01;    // Indonesian (Indonesia) 0x0421 id-ID
export const SUBLANG_INUKTITUT_CANADA =                    0x01;    // Inuktitut (Syllabics) (Canada) 0x045d iu-CA-Cans
export const SUBLANG_INUKTITUT_CANADA_LATIN =              0x02;    // Inuktitut (Canada - Latin)
export const SUBLANG_IRISH_IRELAND =                       0x02;    // Irish (Ireland)
export const SUBLANG_ITALIAN =                             0x01;    // Italian
export const SUBLANG_ITALIAN_SWISS =                       0x02;    // Italian (Swiss)
export const SUBLANG_JAPANESE_JAPAN =                      0x01;    // Japanese (Japan) 0x0411
export const SUBLANG_KANNADA_INDIA =                       0x01;    // Kannada (India (Kannada Script)) 0x044b kn-IN
export const SUBLANG_KASHMIRI_SASIA =                      0x02;    // Kashmiri (South Asia)
export const SUBLANG_KASHMIRI_INDIA =                      0x02;    // For app compatibility only
export const SUBLANG_KAZAK_KAZAKHSTAN =                    0x01;    // Kazakh (Kazakhstan) 0x043f kk-KZ
export const SUBLANG_KHMER_CAMBODIA =                      0x01;    // Khmer (Cambodia) 0x0453 kh-KH
export const SUBLANG_KICHE_GUATEMALA =                     0x01;    // K'iche (Guatemala)
export const SUBLANG_KINYARWANDA_RWANDA =                  0x01;    // Kinyarwanda (Rwanda) 0x0487 rw-RW
export const SUBLANG_KONKANI_INDIA =                       0x01;    // Konkani (India) 0x0457 kok-IN
export const SUBLANG_KOREAN =                              0x01;    // Korean (Extended Wansung)
export const SUBLANG_KYRGYZ_KYRGYZSTAN =                   0x01;    // Kyrgyz (Kyrgyzstan) 0x0440 ky-KG
export const SUBLANG_LAO_LAO =                             0x01;    // Lao (Lao PDR) 0x0454 lo-LA
export const SUBLANG_LATVIAN_LATVIA =                      0x01;    // Latvian (Latvia) 0x0426 lv-LV
export const SUBLANG_LITHUANIAN =                          0x01;    // Lithuanian
export const SUBLANG_LOWER_SORBIAN_GERMANY =               0x02;    // Lower Sorbian (Germany) 0x082e wee-DE
export const SUBLANG_LUXEMBOURGISH_LUXEMBOURG =            0x01;    // Luxembourgish (Luxembourg) 0x046e lb-LU
export const SUBLANG_MACEDONIAN_MACEDONIA =                0x01;    // Macedonian (Macedonia (FYROM)) 0x042f mk-MK
export const SUBLANG_MALAY_MALAYSIA =                      0x01;    // Malay (Malaysia)
export const SUBLANG_MALAY_BRUNEI_DARUSSALAM =             0x02;    // Malay (Brunei Darussalam)
export const SUBLANG_MALAYALAM_INDIA =                     0x01;    // Malayalam (India (Malayalam Script) ) 0x044c ml-IN
export const SUBLANG_MALTESE_MALTA =                       0x01;    // Maltese (Malta) 0x043a mt-MT
export const SUBLANG_MAORI_NEW_ZEALAND =                   0x01;    // Maori (New Zealand) 0x0481 mi-NZ
export const SUBLANG_MAPUDUNGUN_CHILE =                    0x01;    // Mapudungun (Chile) 0x047a arn-CL
export const SUBLANG_MARATHI_INDIA =                       0x01;    // Marathi (India) 0x044e mr-IN
export const SUBLANG_MOHAWK_MOHAWK =                       0x01;    // Mohawk (Mohawk) 0x047c moh-CA
export const SUBLANG_MONGOLIAN_CYRILLIC_MONGOLIA =         0x01;    // Mongolian (Cyrillic, Mongolia)
export const SUBLANG_MONGOLIAN_PRC =                       0x02;    // Mongolian (PRC)
export const SUBLANG_NEPALI_INDIA =                        0x02;    // Nepali (India)
export const SUBLANG_NEPALI_NEPAL =                        0x01;    // Nepali (Nepal) 0x0461 ne-NP
export const SUBLANG_NORWEGIAN_BOKMAL =                    0x01;    // Norwegian (Bokmal)
export const SUBLANG_NORWEGIAN_NYNORSK =                   0x02;    // Norwegian (Nynorsk)
export const SUBLANG_OCCITAN_FRANCE =                      0x01;    // Occitan (France) 0x0482 oc-FR
export const SUBLANG_ODIA_INDIA =                          0x01;    // Odia (India (Odia Script)) 0x0448 or-IN
export const SUBLANG_ORIYA_INDIA =                         0x01;    // Deprecated: use SUBLANG_ODIA_INDIA instead
export const SUBLANG_PASHTO_AFGHANISTAN =                  0x01;    // Pashto (Afghanistan)
export const SUBLANG_PERSIAN_IRAN =                        0x01;    // Persian (Iran) 0x0429 fa-IR
export const SUBLANG_POLISH_POLAND =                       0x01;    // Polish (Poland) 0x0415
export const SUBLANG_PORTUGUESE =                          0x02;    // Portuguese
export const SUBLANG_PORTUGUESE_BRAZILIAN =                0x01;    // Portuguese (Brazil)
export const SUBLANG_PULAR_SENEGAL =                       0x02;    // Deprecated: Use SUBLANG_FULAH_SENEGAL instead
export const SUBLANG_PUNJABI_INDIA =                       0x01;    // Punjabi (India (Gurmukhi Script)) 0x0446 pa-IN
export const SUBLANG_PUNJABI_PAKISTAN =                    0x02;    // Punjabi (Pakistan (Arabic Script)) 0x0846 pa-Arab-PK
export const SUBLANG_QUECHUA_BOLIVIA =                     0x01;    // Quechua (Bolivia)
export const SUBLANG_QUECHUA_ECUADOR =                     0x02;    // Quechua (Ecuador)
export const SUBLANG_QUECHUA_PERU =                        0x03;    // Quechua (Peru)
export const SUBLANG_ROMANIAN_ROMANIA =                    0x01;    // Romanian (Romania) 0x0418
export const SUBLANG_ROMANSH_SWITZERLAND =                 0x01;    // Romansh (Switzerland) 0x0417 rm-CH
export const SUBLANG_RUSSIAN_RUSSIA =                      0x01;    // Russian (Russia) 0x0419
export const SUBLANG_SAKHA_RUSSIA =                        0x01;    // Sakha (Russia) 0x0485 sah-RU
export const SUBLANG_SAMI_NORTHERN_NORWAY =                0x01;    // Northern Sami (Norway)
export const SUBLANG_SAMI_NORTHERN_SWEDEN =                0x02;    // Northern Sami (Sweden)
export const SUBLANG_SAMI_NORTHERN_FINLAND =               0x03;    // Northern Sami (Finland)
export const SUBLANG_SAMI_LULE_NORWAY =                    0x04;    // Lule Sami (Norway)
export const SUBLANG_SAMI_LULE_SWEDEN =                    0x05;    // Lule Sami (Sweden)
export const SUBLANG_SAMI_SOUTHERN_NORWAY =                0x06;    // Southern Sami (Norway)
export const SUBLANG_SAMI_SOUTHERN_SWEDEN =                0x07;    // Southern Sami (Sweden)
export const SUBLANG_SAMI_SKOLT_FINLAND =                  0x08;    // Skolt Sami (Finland)
export const SUBLANG_SAMI_INARI_FINLAND =                  0x09;    // Inari Sami (Finland)
export const SUBLANG_SANSKRIT_INDIA =                      0x01;    // Sanskrit (India) 0x044f sa-IN
export const SUBLANG_SCOTTISH_GAELIC =                     0x01;    // Scottish Gaelic (United Kingdom) 0x0491 gd-GB
export const SUBLANG_SERBIAN_BOSNIA_HERZEGOVINA_LATIN =    0x06;    // Serbian (Bosnia and Herzegovina - Latin)
export const SUBLANG_SERBIAN_BOSNIA_HERZEGOVINA_CYRILLIC = 0x07;    // Serbian (Bosnia and Herzegovina - Cyrillic)
export const SUBLANG_SERBIAN_MONTENEGRO_LATIN =            0x0b;    // Serbian (Montenegro - Latn)
export const SUBLANG_SERBIAN_MONTENEGRO_CYRILLIC =         0x0c;    // Serbian (Montenegro - Cyrillic)
export const SUBLANG_SERBIAN_SERBIA_LATIN =                0x09;    // Serbian (Serbia - Latin)
export const SUBLANG_SERBIAN_SERBIA_CYRILLIC =             0x0a;    // Serbian (Serbia - Cyrillic)
export const SUBLANG_SERBIAN_CROATIA =                     0x01;    // Croatian (Croatia) 0x041a hr-HR
export const SUBLANG_SERBIAN_LATIN =                       0x02;    // Serbian (Latin)
export const SUBLANG_SERBIAN_CYRILLIC =                    0x03;    // Serbian (Cyrillic)
export const SUBLANG_SINDHI_INDIA =                        0x01;    // Sindhi (India) reserved 0x0459
export const SUBLANG_SINDHI_PAKISTAN =                     0x02;    // Sindhi (Pakistan) 0x0859 sd-Arab-PK
export const SUBLANG_SINDHI_AFGHANISTAN =                  0x02;    // For app compatibility only
export const SUBLANG_SINHALESE_SRI_LANKA =                 0x01;    // Sinhalese (Sri Lanka)
export const SUBLANG_SOTHO_NORTHERN_SOUTH_AFRICA =         0x01;    // Northern Sotho (South Africa)
export const SUBLANG_SLOVAK_SLOVAKIA =                     0x01;    // Slovak (Slovakia) 0x041b sk-SK
export const SUBLANG_SLOVENIAN_SLOVENIA =                  0x01;    // Slovenian (Slovenia) 0x0424 sl-SI
export const SUBLANG_SPANISH =                             0x01;    // Spanish (Castilian)
export const SUBLANG_SPANISH_MEXICAN =                     0x02;    // Spanish (Mexico)
export const SUBLANG_SPANISH_MODERN =                      0x03;    // Spanish (Modern)
export const SUBLANG_SPANISH_GUATEMALA =                   0x04;    // Spanish (Guatemala)
export const SUBLANG_SPANISH_COSTA_RICA =                  0x05;    // Spanish (Costa Rica)
export const SUBLANG_SPANISH_PANAMA =                      0x06;    // Spanish (Panama)
export const SUBLANG_SPANISH_DOMINICAN_REPUBLIC =          0x07;    // Spanish (Dominican Republic)
export const SUBLANG_SPANISH_VENEZUELA =                   0x08;    // Spanish (Venezuela)
export const SUBLANG_SPANISH_COLOMBIA =                    0x09;    // Spanish (Colombia)
export const SUBLANG_SPANISH_PERU =                        0x0a;    // Spanish (Peru)
export const SUBLANG_SPANISH_ARGENTINA =                   0x0b;    // Spanish (Argentina)
export const SUBLANG_SPANISH_ECUADOR =                     0x0c;    // Spanish (Ecuador)
export const SUBLANG_SPANISH_CHILE =                       0x0d;    // Spanish (Chile)
export const SUBLANG_SPANISH_URUGUAY =                     0x0e;    // Spanish (Uruguay)
export const SUBLANG_SPANISH_PARAGUAY =                    0x0f;    // Spanish (Paraguay)
export const SUBLANG_SPANISH_BOLIVIA =                     0x10;    // Spanish (Bolivia)
export const SUBLANG_SPANISH_EL_SALVADOR =                 0x11;    // Spanish (El Salvador)
export const SUBLANG_SPANISH_HONDURAS =                    0x12;    // Spanish (Honduras)
export const SUBLANG_SPANISH_NICARAGUA =                   0x13;    // Spanish (Nicaragua)
export const SUBLANG_SPANISH_PUERTO_RICO =                 0x14;    // Spanish (Puerto Rico)
export const SUBLANG_SPANISH_US =                          0x15;    // Spanish (United States)
export const SUBLANG_SWAHILI_KENYA =                       0x01;    // Swahili (Kenya) 0x0441 sw-KE
export const SUBLANG_SWEDISH =                             0x01;    // Swedish
export const SUBLANG_SWEDISH_FINLAND =                     0x02;    // Swedish (Finland)
export const SUBLANG_SYRIAC_SYRIA =                        0x01;    // Syriac (Syria) 0x045a syr-SY
export const SUBLANG_TAJIK_TAJIKISTAN =                    0x01;    // Tajik (Tajikistan) 0x0428 tg-TJ-Cyrl
export const SUBLANG_TAMAZIGHT_ALGERIA_LATIN =             0x02;    // Tamazight (Latin, Algeria) 0x085f tzm-Latn-DZ
export const SUBLANG_TAMAZIGHT_MOROCCO_TIFINAGH =          0x04;    // Tamazight (Tifinagh) 0x105f tzm-Tfng-MA
export const SUBLANG_TAMIL_INDIA =                         0x01;    // Tamil (India)
export const SUBLANG_TAMIL_SRI_LANKA =                     0x02;    // Tamil (Sri Lanka) 0x0849 ta-LK
export const SUBLANG_TATAR_RUSSIA =                        0x01;    // Tatar (Russia) 0x0444 tt-RU
export const SUBLANG_TELUGU_INDIA =                        0x01;    // Telugu (India (Telugu Script)) 0x044a te-IN
export const SUBLANG_THAI_THAILAND =                       0x01;    // Thai (Thailand) 0x041e th-TH
export const SUBLANG_TIBETAN_PRC =                         0x01;    // Tibetan (PRC)
export const SUBLANG_TIGRIGNA_ERITREA =                    0x02;    // Tigrigna (Eritrea)
export const SUBLANG_TIGRINYA_ERITREA =                    0x02;    // Tigrinya (Eritrea) 0x0873 ti-ER (preferred spelling)
export const SUBLANG_TIGRINYA_ETHIOPIA =                   0x01;    // Tigrinya (Ethiopia) 0x0473 ti-ET
export const SUBLANG_TSWANA_BOTSWANA =                     0x02;    // Setswana / Tswana (Botswana) 0x0832 tn-BW
export const SUBLANG_TSWANA_SOUTH_AFRICA =                 0x01;    // Setswana / Tswana (South Africa) 0x0432 tn-ZA
export const SUBLANG_TURKISH_TURKEY =                      0x01;    // Turkish (Turkey) 0x041f tr-TR
export const SUBLANG_TURKMEN_TURKMENISTAN =                0x01;    // Turkmen (Turkmenistan) 0x0442 tk-TM
export const SUBLANG_UIGHUR_PRC =                          0x01;    // Uighur (PRC) 0x0480 ug-CN
export const SUBLANG_UKRAINIAN_UKRAINE =                   0x01;    // Ukrainian (Ukraine) 0x0422 uk-UA
export const SUBLANG_UPPER_SORBIAN_GERMANY =               0x01;    // Upper Sorbian (Germany) 0x042e wen-DE
export const SUBLANG_URDU_PAKISTAN =                       0x01;    // Urdu (Pakistan)
export const SUBLANG_URDU_INDIA =                          0x02;    // Urdu (India)
export const SUBLANG_UZBEK_LATIN =                         0x01;    // Uzbek (Latin)
export const SUBLANG_UZBEK_CYRILLIC =                      0x02;    // Uzbek (Cyrillic)
export const SUBLANG_VALENCIAN_VALENCIA =                  0x02;    // Valencian (Valencia) 0x0803 ca-ES-Valencia
export const SUBLANG_VIETNAMESE_VIETNAM =                  0x01;    // Vietnamese (Vietnam) 0x042a vi-VN
export const SUBLANG_WELSH_UNITED_KINGDOM =                0x01;    // Welsh (United Kingdom) 0x0452 cy-GB
export const SUBLANG_WOLOF_SENEGAL =                       0x01;    // Wolof (Senegal)
export const SUBLANG_XHOSA_SOUTH_AFRICA =                  0x01;    // isiXhosa / Xhosa (South Africa) 0x0434 xh-ZA
export const SUBLANG_YAKUT_RUSSIA =                        0x01;    // Deprecated: use SUBLANG_SAKHA_RUSSIA instead
export const SUBLANG_YI_PRC =                              0x01;    // Yi (PRC)) 0x0478
export const SUBLANG_YORUBA_NIGERIA =                      0x01;    // Yoruba (Nigeria) 046a yo-NG
export const SUBLANG_ZULU_SOUTH_AFRICA =                   0x01;    // isiZulu / Zulu (South Africa) 0x0435 zu-ZA


export const ERROR_MOD_NOT_FOUND = 126;
