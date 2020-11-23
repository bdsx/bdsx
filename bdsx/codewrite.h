#pragma once

#include <KR3/main.h>
#include <KRWin/hook.h>

class Code :public kr::hook::JitFunction
{
public:
	Code(size_t size) noexcept;

	void patchTo(kr::Text name, void* base, size_t offset, kr::Buffer originalCode, kr::hook::Register tempregister, bool jump, kr::View<std::pair<size_t, size_t>> skip = nullptr) noexcept;
	void patchTo_jz(kr::Text name, void* base, size_t offset, kr::hook::Register testregister, void* jumpPoint, kr::Buffer originalCode, kr::hook::Register tempregister) noexcept;

	static void hook(kr::Text name, void* from, void* to, kr::View<uint8_t> originalCode, kr::View<std::pair<size_t, size_t>> skip = nullptr) noexcept;
	static void nopping(kr::Text name, void* base, size_t offset, kr::View<uint8_t> originalCode, kr::View<std::pair<size_t, size_t>> skip = nullptr) noexcept;
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
