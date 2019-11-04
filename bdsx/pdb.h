#pragma once

#include <KR3/main.h>
#include <KR3/util/callable.h>

class PdbReader
{
public:
	using Callback = kr::Lambda<sizeof(void*)*3, bool(kr::Text name, kr::autoptr * address)>;

	PdbReader() noexcept;
	~PdbReader() noexcept;
	void* base() noexcept;
	void showInfo() noexcept;
	void search(const char * filter, Callback callback) noexcept;
	kr::autoptr getFunctionAddress(const char * name) noexcept;

private:
	void* m_process;
	uint64_t m_base;
};
