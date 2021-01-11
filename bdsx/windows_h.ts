import { bin } from "./bin";
import { bin64_t, int32_t, uint16_t, uint32_t, uint8_t } from "./nativetype";
import { NativeArray, NativeClass } from "./nativeclass";
import { VoidPointer } from "./core";

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
export function IMAGE_ORDINAL64(Ordinal:string) { return (bin.bitand(Ordinal, b64_LOW_WORD)); }
export function IMAGE_SNAP_BY_ORDINAL64(Ordinal:string) { return (bin.bitand(Ordinal, IMAGE_ORDINAL_FLAG64) !== bin64_t.zero); }

export class IMAGE_DATA_DIRECTORY extends NativeClass
{
    VirtualAddress:DWORD;
    Size:DWORD;
};
IMAGE_DATA_DIRECTORY.define({
    VirtualAddress: DWORD,
    Size: DWORD,
});
export class IMAGE_DOS_HEADER extends NativeClass
{
    e_magic: WORD;                     // Magic number
    e_cblp: WORD;                      // Bytes on last page of file
    e_cp: WORD;                        // Pages in file
    e_crlc: WORD;                      // Relocations

    e_cparhdr: WORD;                   // Size of header in paragraphs
    e_minalloc: WORD;                  // Minimum extra paragraphs needed
    e_maxalloc: WORD;                  // Maximum extra paragraphs needed
    e_ss: WORD;                        // Initial (relative) SS value

    e_sp: WORD;                        // Initial SP value
    e_csum: WORD;                      // Checksum
    e_ip: WORD;                        // Initial IP value
    e_cs: WORD;                        // Initial (relative) CS value

    e_lfarlc: WORD;                    // File address of relocation table
    e_ovno: WORD;                      // Overlay number
    e_res: NativeArray<WORD>;       // Reserved words

    e_oemid: WORD;                     // OEM identifier (for e_oeminfo)
    e_oeminfo: WORD;                   // OEM information; e_oemid specific
    e_res2: NativeArray<WORD>;     // Reserved words
    e_lfanew: LONG;                    // File address of new exe header
}
IMAGE_DOS_HEADER.define({// DOS .EXE header
    e_magic: WORD,                     // Magic number
    e_cblp: WORD,                      // Bytes on last page of file
    e_cp: WORD,                        // Pages in file
    e_crlc: WORD,                      // Relocations

    e_cparhdr: WORD,                   // Size of header in paragraphs
    e_minalloc: WORD,                  // Minimum extra paragraphs needed
    e_maxalloc: WORD,                  // Maximum extra paragraphs needed
    e_ss: WORD,                        // Initial (relative) SS value

    e_sp: WORD,                        // Initial SP value
    e_csum: WORD,                      // Checksum
    e_ip: WORD,                        // Initial IP value
    e_cs: WORD,                        // Initial (relative) CS value

    e_lfarlc: WORD,                    // File address of relocation table
    e_ovno: WORD,                      // Overlay number
    e_res: NativeArray.make(WORD, 4),       // Reserved words

    e_oemid: WORD,                     // OEM identifier (for e_oeminfo)
    e_oeminfo: WORD,                   // OEM information; e_oemid specific
    e_res2: NativeArray.make(WORD, 10),     // Reserved words
    e_lfanew: LONG,                    // File address of new exe header
});
export class IMAGE_FILE_HEADER extends NativeClass
{
    Machine: WORD;
    NumberOfSections: WORD;
    TimeDateStamp: DWORD;
    PointerToSymbolTable: DWORD;
    NumberOfSymbols: DWORD;
    SizeOfOptionalHeader: WORD;
    Characteristics: WORD;
}
IMAGE_FILE_HEADER.define({
    Machine: WORD,
    NumberOfSections: WORD,
    TimeDateStamp: DWORD,
    PointerToSymbolTable: DWORD,
    NumberOfSymbols: DWORD,
    SizeOfOptionalHeader: WORD,
    Characteristics: WORD,
});
export class IMAGE_OPTIONAL_HEADER64 extends NativeClass
{
    Magic: WORD;
    MajorLinkerVersion: BYTE;
    MinorLinkerVersion: BYTE;
    SizeOfCode: DWORD;
    SizeOfInitializedData: DWORD;
    SizeOfUninitializedData: DWORD;
    AddressOfEntryPoint: DWORD;
    BaseOfCode: DWORD;
    ImageBase: ULONGLONG;
    SectionAlignment: DWORD;
    FileAlignment: DWORD;
    MajorOperatingSystemVersion: WORD;
    MinorOperatingSystemVersion: WORD;
    MajorImageVersion: WORD;
    MinorImageVersion: WORD;
    MajorSubsystemVersion: WORD;
    MinorSubsystemVersion: WORD;
    Win32VersionValue: DWORD;
    SizeOfImage: DWORD;
    SizeOfHeaders: DWORD;
    CheckSum: DWORD;
    Subsystem: WORD;
    DllCharacteristics: WORD;
    SizeOfStackReserve: ULONGLONG;
    SizeOfStackCommit: ULONGLONG;
    SizeOfHeapReserve: ULONGLONG;
    SizeOfHeapCommit: ULONGLONG;
    LoaderFlags: DWORD;
    NumberOfRvaAndSizes: DWORD;
    DataDirectory: NativeArray<IMAGE_DATA_DIRECTORY>;
}
IMAGE_OPTIONAL_HEADER64.define({
    Magic: WORD,
    MajorLinkerVersion: BYTE,
    MinorLinkerVersion: BYTE,
    SizeOfCode: DWORD,
    SizeOfInitializedData: DWORD,
    SizeOfUninitializedData: DWORD,
    AddressOfEntryPoint: DWORD,
    BaseOfCode: DWORD,
    ImageBase: ULONGLONG,
    SectionAlignment: DWORD,
    FileAlignment: DWORD,
    MajorOperatingSystemVersion: WORD,
    MinorOperatingSystemVersion: WORD,
    MajorImageVersion: WORD,
    MinorImageVersion: WORD,
    MajorSubsystemVersion: WORD,
    MinorSubsystemVersion: WORD,
    Win32VersionValue: DWORD,
    SizeOfImage: DWORD,
    SizeOfHeaders: DWORD,
    CheckSum: DWORD,
    Subsystem: WORD,
    DllCharacteristics: WORD,
    SizeOfStackReserve: ULONGLONG,
    SizeOfStackCommit: ULONGLONG,
    SizeOfHeapReserve: ULONGLONG,
    SizeOfHeapCommit: ULONGLONG,
    LoaderFlags: DWORD,
    NumberOfRvaAndSizes: DWORD,
    DataDirectory: NativeArray.make<IMAGE_DATA_DIRECTORY>(IMAGE_DATA_DIRECTORY, IMAGE_NUMBEROF_DIRECTORY_ENTRIES),
});
export class IMAGE_NT_HEADERS64 extends NativeClass
{
    Signature: DWORD;
    FileHeader: IMAGE_FILE_HEADER;
    OptionalHeader: IMAGE_OPTIONAL_HEADER64;
}
IMAGE_NT_HEADERS64.define({
    Signature: DWORD,
    FileHeader: IMAGE_FILE_HEADER,
    OptionalHeader: IMAGE_OPTIONAL_HEADER64,
});
export class IMAGE_DEBUG_DIRECTORY extends NativeClass
{
    Characteristics: DWORD;
    TimeDateStamp: DWORD;
    MajorVersion: WORD;
    MinorVersion: WORD;
    Type: DWORD;
    SizeOfData: DWORD;
    AddressOfRawData: DWORD;
    PointerToRawData: DWORD;
}
IMAGE_DEBUG_DIRECTORY.define({
    Characteristics: DWORD,
    TimeDateStamp: DWORD,
    MajorVersion: WORD,
    MinorVersion: WORD,
    Type: DWORD,
    SizeOfData: DWORD,
    AddressOfRawData: DWORD,
    PointerToRawData: DWORD,
});
export class IMAGE_IMPORT_DESCRIPTOR extends NativeClass
{
    Characteristics:DWORD;                  // 0 for terminating null import descriptor
    OriginalFirstThunk:DWORD;               // RVA to original unbound IAT (PIMAGE_THUNK_DATA)
    
    TimeDateStamp: DWORD;                   // 0 if not bound,
                                            // -1 if bound, and real date\time stamp
                                            //     in IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT (new BIND)
                                            // O.W. date/time stamp of DLL bound to (Old BIND)

    ForwarderChain: DWORD;                  // -1 if no forwarders
    Name: DWORD;
    FirstThunk: DWORD;                      // RVA to IAT (if bound this IAT has actual addresses)
}
IMAGE_IMPORT_DESCRIPTOR.define({
    Characteristics:[DWORD, 0],              // 0 for terminating null import descriptor
    OriginalFirstThunk:[DWORD, 0],           // RVA to original unbound IAT (PIMAGE_THUNK_DATA)
    
    TimeDateStamp: DWORD,                   // 0 if not bound,
                                            // -1 if bound, and real date\time stamp
                                            //     in IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT (new BIND)
                                            // O.W. date/time stamp of DLL bound to (Old BIND)

    ForwarderChain: DWORD,                  // -1 if no forwarders
    Name: DWORD,
    FirstThunk: DWORD,                      // RVA to IAT (if bound this IAT has actual addresses)
});

export class IMAGE_THUNK_DATA64 extends NativeClass
{
    u1:IMAGE_THUNK_DATA64_union;
}

class IMAGE_THUNK_DATA64_union extends NativeClass
{
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

IMAGE_THUNK_DATA64.define({
    u1:IMAGE_THUNK_DATA64_union
});


const EXCEPTION_MAXIMUM_PARAMETERS = 15; // maximum number of exception parameters

export class EXCEPTION_RECORD extends NativeClass
{    
    ExceptionCode:DWORD;
    ExceptionFlags:DWORD;
    ExceptionRecord:VoidPointer;
    ExceptionAddress:VoidPointer;
    NumberParameters:DWORD;
    dummy:DWORD;
    ExceptionInformation:NativeArray<ULONG_PTR>;
}
EXCEPTION_RECORD.define({
    ExceptionCode:DWORD,
    ExceptionFlags:DWORD,
    ExceptionRecord:VoidPointer,
    ExceptionAddress:VoidPointer,
    NumberParameters:DWORD,
    dummy:DWORD,
    ExceptionInformation:NativeArray.make(ULONG_PTR, EXCEPTION_MAXIMUM_PARAMETERS),
});

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

export class EXCEPTION_POINTERS extends NativeClass
{
    ExceptionRecord:EXCEPTION_RECORD;
    ContextRecord:VoidPointer; // CONTEXT
}
EXCEPTION_POINTERS.define({
    ExceptionRecord:EXCEPTION_RECORD.ref(),
    ContextRecord:VoidPointer, // CONTEXT
});

export const EXCEPTION_BREAKPOINT = 0x80000003|0;
            