#pragma once

#include <KR3/js/js.h>
#include <KR3/net/client.h>
#include <KR3/mt/criticalsection.h>


class Console:private kr::Client
{
public:
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

	bool connect(kr::pcstr16 host, kr::word port, kr::Text key) noexcept;
	void input(kr::Text text) noexcept;

private:
	void onError(kr::Text name, int code) noexcept override;
	void onConnect() noexcept override;
	void onWriteBegin() noexcept override;
	void onWriteEnd() noexcept override;
	void onRead() throws(...) override;
	void onClose() noexcept override;

	int m_color;
	void* const m_stdout;
	void* const m_stdin;
	kr::CriticalSection m_lock;
	bool m_connected;
};

extern Console console;
