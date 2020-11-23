#include "codewrite.h"
#include "console.h"

using namespace kr;
using namespace hook;


namespace
{
	void codeError(Text name, void* code, size_t offset, View<pair<size_t, size_t>> diff) noexcept
	{
		Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
		TSZ out;
		out << "[BDSX] " << name << "+0x" << hexf(offset) << " - hooking failed, bytes did not matched at {";
		for (const pair<size_t, size_t>& v : diff)
		{
			out << " {" << v.first << ", " << v.second << "}, ";
		}
		out << "}\n";
		console.logA(out);
	}
}

Code::Code(size_t size) noexcept
	:JitFunction(size)
{
	memset(pointer(), 0xcc, size);
}
void Code::patchTo(Text name, void* base, size_t offset, Buffer originalCode, Register tempregister, bool jump, View<pair<size_t, size_t>> skip) noexcept
{
	if (base == nullptr)
	{
		console.logA(TSZ() << "[BDSX] " << name << "+0x" << hexf(offset) << " - skipped, junction point not found\n");
		return;
	}
	CodeDiff diff = JitFunction::patchTo((byte*)base + offset, originalCode, tempregister, jump, skip);
	if (!diff.succeeded()) codeError(name, base, offset, diff);
}
void Code::patchTo_jz(Text name, void* base, size_t offset, hook::Register testregister, void* jumpPoint, Buffer originalCode, Register tempregister) noexcept
{
	if (base == nullptr)
	{
		console.logA(TSZ() << "[BDSX] " << name << "+0x" << hexf(offset) << " - skipped, junction point not found\n");
		return;
	}
	CodeDiff diff = JitFunction::patchTo_jz((byte*)base + offset, testregister, jumpPoint, originalCode, tempregister);
	if (!diff.succeeded()) codeError(name, base, offset, diff);
}

void Code::hook(Text name, void* from, void* to, View<uint8_t> originalCode, View<pair<size_t, size_t>> skip) noexcept
{
	CodeDiff diff = JitFunction::hook(from, to, originalCode, skip);
	if (!diff.succeeded()) codeError(name, from, 0, diff);
}
void Code::nopping(Text name, void* base, size_t offset, View<uint8_t> originalCode, View<pair<size_t, size_t>> skip) noexcept
{
	CodeDiff diff = JitFunction::nopping((byte*)base+offset, originalCode, skip);
	if (!diff.succeeded()) codeError(name, base, offset, diff);
}

ModuleInfo::ModuleInfo() noexcept
	:m_currentModule(GetModuleHandleW(nullptr))
{
}
ModuleInfo::~ModuleInfo() noexcept
{
}

autoptr ModuleInfo::operator ()(intptr_t offset) noexcept
{
	return (byte*)m_currentModule + offset;
}