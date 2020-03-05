#pragma once

#include <KR3/js/js.h>
#include <KR3/mt/criticalsection.h>


class Console
{
public:
	class Client;

	class ColorScope
	{
	public:
		ColorScope(int color) noexcept;
		~ColorScope() noexcept;

	private:
		int m_old;
	};

	Console() noexcept;
	~Console() noexcept;

	kr::JsValue createModule() noexcept;
	int getColor() noexcept;
	void setColor(int color) noexcept;
	void log(kr::Text text) noexcept;
	void logLine(kr::Text text) noexcept;

	bool connect(kr::AText16 host, kr::word port, kr::AText key) noexcept;
	void input(kr::Text text) noexcept;

private:

	int m_color;
	void* const m_stdout;
	void* const m_stdin;
	kr::CriticalSection m_lock;
};

extern Console console;
