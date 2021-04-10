
export enum SymTagEnum
{
    SymTagNull,
    SymTagExe,
    SymTagCompiland,
    SymTagCompilandDetails,
    SymTagCompilandEnv,
    SymTagFunction,
    SymTagBlock,
    SymTagData,
    SymTagAnnotation,
    SymTagLabel,
    SymTagPublicSymbol,
    SymTagUDT,
    SymTagEnum,
    SymTagFunctionType,
    SymTagPointerType,
    SymTagArrayType,
    SymTagBaseType,
    SymTagTypedef,
    SymTagBaseClass,
    SymTagFriend,
    SymTagFunctionArgType,
    SymTagFuncDebugStart,
    SymTagFuncDebugEnd,
    SymTagUsingNamespace,
    SymTagVTableShape,
    SymTagVTable,
    SymTagCustom,
    SymTagThunk,
    SymTagCustomType,
    SymTagManagedType,
    SymTagDimension,
    SymTagCallSite,
    SymTagInlineSite,
    SymTagBaseInterface,
    SymTagVectorType,
    SymTagMatrixType,
    SymTagHLSLType,
    SymTagCaller,
    SymTagCallee,
    SymTagExport,
    SymTagHeapAllocationSite,
    SymTagCoffGroup,
    SymTagMax
}

export const SYMFLAG_VALUEPRESENT        = 0x00000001;
export const SYMFLAG_REGISTER            = 0x00000008;
export const SYMFLAG_REGREL              = 0x00000010;
export const SYMFLAG_FRAMEREL            = 0x00000020;
export const SYMFLAG_PARAMETER           = 0x00000040;
export const SYMFLAG_LOCAL               = 0x00000080;
export const SYMFLAG_CONSTANT            = 0x00000100;
export const SYMFLAG_EXPORT              = 0x00000200;
export const SYMFLAG_FORWARDER           = 0x00000400;
export const SYMFLAG_FUNCTION            = 0x00000800;
export const SYMFLAG_VIRTUAL             = 0x00001000;
export const SYMFLAG_THUNK               = 0x00002000;
export const SYMFLAG_TLSREL              = 0x00004000;
export const SYMFLAG_SLOT                = 0x00008000;
export const SYMFLAG_ILREL               = 0x00010000;
export const SYMFLAG_METADATA            = 0x00020000;
export const SYMFLAG_CLR_TOKEN           = 0x00040000;
export const SYMFLAG_NULL                = 0x00080000;
export const SYMFLAG_FUNC_NO_RETURN      = 0x00100000;
export const SYMFLAG_SYNTHETIC_ZEROBASE  = 0x00200000;
export const SYMFLAG_PUBLIC_CODE         = 0x00400000;

export const SYMOPT_CASE_INSENSITIVE          = 0x00000001;
export const SYMOPT_UNDNAME                   = 0x00000002;
export const SYMOPT_DEFERRED_LOADS            = 0x00000004;
export const SYMOPT_NO_CPP                    = 0x00000008;
export const SYMOPT_LOAD_LINES                = 0x00000010;
export const SYMOPT_OMAP_FIND_NEAREST         = 0x00000020;
export const SYMOPT_LOAD_ANYTHING             = 0x00000040;
export const SYMOPT_IGNORE_CVREC              = 0x00000080;
export const SYMOPT_NO_UNQUALIFIED_LOADS      = 0x00000100;
export const SYMOPT_FAIL_CRITICAL_ERRORS      = 0x00000200;
export const SYMOPT_EXACT_SYMBOLS             = 0x00000400;
export const SYMOPT_ALLOW_ABSOLUTE_SYMBOLS    = 0x00000800;
export const SYMOPT_IGNORE_NT_SYMPATH         = 0x00001000;
export const SYMOPT_INCLUDE_32BIT_MODULES     = 0x00002000;
export const SYMOPT_PUBLICS_ONLY              = 0x00004000;
export const SYMOPT_NO_PUBLICS                = 0x00008000;
export const SYMOPT_AUTO_PUBLICS              = 0x00010000;
export const SYMOPT_NO_IMAGE_SEARCH           = 0x00020000;
export const SYMOPT_SECURE                    = 0x00040000;
export const SYMOPT_NO_PROMPTS                = 0x00080000;
export const SYMOPT_OVERWRITE                 = 0x00100000;
export const SYMOPT_IGNORE_IMAGEDIR           = 0x00200000;
export const SYMOPT_FLAT_DIRECTORY            = 0x00400000;
export const SYMOPT_FAVOR_COMPRESSED          = 0x00800000;
export const SYMOPT_ALLOW_ZERO_ADDRESS        = 0x01000000;
export const SYMOPT_DISABLE_SYMSRV_AUTODETECT = 0x02000000;
export const SYMOPT_READONLY_CACHE            = 0x04000000;
export const SYMOPT_SYMPATH_LAST              = 0x08000000;
export const SYMOPT_DISABLE_FAST_SYMBOLS      = 0x10000000;
export const SYMOPT_DISABLE_SYMSRV_TIMEOUT    = 0x20000000;
export const SYMOPT_DISABLE_SRVSTAR_ON_STARTUP = 0x40000000;
export const SYMOPT_DEBUG                     = 0x80000000;

export const UNDNAME_COMPLETE                 = 0x0000;  // Enable full undecoration
export const UNDNAME_NO_LEADING_UNDERSCORES   = 0x0001;  // Remove leading underscores from MS extended keywords
export const UNDNAME_NO_MS_KEYWORDS           = 0x0002;  // Disable expansion of MS extended keywords
export const UNDNAME_NO_FUNCTION_RETURNS      = 0x0004;  // Disable expansion of return type for primary declaration
export const UNDNAME_NO_ALLOCATION_MODEL      = 0x0008;  // Disable expansion of the declaration model
export const UNDNAME_NO_ALLOCATION_LANGUAGE   = 0x0010;  // Disable expansion of the declaration language specifier
export const UNDNAME_NO_MS_THISTYPE           = 0x0020;  // NYI Disable expansion of MS keywords on the 'this' type for primary declaration
export const UNDNAME_NO_CV_THISTYPE           = 0x0040;  // NYI Disable expansion of CV modifiers on the 'this' type for primary declaration
export const UNDNAME_NO_THISTYPE              = 0x0060;  // Disable all modifiers on the 'this' type
export const UNDNAME_NO_ACCESS_SPECIFIERS     = 0x0080;  // Disable expansion of access specifiers for members
export const UNDNAME_NO_THROW_SIGNATURES      = 0x0100;  // Disable expansion of 'throw-signatures' for functions and pointers to functions
export const UNDNAME_NO_MEMBER_TYPE           = 0x0200;  // Disable expansion of 'static' or 'virtual'ness of members
export const UNDNAME_NO_RETURN_UDT_MODEL      = 0x0400;  // Disable expansion of MS model for UDT returns
export const UNDNAME_32_BIT_DECODE            = 0x0800;  // Undecorate 32-bit decorated names
export const UNDNAME_NAME_ONLY                = 0x1000;  // Crack only the name for primary declaration;
                                                                                                   //  return just [scope::]name.  Does expand template params
export const UNDNAME_NO_ARGUMENTS             = 0x2000;  // Don't undecorate arguments to function
export const UNDNAME_NO_SPECIAL_SYMS          = 0x4000;  // Don't undecorate special names (v-table, vcall, vector xxx, metatype, etc)
