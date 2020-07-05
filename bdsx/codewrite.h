#pragma once

#include <KR3/main.h>
#include <KRWin/hook.h>

bool checkCode(kr::Text name, void* code, size_t offset, kr::Buffer originalCode, kr::View<std::pair<size_t, size_t> > skip = nullptr) noexcept;

class Code :public kr::hook::CodeWriter
{
private:
	void* m_codeptr;

public:
	Code(size_t size) noexcept;
	static void hook(kr::Text name, void* from, void* to, kr::Buffer originalCode, kr::View<std::pair<size_t, size_t>> skip = nullptr) noexcept;
	static void nopping(kr::Text name, void* base, size_t offset, kr::Buffer originalCode, kr::View<std::pair<size_t, size_t>> skip = nullptr) noexcept;
	void patchTo(kr::Text name, void* base, size_t offset, kr::Buffer originalCode, kr::hook::Register tempregister, bool jump, kr::View<std::pair<size_t, size_t>> skip = nullptr) noexcept;
	void patchToBoolean(kr::Text name, void* base, size_t offset, kr::hook::Register testregister, void* jumpPoint, kr::Buffer originalCode, kr::hook::Register tempregister) noexcept;
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
