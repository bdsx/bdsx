#include "codewrite.h"

using namespace kr;
using namespace hook;

Code::Code(size_t size) noexcept
	:CodeWriter(ExecutableAllocator::getInstance()->alloc(size), size)
{
	m_codeptr = end();
	memset(m_codeptr, 0xcc, 64);
}
void Code::patchTo(void* junctionPoint, Buffer originalCode, kr::hook::Register tempregister, bool jump, Text name) noexcept
{
	size_t size = originalCode.size();
	Unprotector unpro(junctionPoint, size);
	if (!checkCode(junctionPoint, originalCode, name)) return;

	CodeWriter writer((void*)unpro, size);
	if (jump) writer.jump(m_codeptr, tempregister);
	else writer.call(m_codeptr, tempregister);
	writer.fillNop();
}
void Code::patchToBoolean(void* junctionPoint, kr::hook::Register testregister, void* jumpPoint, Buffer originalCode, kr::hook::Register tempregister, Text name) noexcept
{
	size_t size = originalCode.size();
	Unprotector unpro(junctionPoint, size);
	if (!checkCode(junctionPoint, originalCode, name)) return;

	CodeWriter writer((void*)unpro, size);
	writer.call(m_codeptr, tempregister);
	writer.test(testregister, testregister);
	writer.jz(intact<int32_t>((byte*)jumpPoint - (byte*)writer.end() - 6));
	writer.fillNop();
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