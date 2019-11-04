#include "pdb.h"

#include <KR3/wl/windows.h>

#define _NO_CVCONST_H
#include <DbgHelp.h>

#include <KR3/fs/file.h>

#pragma comment(lib, "dbghelp.lib")


using namespace kr;

inline Text16 tagToString(ULONG tag) noexcept
{
	switch (tag)
	{
	case SymTagNull: return u"Null";
	case SymTagExe: return u"Exe";
	case SymTagCompiland: return u"Compiland";
	case SymTagCompilandDetails: return u"CompilandDetails";
	case SymTagCompilandEnv: return u"CompilandEnv";
	case SymTagFunction: return u"Function";
	case SymTagBlock: return u"Block";
	case SymTagData: return u"Data";
	case SymTagAnnotation: return u"Annotation";
	case SymTagLabel: return u"Label";
	case SymTagPublicSymbol: return u"PublicSymbol";
	case SymTagUDT: return u"UDT";
	case SymTagEnum: return u"Enum";
	case SymTagFunctionType: return u"FunctionType";
	case SymTagPointerType: return u"PointerType";
	case SymTagArrayType: return u"ArrayType";
	case SymTagBaseType: return u"BaseType";
	case SymTagTypedef: return u"Typedef";
	case SymTagBaseClass: return u"BaseClass";
	case SymTagFriend: return u"Friend";
	case SymTagFunctionArgType: return u"FunctionArgType";
	case SymTagFuncDebugStart: return u"FuncDebugStart";
	case SymTagFuncDebugEnd: return u"FuncDebugEnd";
	case SymTagUsingNamespace: return u"UsingNamespace";
	case SymTagVTableShape: return u"VTableShape";
	case SymTagVTable: return u"VTable";
	case SymTagCustom: return u"Custom";
	case SymTagThunk: return u"Thunk";
	case SymTagCustomType: return u"CustomType";
	case SymTagManagedType: return u"ManagedType";
	case SymTagDimension: return u"Dimension";
	default: return u"Unknown";
	}
}
inline Text16 symToString(ULONG sym) noexcept
{
	switch (sym)
	{
	case SymNone: return u"None";
	case SymExport: return u"Exports";
	case SymCoff: return u"COFF";
	case SymCv: return u"CodeView";
	case SymSym: return u"SYM";
	case SymVirtual: return u"Virtual";
	case SymPdb: return u"PDB";
	case SymDia: return u"DIA";
	case SymDeferred: return u"Deferred";
	default: return u"Unknown";
	}
}

PdbReader::PdbReader() noexcept
{
	::SymInitialize(
		GetCurrentProcess(),  // Process handle of the current process 
		NULL,                 // No user-defined search path -> use default 
		FALSE                 // Do not load symbols for modules in the current process 
	);

	TSZ16 moduleName;
	moduleName << ModuleName<char16>() << nullterm;

	Must<File> file = File::open(moduleName.data());
	dword filesize = file->size32();

	m_process = GetCurrentProcess();
	HANDLE handle = GetModuleHandleW(nullptr);

	m_base = ::SymLoadModuleExW(
		m_process,
		file,
		wide(moduleName.data()),
		nullptr,
		(uintptr_t)handle,
		filesize,
		nullptr,
		0
	);

	// Unload symbols for the module 
}
PdbReader::~PdbReader() noexcept
{
	::SymUnloadModule64(m_process, m_base);
}

void* PdbReader::base() noexcept
{
	return (void*)m_base;
}
void PdbReader::showInfo() noexcept
{
	IMAGEHLP_MODULEW64 ModuleInfo;
	memset(&ModuleInfo, 0, sizeof(ModuleInfo));
	ModuleInfo.SizeOfStruct = sizeof(ModuleInfo);

	if (!SymGetModuleInfoW64(GetCurrentProcess(), m_base, &ModuleInfo))
	{
		cout << "Error: SymGetModuleInfo64() failed. Error code: " << GetLastError() << endl;
		return;
	}

	// Display information about symbols 
	ucout << u"Loaded symbols:" << symToString(ModuleInfo.SymType) << endl;

	Text16 imageName = (Text16)unwide(ModuleInfo.ImageName);
	Text16 loadedImageName = (Text16)unwide(ModuleInfo.LoadedImageName);
	Text16 loadedPdbName = (Text16)unwide(ModuleInfo.LoadedPdbName);

	// Image name 
	if (!imageName.empty()) ucout << u"Image name: " << imageName << endl;

	// Loaded image name 
	if (!loadedImageName.empty()) ucout << u"Loaded image name: " << loadedImageName << endl;

	// Loaded PDB name 
	if (!loadedPdbName.empty()) ucout << u"Loaded image name: " << loadedPdbName << endl;

	// Is debug information unmatched ? 
	// (It can only happen if the debug information is contained 
	// in a separate file (.DBG or .PDB) 

	if (ModuleInfo.PdbUnmatched || ModuleInfo.DbgUnmatched)
	{
		wprintf(L"Warning: Unmatched symbols. \n");
	}

	// Contents 
	//ucout << u"Line numbers: " << (ModuleInfo.LineNumbers ? u"Available" : u"Not available") << endl;
	//ucout << u"Global symbols: " << (ModuleInfo.GlobalSymbols ? u"Available" : u"Not available") << endl;
	//ucout << u"Type information: " << (ModuleInfo.TypeInfo ? u"Available" : u"Not available") << endl;
	//ucout << u"Source indexing: " << (ModuleInfo.SourceIndexed ? u"Yes" : u"No") << endl;
	//ucout << u"Public symbols: " << (ModuleInfo.Publics ? u"Available" : u"Not available") << endl;
}
void PdbReader::search(const char* filter, Callback callback) noexcept
{
	SymEnumSymbols(
		m_process,
		m_base,
		filter,
		[](SYMBOL_INFO* symInfo, ULONG SymbolSize, void* callback)->BOOL {
			if (symInfo->Tag != SymTagFunction && symInfo->Tag != SymTagPublicSymbol)
			{
				return true;
			}
			return (*(Callback*)callback)(Text(symInfo->Name, symInfo->NameLen), (kr::autoptr)symInfo->Address);
		},
		(PVOID)&callback);
}
kr::autoptr PdbReader::getFunctionAddress(const char* name) noexcept
{
	byte buffer[sizeof(IMAGEHLP_SYMBOL64) + MAX_SYM_NAME];
	IMAGEHLP_SYMBOL64& sym = *(IMAGEHLP_SYMBOL64*)buffer;
	sym.SizeOfStruct = sizeof(sym);
	sym.MaxNameLength = MAX_SYM_NAME;
	if (!SymGetSymFromName64(m_process, name, &sym))
	{
		return nullptr;
	}
	return (autoptr)sym.Address;
}

