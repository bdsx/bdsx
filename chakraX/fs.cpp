#include "fs.h"
#include <KR3/wl/windows.h>
#include <KRMessage/taskqueue.h>

using namespace kr;

namespace
{
	TaskQueue s_tasks;
}

JsValue createFsModule() noexcept
{
	JsValue fs = JsNewObject;
	fs.setMethod(u"process", [] {
		s_tasks.process();
	});
	fs.setMethod(u"writeFile", [](Text16 filepath, JsValue text, JsValue callback) {
		HANDLE hFile = CreateFileW(wide((TSZ16() << filepath).c_str()), 
			GENERIC_WRITE, FILE_SHARE_READ, NULL, CREATE_ALWAYS, FILE_FLAG_OVERLAPPED, NULL);
		if (INVALID_HANDLE_VALUE == hFile)
		{
			throw JsException((Text16)(TSZ16() << GetLastError()));
		}

		struct WriteFileState :OVERLAPPED
		{
			ABuffer buffer;
			JsPersistent callback;
		};

		if (callback.getType() != JsType::Function) throw JsException(u"3rd argument must be function");

		WriteFileState * state = _new WriteFileState();
		state->Offset = 0xFFFFFFFF;
		state->OffsetHigh = 0xFFFFFFFF;
		state->callback = callback;

		if (text.getType() == JsType::String)
		{
			(AText&)state->buffer << toUtf8(text.as<Text16>());
		}
		else
		{
			state->buffer = text.getBuffer();
		}
		if (!WriteFileEx(hFile, state->buffer.data(), intact<DWORD>(state->buffer.size()), state, [](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) {
			s_tasks.post([dwErrorCode, dwBytesTransferred, lpOverlapped] {
				auto* state = (WriteFileState*)lpOverlapped;
				JsValue value = state->callback;
				value.call(undefined, { (int)dwErrorCode, (int)dwBytesTransferred });
				delete state;
				});
			}))
		{
			fprintf(stdout, "Unable to write to file! Error %u\n", GetLastError());
		}
		CloseHandle(hFile);
	});

	return fs;
}
