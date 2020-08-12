#pragma once

#include <KR3/js/js.h>
#include <KR3/mt/criticalsection.h>


class Console
{
public:
	class Client;
	class Input;

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

	// write log without encoding converting
	// only for ASCII characters
	// it will check assertion for ASCII only
	void logA(kr::Text text, bool error = false) noexcept;

	// write log with system encoding
	void logAnsi(kr::Text text, bool error = false) noexcept;

	// write log with utf-8 encoding
	void log(kr::Text text, bool error = false) noexcept;

	// write log with utf-8 encoding, socket only
	void netlog(kr::Text text) noexcept;

	// write log with utf-16 encoding
	void log(kr::Text16 text, bool error = false) noexcept;

	// write log+newline with utf-8 encoding
	void logLine(kr::Text text, bool error = false) noexcept;

	// write log+newline with utf-16 encoding
	void logLine(kr::Text16 text, bool error = false) noexcept;

	bool connect(kr::AText16 host, kr::word port, kr::AText key) noexcept;

	void writeToStdin(kr::Text text) noexcept;

	kr::TText getLine() noexcept;
	void startStdin() noexcept;
	bool isConnectedWithSocket() noexcept;

private:

	int m_color;
	void* const m_stdout;
	void* const m_stdin;
	kr::CriticalSection m_lock;
};

extern Console console;
