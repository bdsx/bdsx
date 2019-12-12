#pragma once

#include <KR3/main.h>
#include <KRWin/hook.h>

bool checkCode(void* code, kr::Buffer originalCode, kr::Text name, kr::View<std::pair<size_t, size_t> > skip = nullptr) noexcept;

class Code :public kr::hook::CodeWriter
{
private:
	void* m_codeptr;

public:
	Code(size_t size) noexcept;
	void patchTo(void* junctionPoint, kr::Buffer originalCode, kr::hook::Register tempregister, bool jump, kr::Text name, kr::View<std::pair<size_t, size_t>> skip = nullptr) noexcept;
	void patchToBoolean(void* junctionPoint, kr::hook::Register testregister, void* jumpPoint, kr::Buffer originalCode, kr::hook::Register tempregister, kr::Text name) noexcept;
};

class ModuleInfo
{
private:
	const HANDLE m_currentModule;

public:
	ModuleInfo() noexcept;
	~ModuleInfo() noexcept;

	kr::autoptr operator ()(intptr_t offset) noexcept;
};
