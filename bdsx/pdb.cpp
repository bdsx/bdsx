#include "pdb.h"

#include <KR3/wl/windows.h>

#define _NO_CVCONST_H
#include <DbgHelp.h>

#include <KR3/fs/file.h>
#include <KR3/data/map.h>

#pragma comment(lib, "dbghelp.lib")


using namespace kr;

inline Text tagToString(ULONG tag) noexcept
{
	switch (tag)
	{
	case SymTagNull: return "Null";
	case SymTagExe: return "Exe";
	case SymTagCompiland: return "Compiland";
	case SymTagCompilandDetails: return "CompilandDetails";
	case SymTagCompilandEnv: return "CompilandEnv";
	case SymTagFunction: return "Function";
	case SymTagBlock: return "Block";
	case SymTagData: return "Data";
	case SymTagAnnotation: return "Annotation";
	case SymTagLabel: return "Label";
	case SymTagPublicSymbol: return "PublicSymbol";
	case SymTagUDT: return "UDT";
	case SymTagEnum: return "Enum";
	case SymTagFunctionType: return "FunctionType";
	case SymTagPointerType: return "PointerType";
	case SymTagArrayType: return "ArrayType";
	case SymTagBaseType: return "BaseType";
	case SymTagTypedef: return "Typedef";
	case SymTagBaseClass: return "BaseClass";
	case SymTagFriend: return "Friend";
	case SymTagFunctionArgType: return "FunctionArgType";
	case SymTagFuncDebugStart: return "FuncDebugStart";
	case SymTagFuncDebugEnd: return "FuncDebugEnd";
	case SymTagUsingNamespace: return "UsingNamespace";
	case SymTagVTableShape: return "VTableShape";
	case SymTagVTable: return "VTable";
	case SymTagCustom: return "Custom";
	case SymTagThunk: return "Thunk";
	case SymTagCustomType: return "CustomType";
	case SymTagManagedType: return "ManagedType";
	case SymTagDimension: return "Dimension";
	default: return "Unknown";
	}
}
inline Text symToString(ULONG sym) noexcept
{
	switch (sym)
	{
	case SymNone: return "None";
	case SymExport: return "Exports";
	case SymCoff: return "COFF";
	case SymCv: return "CodeView";
	case SymSym: return "SYM";
	case SymVirtual: return "Virtual";
	case SymPdb: return "PDB";
	case SymDia: return "DIA";
	case SymDeferred: return "Deferred";
	default: return "Unknown";
	}
}

PdbReader::PdbReader() noexcept
{
	cout << "PdbReader: Load Symbols..." << endl;
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
		cout << "PdbReader: Error: SymGetModuleInfo64() failed. Error code: " << GetLastError() << endl;
		return;
	}

	// Display information about symbols 
	cout << "PdbReader: Loaded symbols:" << symToString(ModuleInfo.SymType) << endl;

	Text16 imageName = (Text16)unwide(ModuleInfo.ImageName);
	Text16 loadedImageName = (Text16)unwide(ModuleInfo.LoadedImageName);
	Text16 loadedPdbName = (Text16)unwide(ModuleInfo.LoadedPdbName);

	// Image name 
	if (!imageName.empty()) cout << "PdbReader: Image name: " << toAnsi(imageName) << endl;

	// Loaded image name 
	if (!loadedImageName.empty()) cout << "PdbReader: Loaded image name: " << toAnsi(loadedImageName) << endl;

	// Loaded PDB name 
	if (!loadedPdbName.empty()) cout << "PdbReader: Loaded image name: " << toAnsi(loadedPdbName) << endl;

	// Is debug information unmatched ? 
	// (It can only happen if the debug information is contained 
	// in a separate file (.DBG or .PDB) 

	if (ModuleInfo.PdbUnmatched || ModuleInfo.DbgUnmatched)
	{
		cout << "PdbReader: Warning: Unmatched symbols." << endl;
	}

	// Contents 
	//cout << "PdbReader: Line numbers: " << (ModuleInfo.LineNumbers ? "Available" : "Not available") << endl;
	//cout << "PdbReader: Global symbols: " << (ModuleInfo.GlobalSymbols ? "Available" : "Not available") << endl;
	//cout << "PdbReader: Type information: " << (ModuleInfo.TypeInfo ? "Available" : "Not available") << endl;
	//cout << "PdbReader: Source indexing: " << (ModuleInfo.SourceIndexed ? "Yes" : "No") << endl;
	//cout << "PdbReader: Public symbols: " << (ModuleInfo.Publics ? "Available" : "Not available") << endl;
}
AText PdbReader::getTypeName(uint32_t typeId) noexcept
{
	//switch (typeId)
	//{
	//case 0: return "[no type]";
	//case 1: return "void";
	//case 2: return "char";
	//case 3: return "wchar_t";
	//case 6: return "int";
	//case 7: return "unsigned int";
	//case 8: return "float";
	//case 9: return "[bdc]";
	//case 10: return "bool";
	//case 13: return "long";
	//case 14: return "unsigned long";
	//case 25: return "[currency]";
	//case 26: return "[date]";
	//case 27: return "[variant]";
	//case 28: return "[complex]";
	//case 29: return "[bit]";
	//case 30: return "[BSTR]";
	//case 31: return "[HRESULT]";
	//};

	WCHAR* name = nullptr;
	if (!SymGetTypeInfo(m_process, m_base, typeId, TI_GET_SYMNAME, &name))
	{
		return AText() << "[invalid " << typeId << ']';
	}
	_assert(name != nullptr);
	AText out = (Utf16ToUtf8)(Text16)unwide(name);
	LocalFree(name);

	return out;
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
			"std::basic_string<char,std::char_traits<char>,std::allocator<char> >";
			return (*(Callback*)callback)(Text(symInfo->Name, symInfo->NameLen), (autoptr)symInfo->Address, symInfo->TypeIndex);
		},
		(PVOID)&callback);
}

class TemplateParser
{
private:
	static Map<Text, size_t> s_lambdas;

public:

	Text name;
	AText out;

	void writeLambda(Text lambda) noexcept
	{
		auto res = s_lambdas.insert(lambda, s_lambdas.size());
		out << "LAMBDA_" << res.first->second;
	}

	void parseTemplateParameters(Text ns, Text tname) throws(EofException)
	{
		if (ns == "std::")
		{
			if (tname == "basic_string")
			{
				size_t before_tname = out.size();
				out << tname;
				out << '<';
				size_t before_param = out.size();
				parse();
				Text param = out.subarr(before_param);
				if (param == "char")
				{
					out.cut_self(before_tname);
					out << "string";
				}
				else
				{
					out << param;
					out << '>';
				}
				leave();
				return;
			}
			else if (tname == "vector" || tname == "unique_ptr")
			{
				out << tname;
				out << '<';
				parse();
				out << '>';
				leave();
				return;
			}
			else if (tname == "_Umap_traits")
			{
				out << "UMapTraits";
				out << '<';
				parse();
				name.must(',');
				out << ',';
				parse();
				out << '>';
				leave();
				return;
			}
		}
		else if (ns == "JsonUtil::")
		{
			if (tname == "JsonSchemaNodeChildSchemaOptions")
			{
				out << "[SchemaOptions]";
				leave();
				return;
			}
			else if (tname == "JsonSchemaChildOptionBase")
			{
				out << "[OptionsBase]";
				leave();
				return;
			}
			else if (tname == "JsonParseState")
			{
				out << "[ParseState]";
				leave();
				return;
			}
		}

		out << tname;
		out << '<';
		for (;;)
		{
			parse();
			switch (name.peek())
			{
			case '>':
				out << name.read();
				if (name.empty()) return;
				if (name.peek() == ' ') name.read();
				return;
			case ',':
				out << name.read();
				break;
			case '\'':
				throw InvalidSourceException();
			}
		}
	}

	void leave() throws(EofException)
	{
		int level = 1;
		for (;;)
		{
			if (name.readto_y("<>") == nullptr) throw EofException();
			switch (name.read())
			{
			case '>': level--; break;
			case '<': level++; break;
			}
			if (level == 0)
			{
				if (name.empty()) break;
				break;
			}
		}
	}
	Text parse() throws(EofException)
	{
		while (name.readIf(' ')) {}

		size_t nameStart = out.size();
		for (;;)
		{
			if (name.readIf('`'))
			{
				size_t open_idx = out.size();
				out << '`';
				Text method = parse();
				name.must('\'');
				if (method == "dynamic initializer for " || method == "dynamic atexit destructor for ")
				{
					out[open_idx] = '[';
					Text nameend = name.readto('\'');
					if (nameend == nullptr) throw InvalidSourceException();
					name.must('\'');

					// out << '\'';
					out << nameend;
					// out << '\'';
					out << ']';
					name.must('\'');
					break;
				}
				out << '\'';
			}
			else if (name.readIf('<'))
			{
				parse();
				name.must('>');
			}
			else
			{
				Text tname = name.readto_y("<>,:' ");
				if (tname == nullptr)
				{
					out << name.readAll();
					break;
				}
				if (name.readIf('<'))
				{
					Text ns = out.subarr(nameStart);
					parseTemplateParameters(ns, tname);
				}
				else
				{
					if (tname.startsWith("lambda_"))
					{
						writeLambda(tname);
					}
					else
					{
						out << tname;
					}
				}
			}
			if (name.empty()) break;
			if (name.readIf(' ')) continue;
			if (name.readIf(':'))
			{
				out << "::";
				name.must(':');
			}
			else // , > '
			{
				break;
			}
		}
		return out.subarr(nameStart);
	}
};
Map<Text, size_t> TemplateParser::s_lambdas;

void PdbReader::getAll(GetAllCallback callback) noexcept
{
	callback.reader = this;

	SymEnumSymbols(
		m_process,
		m_base,
		nullptr,
		[](SYMBOL_INFO* symInfo, ULONG SymbolSize, void* callback)->BOOL {
			if (symInfo->Tag != SymTagFunction && symInfo->Tag != SymTagPublicSymbol)
			{
				return true;
			}
			
			GetAllCallback* cb = (GetAllCallback*)callback;

			TemplateParser parser;
			parser.name = Text(symInfo->Name, symInfo->NameLen);
			try
			{
				parser.parse();
			}
			catch (InvalidSourceException&)
			{
				parser.out << "..[err]";
			}
			catch (EofException&)
			{
				parser.out << "..[eof]";
			}
			//out << cb->reader->getTypeName(symInfo->TypeIndex);
			//out << ' ';

			return (*cb)(parser.out, (autoptr)symInfo->Address);
		},
		(PVOID)&callback);
}
autoptr PdbReader::getFunctionAddress(const char* name) noexcept
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

