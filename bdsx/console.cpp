#include "console.h"
#include "jsctx.h"

#include <KR3/win/windows.h>
#include <KR3/net/client.h>

using namespace kr;

namespace
{
	constexpr size_t MAXIMUM_BUFFER = 8192;
}


Console console;

class Console::Client :private kr::Client, public Threadable<Client>
{
	friend Console;

protected:
	AText16 m_host;
	word m_port;
	AText m_key;
	bool m_connected;
	EventPump* m_threadPump = nullptr;
	
	void onError(Text name, int code) noexcept override
	{
		debug();
	}
	void onConnect() noexcept override
	{
	}
	void onWriteBegin() noexcept override
	{
		console.m_lock.enter();
	}
	void onWriteEnd() noexcept override
	{
		console.m_lock.leave();
	}
	void onRead() throws(...) override
	{
		for (Buffer buf : m_receive)
		{
			console.input(buf.cast<char>());
		}
		m_receive.clear();
	}
	void onClose() noexcept override
	{
		m_threadPump->post(3000_ms, [this](TimerEvent* timer){ 
			if (connect()) return;
			timer->addTime(3000_ms);
			m_threadPump->attach(timer);
		});
	}

public:
	int thread() noexcept
	{
		m_threadPump = EventPump::getInstance();
		return m_threadPump->messageLoopWith({makeProcedure()});
	}
	void init(AText16 host, word port, AText key) noexcept
	{
		m_host = move(host);
		m_host << nullterm;
		m_port = port;
		m_key = move(key);
		m_key << '\n';
	}

	bool connect() noexcept
	{
		getWriteQueue()->clear();
		write(m_key.cast<void>());
		try
		{
			connectSync(m_host.data(), m_port);
			return true;
		}
		catch (SocketException&)
		{
			return false;
		}
	}

	Client() noexcept
	{
		m_connected = false;
	}
	~Client() noexcept
	{
		if (m_threadPump == nullptr) return;
		m_threadPump->quit(0);
		join();
	}
};

namespace
{
	Console::Client s_client;
}


int Console::getColor() noexcept
{
	return m_color;
}
void Console::setColor(int color) noexcept
{
	SetConsoleTextAttribute(m_stdout, color);
	m_color = color;
}
void Console::log(Text text) noexcept
{
	CsLock __lock = m_lock;
	if (s_client.m_connected)
	{
		s_client.write(text.cast<void>());
		s_client.flush();
	}
	else
	{
		cout.write(text);
	}
}
void Console::logLine(Text text) noexcept
{
	CsLock __lock = m_lock;
	if (s_client.m_connected)
	{
		s_client.write(text.cast<void>());
		s_client.write({ "\n", 1 });
		s_client.flush();
	}
	else
	{
		cout << text << endl;
	}
}

void Console::input(Text text) noexcept
{
	log(text);

	TmpArray<INPUT_RECORD> inputs;
	inputs.reserve(text.size()*2);

	for (char chr : text)
	{
		WORD keycode;
		DWORD shift = 0;
		if (chr <= 0x7f)
		{
			if (chr == '\n')
			{
				chr = '\r';
				keycode = VK_RETURN;
			}
			else if ('a' <= chr && chr <= 'z')
			{
				keycode = chr - ('a' - 'A');
			}
			else
			{
				keycode = chr;
				shift = ('A' <= chr && chr <= 'Z') ? 0x80 : 0x00;
			}
		}
		else
		{
			keycode = 0;
		}

		INPUT_RECORD* input = inputs.prepare(1);
		input->EventType = KEY_EVENT;
		input->Event.KeyEvent.bKeyDown = true;
		input->Event.KeyEvent.dwControlKeyState = shift;
		input->Event.KeyEvent.uChar.UnicodeChar = chr;
		input->Event.KeyEvent.wVirtualKeyCode = keycode;
		input->Event.KeyEvent.wRepeatCount = 1;
		input->Event.KeyEvent.wVirtualScanCode = MapVirtualKeyW(keycode, MAPVK_VK_TO_VSC);

		input = inputs.prepare(1);
		input->EventType = KEY_EVENT;
		input->Event.KeyEvent.bKeyDown = false;
		input->Event.KeyEvent.dwControlKeyState = shift;
		input->Event.KeyEvent.uChar.UnicodeChar = chr;
		input->Event.KeyEvent.wVirtualKeyCode = keycode;
		input->Event.KeyEvent.wRepeatCount = 1;
		input->Event.KeyEvent.wVirtualScanCode = MapVirtualKeyW(keycode, MAPVK_VK_TO_VSC);
	}

	DWORD writed;
	BOOL WriteConsoleInput_result = WriteConsoleInputW(m_stdin, inputs.data(), intact<DWORD>(inputs.size()), &writed);
	_assert(WriteConsoleInput_result);
}

JsValue Console::createModule() noexcept
{
	JsValue obj = JsNewObject;
	obj.setMethod(u"log", [](Text16 message) {
		TText temp;
		temp << toAnsi(message) << '\n';
		console.log(temp);
	});
	obj.setMethod(u"setTextAttribute", [](int color) { return console.setColor(color); });
	obj.setMethod(u"getTextAttribute", [](int color) { return console.getColor(); });

	obj.set(u"FOREGROUND_BLUE", FOREGROUND_BLUE);
	obj.set(u"FOREGROUND_GREEN", FOREGROUND_GREEN);
	obj.set(u"FOREGROUND_RED", FOREGROUND_RED);
	obj.set(u"FOREGROUND_INTENSITY", FOREGROUND_INTENSITY);
	obj.set(u"BACKGROUND_BLUE", BACKGROUND_BLUE);
	obj.set(u"BACKGROUND_GREEN", BACKGROUND_GREEN);
	obj.set(u"BACKGROUND_RED", BACKGROUND_RED);
	obj.set(u"BACKGROUND_INTENSITY", BACKGROUND_INTENSITY);
	return obj;
}
bool Console::connect(AText16 host, word port, AText key) noexcept
{
	try
	{
		s_client.m_connected = true;
		s_client.init(move(host), port, move(key));
		s_client.connect();
		s_client.start();
		return true;
	}
	catch (SocketException&)
	{
		log(TSZ() << "BDSX: --pipe-socket failed, Cannot connect to " << toAnsi((Text16)host) << ':' << port << '\n');
		return false;
	}
}

Console::Console() noexcept
	:m_stdout(GetStdHandle(STD_OUTPUT_HANDLE)),
	m_stdin(GetStdHandle(STD_INPUT_HANDLE))
{
	m_color = FOREGROUND_INTENSITY | FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE;
}
Console::~Console() noexcept
{
}

Console::ColorScope::ColorScope(int color) noexcept
	:m_old(console.getColor())
{
	console.setColor(color);
}
Console::ColorScope::~ColorScope() noexcept
{
	console.setColor(m_old);
}

