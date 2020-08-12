#include "console.h"
#include "jsctx.h"
#include "nodegate.h"

#include <KR3/win/windows.h>
#include <KR3/net/client.h>
#include <KR3/util/bufferqueue.h>

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
	void onRead() throws(...) override;
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


class Console::Input:public Threadable<Console::Input>
{
	static constexpr size_t HISTORY_MAX = 100;

private:
	EventList<2> m_inputEvents;

	AText16 m_input;
	Array<size_t> m_inputPos;
	size_t m_lengthInConsole = 0;
	
	Array<AText16> m_history;
	size_t m_historyIdx = 0;

	size_t m_cursor;

	Array<AText> m_inputRequests;
	atomic<size_t> m_inputCount;

	CriticalSection m_inputLock;
	CriticalSection m_displayLock;

	struct AsyncRead: OVERLAPPED
	{
		char buffer[256];

		void request() noexcept
		{
			if (!ReadFile(console.m_stdin, buffer, sizeof(buffer), nullptr, this))
			{
				ErrorCode err = ErrorCode::getLast();
				if (err != ERROR_IO_PENDING)
				{
					console.logLine(u"Cannot read stdin", true);
					TSZ16 errstr = err.getMessage<char16>();
					if (g_call != nullptr) g_call->error((Text16)errstr);
					else console.logLine(errstr, true);
				}
				return;
			}
		}

	};

	COORD _getPos() noexcept
	{
		CONSOLE_SCREEN_BUFFER_INFO cinfo;
		GetConsoleScreenBufferInfo(console.m_stdout, &cinfo);
		return cinfo.dwCursorPosition;
	}
	void _setPos(COORD coord) noexcept
	{
		SetConsoleCursorPosition(console.m_stdout, coord);
	}

	void _delete() noexcept
	{
		m_input.remove(m_cursor);
		m_inputPos.remove(m_cursor);
		_invalidate(m_cursor);
	}

	size_t _getConsolePos() noexcept
	{
		return m_cursor == 0 ? 0 : m_inputPos[m_cursor - 1];
	}
	size_t _getConsolePos(size_t at) noexcept
	{
		return at == 0 ? 0 : m_inputPos[at - 1];
	}

	void _clearDisplay() noexcept
	{
		size_t pos = _getConsolePos();
		for (size_t i = 0; i < pos; i++)
		{
			cout << '\b';
		}
		for (size_t i = 0; i < m_lengthInConsole; i++)
		{
			cout << ' ';
		}
		for (size_t i = 0; i < m_lengthInConsole; i++)
		{
			cout << '\b';
		}
	}
	void _forward(size_t count) noexcept
	{
		COORD coord = _getPos();
		coord.X += (short)(count);
		_setPos(coord);
	}
	void _back(size_t count) noexcept
	{
		COORD coord = _getPos();
		coord.X -= (short)(count);
		_setPos(coord);;
	}
	void _move(size_t from, size_t to)
	{
		if (to > from) _forward(to - from);
		else _back(from - to);
	}
	void _restoreDisplay() noexcept
	{
		cout << Utf16ToAnsi(m_input);
		size_t pos = _getConsolePos();
		size_t end = m_lengthInConsole;
		_back(end - pos);
	}
	void _setCursor(size_t to) noexcept
	{
		if (m_cursor == to) return;
		size_t frompos = _getConsolePos();
		size_t topos = _getConsolePos(to);
		m_cursor = to;
		_move(frompos, topos);
	}

	bool _readStdin() noexcept
	{
		for (char chr : Text(""))
		{
			m_displayLock.enter();
			cout << "0x" << hexf((byte)chr) << endl;
			m_displayLock.leave();

			if (chr == (char)0xe0)
			{
				switch (chr)
				{
				case 0x48: // up
					if (m_historyIdx > 0)
					{
						m_historyIdx--;
						_setInput(m_history[m_historyIdx]);
					}
					break;
				case 0x4B: // left
					m_displayLock.enter();
					if (m_cursor > 0)
					{
						_setCursor(m_cursor - 1);
					}
					m_displayLock.leave();
					break;
				case 0x4D: // right
					m_displayLock.enter();
					if (m_cursor < m_input.size())
					{
						_setCursor(m_cursor + 1);
					}
					m_displayLock.leave();
					break;
				case 0x50: // down
					size_t size = m_history.size();
					if (m_historyIdx < size)
					{
						m_historyIdx++;
						if (m_historyIdx == size)
						{
							m_displayLock.enter();
							m_input.clear();
							m_inputPos.clear();
							m_cursor = 0;
							m_displayLock.leave();
						}
						else
						{
							_setInput(m_history[m_historyIdx]);
						}
					}
					break;
				}
			}
			else switch (chr)
			{
			case VK_RETURN: {
				m_displayLock.enter();
				AText16 out = move(m_input);
				m_inputPos.clear();
				m_lengthInConsole = 0;
				m_cursor = 0;
				if (out.empty())
				{
					m_displayLock.leave();
					return false;
				}
				cout << endl;
				m_displayLock.leave();
				m_history.push(move(out));
				if (m_history.size() > HISTORY_MAX)
				{
					m_history.remove(0);
				}
				m_historyIdx = m_history.size();
				return true;
			}
			case VK_BACK:
				m_displayLock.enter();
				if (m_cursor != 0)
				{
					_setCursor(m_cursor - 1);
					_delete();
				}
				m_displayLock.leave();
				break;
			case VK_DELETE:
				m_displayLock.enter();
				if (m_cursor != m_input.size())
				{
					_delete();
				}
				m_displayLock.leave();
				break;
			default:
				//	char16 chr = (char16)record.Event.KeyEvent.uChar.UnicodeChar;
				if (chr == 0) break;
				m_displayLock.enter();
				m_input.insert(m_cursor, chr);
				size_t prevpos = _getPos().X;
				cout << chr;
				size_t size = _getPos().X - prevpos;
				size_t oldpos = _getConsolePos(m_cursor);
				m_inputPos.insert(m_cursor, oldpos + size);

				m_cursor++;
				_invalidate(m_cursor);

				m_lengthInConsole++;
				m_displayLock.leave();
				break;
			}
		}
		return false;
	}

	void _invalidate(size_t from) noexcept
	{
		size_t cpos = _getConsolePos();
		size_t pos = _getConsolePos(from);
		_move(cpos, pos);

		Text16 fromText = m_input.subarr(from);

		ArrayWriter<size_t> poslist = m_inputPos.subarr(from).toWriter();
		for (char16 chr : fromText)
		{
			short prevpos = _getPos().X;
			cout << (Utf16ToAnsi)Text16(&chr, 1);
			size_t size = _getPos().X - prevpos;
			pos += size;
			poslist.write(pos);
		}
		size_t end = !m_inputPos.empty() ? m_inputPos.back() : 0;
		if (end < m_lengthInConsole)
		{
			for (; end < m_lengthInConsole; end++)
			{
				cout << ' ';
			}
			_back(m_lengthInConsole - cpos);
		}
		else
		{
			_back(end - cpos);
		}
		m_lengthInConsole = end;
	}
	void _setInput(Text16 input) noexcept
	{
		m_displayLock.enter();
		_clearDisplay();
		m_inputPos.resize(0, input.size());
		m_input = input;
		size_t pos = 0;
		for (char16 chr : input)
		{
			short prevpos = _getPos().X;
			cout << (Utf16ToAnsi)Text16(&chr, 1);
			size_t size = _getPos().X - prevpos;
			pos += size;
			m_inputPos.push(pos);
		}
		m_lengthInConsole = m_inputPos.empty() ? 0 : m_inputPos.back();
		m_cursor = m_input.size();
		m_displayLock.leave();
	}

public:

	Input() noexcept
	{
		m_inputEvents.push(EventHandle::create(false, false));
	}
	~Input() noexcept
	{
		terminate();
	}

	int thread() noexcept
	{
		char buffer[256];
		for (;;)
		{
			gets_s(buffer);
			input((Text)(const char *)buffer);
		}
		return 0;
	}

	void outputLock() noexcept
	{
		m_displayLock.enter();
	}
	void outputUnlock() noexcept
	{
		m_displayLock.leave();
	}

	void input(AText text) noexcept
	{
		m_inputLock.enter();
		m_inputRequests.push(move(text));
		m_inputLock.leave();
		m_inputCount++;

		m_inputEvents[0]->set();
	}
	TText getLine() noexcept
	{
		if (m_inputCount != 0) goto __readInput;

		for (;;)
		{
			switch (m_inputEvents.wait())
			{
			case 0:
				if (m_inputCount != 0)
				{
				__readInput:
					m_inputCount--;

					CsLock lock = m_inputLock;
					TText out = m_inputRequests.front();
					m_inputRequests.remove(0);
					return out;
				}
				break;
			}
		}
	}
	void print(Text text, bool error) noexcept
	{
		m_displayLock.enter();
		_clearDisplay();
		if (error) cerr << text;
		else cout << text;
		_restoreDisplay();
		m_displayLock.leave();
	}
	void println(Text text, bool error) noexcept
	{
		m_displayLock.enter();
		_clearDisplay();
		if (error) cerr << text << endl;
		else cout << text << endl;
		_restoreDisplay();
		m_displayLock.leave();
	}
};

namespace
{
	Console::Client s_client;
	Console::Input s_input;
}

void Console::Client::onRead() throws(...)
{
	TBuffer temp;
	for (;;)
	{
		Buffer buf = m_receive.readwith('\n', &temp);
		Text text = buf.cast<char>();
		s_input.input(text);
		console.logLine(text);
	}
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
void Console::logA(Text text, bool error) noexcept
{
#ifdef _DEBUG
	for (char chr : text)
	{
		_assert(chr >= 0);
	}
#endif
	netlog(text);
	s_input.print(text, error);
}
void Console::logAnsi(Text text, bool error) noexcept
{
	{
		CsLock __lock = m_lock;
		if (s_client.m_connected)
		{
			TText16 utf16 = ansiToUtf16(text);
			TText utf8 = toUtf8(utf16);
			s_client.write(utf8.cast<void>());
			s_client.flush();
			return;
		}
	}
	s_input.print(text, error);
}
void Console::log(Text text, bool error) noexcept
{
	netlog(text);
	TText16 utf16 = utf8ToUtf16(text);
	TText ansi = toAnsi(utf16);
	s_input.print(ansi, error);
}
// write log with utf-8 encoding, socket only
void Console::netlog(kr::Text text) noexcept
{
	CsLock __lock = m_lock;
	if (s_client.m_connected)
	{
		s_client.write(text.cast<void>());
		s_client.flush();
		return;
	}
}
void Console::log(Text16 text, bool error) noexcept
{
	{
		CsLock __lock = m_lock;
		if (s_client.m_connected)
		{
			TText utf8 = toUtf8(text);
			s_client.write(utf8.cast<void>());
			s_client.flush();
			return;
		}
	}
	TText ansi = toAnsi(text);
	s_input.print(ansi, error);
}
void Console::logLine(Text text, bool error) noexcept
{
	{
		CsLock __lock = m_lock;
		if (s_client.m_connected)
		{
			s_client.write(text.cast<void>());
			s_client.write({ "\n", 1 });
			s_client.flush();
			return;
		}
	}
	TText16 utf16 = utf8ToUtf16(text);
	TText ansi = toAnsi(utf16);
	s_input.println(ansi, error);
}
void Console::logLine(Text16 text, bool error) noexcept
{
	{
		CsLock __lock = m_lock;
		if (s_client.m_connected)
		{
			TText utf8 = toUtf8(text);
			utf8 << '\n';
			s_client.write(utf8.cast<void>());
			s_client.flush();
			return;
		}
	}
	TText ansi = toAnsi(text);
	s_input.println(ansi, error);
}
void Console::writeToStdin(kr::Text text) noexcept
{
	s_input.input(text);
}

TText Console::getLine() noexcept
{
	return s_input.getLine();
}
void Console::startStdin() noexcept
{
	s_input.start();
}
bool Console::isConnectedWithSocket() noexcept
{
	return s_client.m_connected;
}

JsValue Console::createModule() noexcept
{
	JsValue obj = JsNewObject;
	obj.setMethod(u"log", [](Text16 message) {
		console.logLine(message);
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
		log(TSZ() << "[BDSX] --pipe-socket failed, Cannot connect to " << toAnsi((Text16)host) << ':' << port << '\n');
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
	s_input.outputLock();
	console.setColor(color);
}
Console::ColorScope::~ColorScope() noexcept
{
	console.setColor(m_old);
	s_input.outputUnlock();
}

