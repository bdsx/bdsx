#pragma once

#include <KR3/js/js.h>

kr::JsValue createConsoleModule() noexcept;
int getConsoleColor() noexcept;
void setConsoleColor(int color) noexcept;

class ConsoleColorScope
{
public:
	ConsoleColorScope(int color) noexcept;
	~ConsoleColorScope() noexcept;

private:
	int m_old;
};

