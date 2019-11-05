#include "console.h"
#include "jsctx.h"

#include <KR3/wl/windows.h>

using namespace kr;
namespace
{
	int s_consoleColor = FOREGROUND_INTENSITY | FOREGROUND_BLUE | FOREGROUND_GREEN | FOREGROUND_BLUE;
	static const HANDLE output = GetStdHandle(STD_OUTPUT_HANDLE);  // Get handle to standard output
}


int getConsoleColor() noexcept
{
	return s_consoleColor;
}
void setConsoleColor(int color) noexcept
{
	SetConsoleTextAttribute(output, color);
	s_consoleColor = color;
}

JsValue createConsoleModule() noexcept
{
	JsValue console = JsNewObject;

	console.setMethod(u"log", [](Text16 message) {
		checkCurrentThread();
		cout << toAnsi(message) << endl;
	});
	console.setMethod(u"setTextAttribute", [](int color) {
		checkCurrentThread();
		SetConsoleTextAttribute(output, color);
		s_consoleColor = color;
	});
	console.setMethod(u"getTextAttribute", []() {
		checkCurrentThread();
		return s_consoleColor;
	});

	console.set(u"FOREGROUND_BLUE", FOREGROUND_BLUE);
	console.set(u"FOREGROUND_GREEN", FOREGROUND_GREEN);
	console.set(u"FOREGROUND_RED", FOREGROUND_RED);
	console.set(u"FOREGROUND_INTENSITY", FOREGROUND_INTENSITY);
	console.set(u"BACKGROUND_BLUE", BACKGROUND_BLUE);
	console.set(u"BACKGROUND_GREEN", BACKGROUND_GREEN);
	console.set(u"BACKGROUND_RED", BACKGROUND_RED);
	console.set(u"BACKGROUND_INTENSITY", BACKGROUND_INTENSITY);
	return console;
}

ConsoleColorScope::ConsoleColorScope(int color) noexcept
	:m_old(getConsoleColor())
{
	setConsoleColor(color);
}
ConsoleColorScope::~ConsoleColorScope() noexcept
{
	setConsoleColor(m_old);
}

