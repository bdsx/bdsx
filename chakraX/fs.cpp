#include "fs.h"
#include <KR3/wl/windows.h>

using namespace kr;

namespace
{
	template <typename T>
	struct FileCallbackState :OVERLAPPED
	{
		JsPersistent callback;
		T buffer;
	};

	JsValue getErrorMessage(int errcode) noexcept
	{
		if (errcode == 0) return nullptr;
		TSZ16 msg = ErrorCode(errcode).getMessage<char16>();
		msg << u" (" << errcode << u")";
		JsException error((Text16)msg);
		return error.getValue();
	}

	void writeFileCompletion(DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept{
		auto* state = (FileCallbackState<ABuffer>*)lpOverlapped;
		JsValue value = state->callback;
		value.call(undefined, { getErrorMessage(dwErrorCode), (int)dwBytesTransferred });
		delete state;
	}

	void readBufferFileCompletion(DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept
	{
		auto* state = (FileCallbackState<JsPersistent>*)lpOverlapped;
		JsValue value = state->callback;
		JsValue ab = state->buffer;
		if (dwErrorCode == ERROR_HANDLE_EOF)
		{
			JsValue buffer = JsNewTypedArray(ab, JsTypedArrayType::Uint8, 0);
			value.call(undefined, { nullptr, buffer });
		}
		else
		{
			JsValue buffer = JsNewTypedArray(ab, JsTypedArrayType::Uint8, dwBytesTransferred);
			value.call(undefined, { getErrorMessage(dwErrorCode), buffer });
		}
		delete state;
	}

	void readTextFileCompletion(DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept
	{
		auto* state = (FileCallbackState<AText>*)lpOverlapped;
		JsValue value = state->callback;
		if (dwErrorCode == ERROR_HANDLE_EOF)
		{
			value.call(undefined, { nullptr, u""_tx });
		}
		else
		{
			TText16 text16;
			text16 << utf8ToUtf16(state->buffer.cut(dwBytesTransferred));
			value.call(undefined, { getErrorMessage(dwErrorCode), (Text16)text16 });
		}
		delete state;
	}
}

JsValue createFsModule() noexcept
{
	JsValue fs = JsNewObject;
	return fs;
}

ATTR_NORETURN void throwLastError() throws(JsException)
{
	int errcode = GetLastError();
	TSZ16 msg = ErrorCode(errcode).getMessage<char16>();
	msg << u" (" << errcode << u")";
	throw JsException((Text16)msg);
}

NativeFile::NativeFile(const JsArguments& args) throws(JsException)
	:JsObjectT<NativeFile>(args)
{
	int access = args[1].cast<int>();
	int creation = args[2].cast<int>();

	m_file = CreateFileW(wide((TSZ16() << args[0].cast<Text16>()).c_str()),
		access, FILE_SHARE_READ | FILE_SHARE_WRITE, nullptr, creation, FILE_FLAG_OVERLAPPED, nullptr);
	if (m_file == INVALID_HANDLE_VALUE) throwLastError();
}
bool NativeFile::close() noexcept
{
	if (m_file == INVALID_HANDLE_VALUE) return false;
	CloseHandle(m_file);
	m_file = INVALID_HANDLE_VALUE;
	return true;
}
void NativeFile::read(double offset, int size, JsValue callback, bool isBuffer) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"2nd argument must be function");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;

	if (isBuffer)
	{
		auto* state = _new FileCallbackState<JsPersistent>();
		JsValue buffer = JsNewArrayBuffer(size);
		state->buffer = buffer;
		(uint64_t&)state->Offset = offset64;
		state->callback = callback;
		if (!ReadFileEx(m_file, buffer.getTypedArrayBuffer().data(), size, state, readBufferFileCompletion))
		{
			delete state;
			throwLastError();
		}
	}
	else
	{
		auto* state = _new FileCallbackState<AText>();
		(uint64_t&)state->Offset = offset64;
		state->callback = callback;
		state->buffer.resize(size);
		if (!ReadFileEx(m_file, state->buffer.data(), size, state, readTextFileCompletion))
		{
			delete state;
			throwLastError();
		}
	}
}
void NativeFile::write(double offset, JsValue text, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"2nd argument must be function");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;

	auto* state = _new FileCallbackState<AText>();
	(uint64_t&)state->Offset = offset64;
	state->callback = callback;

	if (text.getType() == JsType::String)
	{
		state->buffer = toUtf8(text.as<Text16>());
	}
	else
	{
		state->buffer = text.getBuffer().cast<char>();
	}
	if (!WriteFileEx(m_file, state->buffer.data(), intact<DWORD>(state->buffer.size()), state, writeFileCompletion))
	{
		delete state;
		throwLastError();
	}
}
double NativeFile::size() throws(JsException)
{
	LARGE_INTEGER size;
	if (!GetFileSizeEx(m_file, &size))
	{
		throwLastError();
	}
	return (double)size.QuadPart;
}
void NativeFile::initMethods(kr::JsClassT<NativeFile>* cls) noexcept
{
	cls->setMethod(u"close", &NativeFile::close);
	cls->setMethod(u"read", &NativeFile::read);
	cls->setMethod(u"write", &NativeFile::write);
	cls->set(u"WRITE", GENERIC_WRITE);
	cls->set(u"READ", GENERIC_READ);
	cls->set(u"CREATE_NEW", CREATE_NEW);
	cls->set(u"CREATE_ALWAYS", CREATE_ALWAYS);
	cls->set(u"OPEN_EXISTING", OPEN_EXISTING);
	cls->set(u"OPEN_ALWAYS", OPEN_ALWAYS);
}