"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYMOPT_SYMPATH_LAST = exports.SYMOPT_READONLY_CACHE = exports.SYMOPT_DISABLE_SYMSRV_AUTODETECT = exports.SYMOPT_ALLOW_ZERO_ADDRESS = exports.SYMOPT_FAVOR_COMPRESSED = exports.SYMOPT_FLAT_DIRECTORY = exports.SYMOPT_IGNORE_IMAGEDIR = exports.SYMOPT_OVERWRITE = exports.SYMOPT_NO_PROMPTS = exports.SYMOPT_SECURE = exports.SYMOPT_NO_IMAGE_SEARCH = exports.SYMOPT_AUTO_PUBLICS = exports.SYMOPT_NO_PUBLICS = exports.SYMOPT_PUBLICS_ONLY = exports.SYMOPT_INCLUDE_32BIT_MODULES = exports.SYMOPT_IGNORE_NT_SYMPATH = exports.SYMOPT_ALLOW_ABSOLUTE_SYMBOLS = exports.SYMOPT_EXACT_SYMBOLS = exports.SYMOPT_FAIL_CRITICAL_ERRORS = exports.SYMOPT_NO_UNQUALIFIED_LOADS = exports.SYMOPT_IGNORE_CVREC = exports.SYMOPT_LOAD_ANYTHING = exports.SYMOPT_OMAP_FIND_NEAREST = exports.SYMOPT_LOAD_LINES = exports.SYMOPT_NO_CPP = exports.SYMOPT_DEFERRED_LOADS = exports.SYMOPT_UNDNAME = exports.SYMOPT_CASE_INSENSITIVE = exports.SYMFLAG_PUBLIC_CODE = exports.SYMFLAG_SYNTHETIC_ZEROBASE = exports.SYMFLAG_FUNC_NO_RETURN = exports.SYMFLAG_NULL = exports.SYMFLAG_CLR_TOKEN = exports.SYMFLAG_METADATA = exports.SYMFLAG_ILREL = exports.SYMFLAG_SLOT = exports.SYMFLAG_TLSREL = exports.SYMFLAG_THUNK = exports.SYMFLAG_VIRTUAL = exports.SYMFLAG_FUNCTION = exports.SYMFLAG_FORWARDER = exports.SYMFLAG_EXPORT = exports.SYMFLAG_CONSTANT = exports.SYMFLAG_LOCAL = exports.SYMFLAG_PARAMETER = exports.SYMFLAG_FRAMEREL = exports.SYMFLAG_REGREL = exports.SYMFLAG_REGISTER = exports.SYMFLAG_VALUEPRESENT = exports.SymTagEnum = void 0;
exports.UNDNAME_NO_SPECIAL_SYMS = exports.UNDNAME_NO_ARGUMENTS = exports.UNDNAME_NAME_ONLY = exports.UNDNAME_32_BIT_DECODE = exports.UNDNAME_NO_RETURN_UDT_MODEL = exports.UNDNAME_NO_MEMBER_TYPE = exports.UNDNAME_NO_THROW_SIGNATURES = exports.UNDNAME_NO_ACCESS_SPECIFIERS = exports.UNDNAME_NO_THISTYPE = exports.UNDNAME_NO_CV_THISTYPE = exports.UNDNAME_NO_MS_THISTYPE = exports.UNDNAME_NO_ALLOCATION_LANGUAGE = exports.UNDNAME_NO_ALLOCATION_MODEL = exports.UNDNAME_NO_FUNCTION_RETURNS = exports.UNDNAME_NO_MS_KEYWORDS = exports.UNDNAME_NO_LEADING_UNDERSCORES = exports.UNDNAME_COMPLETE = exports.SYMOPT_DEBUG = exports.SYMOPT_DISABLE_SRVSTAR_ON_STARTUP = exports.SYMOPT_DISABLE_SYMSRV_TIMEOUT = exports.SYMOPT_DISABLE_FAST_SYMBOLS = void 0;
var SymTagEnum;
(function (SymTagEnum) {
    SymTagEnum[SymTagEnum["SymTagNull"] = 0] = "SymTagNull";
    SymTagEnum[SymTagEnum["SymTagExe"] = 1] = "SymTagExe";
    SymTagEnum[SymTagEnum["SymTagCompiland"] = 2] = "SymTagCompiland";
    SymTagEnum[SymTagEnum["SymTagCompilandDetails"] = 3] = "SymTagCompilandDetails";
    SymTagEnum[SymTagEnum["SymTagCompilandEnv"] = 4] = "SymTagCompilandEnv";
    SymTagEnum[SymTagEnum["SymTagFunction"] = 5] = "SymTagFunction";
    SymTagEnum[SymTagEnum["SymTagBlock"] = 6] = "SymTagBlock";
    SymTagEnum[SymTagEnum["SymTagData"] = 7] = "SymTagData";
    SymTagEnum[SymTagEnum["SymTagAnnotation"] = 8] = "SymTagAnnotation";
    SymTagEnum[SymTagEnum["SymTagLabel"] = 9] = "SymTagLabel";
    SymTagEnum[SymTagEnum["SymTagPublicSymbol"] = 10] = "SymTagPublicSymbol";
    SymTagEnum[SymTagEnum["SymTagUDT"] = 11] = "SymTagUDT";
    SymTagEnum[SymTagEnum["SymTagEnum"] = 12] = "SymTagEnum";
    SymTagEnum[SymTagEnum["SymTagFunctionType"] = 13] = "SymTagFunctionType";
    SymTagEnum[SymTagEnum["SymTagPointerType"] = 14] = "SymTagPointerType";
    SymTagEnum[SymTagEnum["SymTagArrayType"] = 15] = "SymTagArrayType";
    SymTagEnum[SymTagEnum["SymTagBaseType"] = 16] = "SymTagBaseType";
    SymTagEnum[SymTagEnum["SymTagTypedef"] = 17] = "SymTagTypedef";
    SymTagEnum[SymTagEnum["SymTagBaseClass"] = 18] = "SymTagBaseClass";
    SymTagEnum[SymTagEnum["SymTagFriend"] = 19] = "SymTagFriend";
    SymTagEnum[SymTagEnum["SymTagFunctionArgType"] = 20] = "SymTagFunctionArgType";
    SymTagEnum[SymTagEnum["SymTagFuncDebugStart"] = 21] = "SymTagFuncDebugStart";
    SymTagEnum[SymTagEnum["SymTagFuncDebugEnd"] = 22] = "SymTagFuncDebugEnd";
    SymTagEnum[SymTagEnum["SymTagUsingNamespace"] = 23] = "SymTagUsingNamespace";
    SymTagEnum[SymTagEnum["SymTagVTableShape"] = 24] = "SymTagVTableShape";
    SymTagEnum[SymTagEnum["SymTagVTable"] = 25] = "SymTagVTable";
    SymTagEnum[SymTagEnum["SymTagCustom"] = 26] = "SymTagCustom";
    SymTagEnum[SymTagEnum["SymTagThunk"] = 27] = "SymTagThunk";
    SymTagEnum[SymTagEnum["SymTagCustomType"] = 28] = "SymTagCustomType";
    SymTagEnum[SymTagEnum["SymTagManagedType"] = 29] = "SymTagManagedType";
    SymTagEnum[SymTagEnum["SymTagDimension"] = 30] = "SymTagDimension";
    SymTagEnum[SymTagEnum["SymTagCallSite"] = 31] = "SymTagCallSite";
    SymTagEnum[SymTagEnum["SymTagInlineSite"] = 32] = "SymTagInlineSite";
    SymTagEnum[SymTagEnum["SymTagBaseInterface"] = 33] = "SymTagBaseInterface";
    SymTagEnum[SymTagEnum["SymTagVectorType"] = 34] = "SymTagVectorType";
    SymTagEnum[SymTagEnum["SymTagMatrixType"] = 35] = "SymTagMatrixType";
    SymTagEnum[SymTagEnum["SymTagHLSLType"] = 36] = "SymTagHLSLType";
    SymTagEnum[SymTagEnum["SymTagCaller"] = 37] = "SymTagCaller";
    SymTagEnum[SymTagEnum["SymTagCallee"] = 38] = "SymTagCallee";
    SymTagEnum[SymTagEnum["SymTagExport"] = 39] = "SymTagExport";
    SymTagEnum[SymTagEnum["SymTagHeapAllocationSite"] = 40] = "SymTagHeapAllocationSite";
    SymTagEnum[SymTagEnum["SymTagCoffGroup"] = 41] = "SymTagCoffGroup";
    SymTagEnum[SymTagEnum["SymTagMax"] = 42] = "SymTagMax";
})(SymTagEnum = exports.SymTagEnum || (exports.SymTagEnum = {}));
exports.SYMFLAG_VALUEPRESENT = 0x00000001;
exports.SYMFLAG_REGISTER = 0x00000008;
exports.SYMFLAG_REGREL = 0x00000010;
exports.SYMFLAG_FRAMEREL = 0x00000020;
exports.SYMFLAG_PARAMETER = 0x00000040;
exports.SYMFLAG_LOCAL = 0x00000080;
exports.SYMFLAG_CONSTANT = 0x00000100;
exports.SYMFLAG_EXPORT = 0x00000200;
exports.SYMFLAG_FORWARDER = 0x00000400;
exports.SYMFLAG_FUNCTION = 0x00000800;
exports.SYMFLAG_VIRTUAL = 0x00001000;
exports.SYMFLAG_THUNK = 0x00002000;
exports.SYMFLAG_TLSREL = 0x00004000;
exports.SYMFLAG_SLOT = 0x00008000;
exports.SYMFLAG_ILREL = 0x00010000;
exports.SYMFLAG_METADATA = 0x00020000;
exports.SYMFLAG_CLR_TOKEN = 0x00040000;
exports.SYMFLAG_NULL = 0x00080000;
exports.SYMFLAG_FUNC_NO_RETURN = 0x00100000;
exports.SYMFLAG_SYNTHETIC_ZEROBASE = 0x00200000;
exports.SYMFLAG_PUBLIC_CODE = 0x00400000;
exports.SYMOPT_CASE_INSENSITIVE = 0x00000001;
exports.SYMOPT_UNDNAME = 0x00000002;
exports.SYMOPT_DEFERRED_LOADS = 0x00000004;
exports.SYMOPT_NO_CPP = 0x00000008;
exports.SYMOPT_LOAD_LINES = 0x00000010;
exports.SYMOPT_OMAP_FIND_NEAREST = 0x00000020;
exports.SYMOPT_LOAD_ANYTHING = 0x00000040;
exports.SYMOPT_IGNORE_CVREC = 0x00000080;
exports.SYMOPT_NO_UNQUALIFIED_LOADS = 0x00000100;
exports.SYMOPT_FAIL_CRITICAL_ERRORS = 0x00000200;
exports.SYMOPT_EXACT_SYMBOLS = 0x00000400;
exports.SYMOPT_ALLOW_ABSOLUTE_SYMBOLS = 0x00000800;
exports.SYMOPT_IGNORE_NT_SYMPATH = 0x00001000;
exports.SYMOPT_INCLUDE_32BIT_MODULES = 0x00002000;
exports.SYMOPT_PUBLICS_ONLY = 0x00004000;
exports.SYMOPT_NO_PUBLICS = 0x00008000;
exports.SYMOPT_AUTO_PUBLICS = 0x00010000;
exports.SYMOPT_NO_IMAGE_SEARCH = 0x00020000;
exports.SYMOPT_SECURE = 0x00040000;
exports.SYMOPT_NO_PROMPTS = 0x00080000;
exports.SYMOPT_OVERWRITE = 0x00100000;
exports.SYMOPT_IGNORE_IMAGEDIR = 0x00200000;
exports.SYMOPT_FLAT_DIRECTORY = 0x00400000;
exports.SYMOPT_FAVOR_COMPRESSED = 0x00800000;
exports.SYMOPT_ALLOW_ZERO_ADDRESS = 0x01000000;
exports.SYMOPT_DISABLE_SYMSRV_AUTODETECT = 0x02000000;
exports.SYMOPT_READONLY_CACHE = 0x04000000;
exports.SYMOPT_SYMPATH_LAST = 0x08000000;
exports.SYMOPT_DISABLE_FAST_SYMBOLS = 0x10000000;
exports.SYMOPT_DISABLE_SYMSRV_TIMEOUT = 0x20000000;
exports.SYMOPT_DISABLE_SRVSTAR_ON_STARTUP = 0x40000000;
exports.SYMOPT_DEBUG = 0x80000000;
exports.UNDNAME_COMPLETE = 0x0000; // Enable full undecoration
exports.UNDNAME_NO_LEADING_UNDERSCORES = 0x0001; // Remove leading underscores from MS extended keywords
exports.UNDNAME_NO_MS_KEYWORDS = 0x0002; // Disable expansion of MS extended keywords
exports.UNDNAME_NO_FUNCTION_RETURNS = 0x0004; // Disable expansion of return type for primary declaration
exports.UNDNAME_NO_ALLOCATION_MODEL = 0x0008; // Disable expansion of the declaration model
exports.UNDNAME_NO_ALLOCATION_LANGUAGE = 0x0010; // Disable expansion of the declaration language specifier
exports.UNDNAME_NO_MS_THISTYPE = 0x0020; // NYI Disable expansion of MS keywords on the 'this' type for primary declaration
exports.UNDNAME_NO_CV_THISTYPE = 0x0040; // NYI Disable expansion of CV modifiers on the 'this' type for primary declaration
exports.UNDNAME_NO_THISTYPE = 0x0060; // Disable all modifiers on the 'this' type
exports.UNDNAME_NO_ACCESS_SPECIFIERS = 0x0080; // Disable expansion of access specifiers for members
exports.UNDNAME_NO_THROW_SIGNATURES = 0x0100; // Disable expansion of 'throw-signatures' for functions and pointers to functions
exports.UNDNAME_NO_MEMBER_TYPE = 0x0200; // Disable expansion of 'static' or 'virtual'ness of members
exports.UNDNAME_NO_RETURN_UDT_MODEL = 0x0400; // Disable expansion of MS model for UDT returns
exports.UNDNAME_32_BIT_DECODE = 0x0800; // Undecorate 32-bit decorated names
exports.UNDNAME_NAME_ONLY = 0x1000; // Crack only the name for primary declaration;
//  return just [scope::]name.  Does expand template params
exports.UNDNAME_NO_ARGUMENTS = 0x2000; // Don't undecorate arguments to function
exports.UNDNAME_NO_SPECIAL_SYMS = 0x4000; // Don't undecorate special names (v-table, vcall, vector xxx, metatype, etc)
//# sourceMappingURL=dbghelp.js.map