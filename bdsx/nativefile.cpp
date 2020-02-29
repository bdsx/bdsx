#include "nativefile.h"
#include "native.h"
#include <KR3/wl/windows.h>

using namespace kr;

namespace
{
	TText16 getErrorMessage(int errcode, Text16 extra_msg) noexcept
	{
		if (errcode == 0) return nullptr;
		TText16 msg = ErrorCode(errcode).getMessage<char16>();
		msg << u" (" << errcode << u"): " << extra_msg;
		return msg;
	}

	ATTR_NORETURN void throwLastError(Text16 extra_msg) throws(JsException)
	{
		int errcode = GetLastError();
		throw JsException((Text16)getErrorMessage(errcode, extra_msg));
	}

	template <typename T>
	struct FileCallbackState :OVERLAPPED
	{
		NativeFile* file;
		JsPersistent callback;
		T buffer;
	};

	LinkedList<NativeFile> s_list;
}

NativeFile::NativeFile(const JsArguments& args) throws(JsException)
	:JsObjectT<NativeFile>(args)
{
	int access = args.at<int>(1);
	int creation = args.at<int>(2);
	Text16 filename = args.at<Text16>(0);
	m_file = CreateFileW(wide((TSZ16() << filename).c_str()),
		access, FILE_SHARE_READ | FILE_SHARE_WRITE, nullptr, creation, FILE_FLAG_OVERLAPPED, nullptr);
	if (m_file == INVALID_HANDLE_VALUE) throwLastError(filename);
	s_list.attach(this);
}
NativeFile::~NativeFile() noexcept
{
	close();
}
bool NativeFile::close() noexcept
{
	if (m_file == INVALID_HANDLE_VALUE) return false;
	CloseHandle(m_file);
	m_file = INVALID_HANDLE_VALUE;
	s_list.detach(this);
	return true;
}
void NativeFile::readUtf8(double offset, int size, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"3rd argument must be function");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;
	auto* state = _new FileCallbackState<AText>();
	(uint64_t&)state->Offset = offset64;
	state->file = this;
	state->callback = callback;
	state->buffer.resize(size);
	if (!ReadFileEx(m_file, state->buffer.data(), size, state,
		[](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept {
			auto* state = (FileCallbackState<AText>*)lpOverlapped;
			JsValue value = state->callback;
			try
			{
				if (dwErrorCode == ERROR_HANDLE_EOF)
				{
					value(nullptr, u""_tx);
				}
				else
				{
					TText16 text16;
					text16 << utf8ToUtf16(state->buffer.cut(dwBytesTransferred));
					value(getErrorMessage(dwErrorCode, state->file->toString()), (Text16)text16, dwBytesTransferred);
				}
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			delete state;
		}))
	{
		delete state;
		throwLastError(toString());
	}
}
void NativeFile::readBuffer(double offset, int size, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"3rd argument must be function");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;

	auto* state = _new FileCallbackState<JsPersistent>();
	JsValue buffer = JsNewArrayBuffer(size);
	state->file = this;
	state->buffer = buffer;
	(uint64_t&)state->Offset = offset64;
	state->callback = callback;
	if (!ReadFileEx(m_file, buffer.getTypedArrayBuffer().data(), size, state,
		[](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) {
			auto* state = (FileCallbackState<JsPersistent>*)lpOverlapped;
			JsValue callback = state->callback;
			JsValue ab = state->buffer;
			try
			{
				if (dwErrorCode == ERROR_HANDLE_EOF)
				{
					JsValue buffer = JsNewTypedArray(ab, JsTypedArrayType::Uint8, 0);
					callback(nullptr, buffer);
				}
				else
				{
					JsValue buffer = JsNewTypedArray(ab, JsTypedArrayType::Uint8, dwBytesTransferred);
					callback(getErrorMessage(dwErrorCode, state->file->toString()), buffer);
				}
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			delete state;
		}))
	{
		delete state;
		throwLastError(toString());
	}
}
void NativeFile::writeUtf8(double offset, Text16 text, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"3rd argument must be function");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;

	auto* state = _new FileCallbackState<AText>();
	state->file = this;
	(uint64_t&)state->Offset = offset64;
	state->callback = callback;
	state->buffer = toUtf8(text);

	if (!WriteFileEx(m_file, state->buffer.data(), intact<DWORD>(state->buffer.size()), state,
		[](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept {
			auto* state = (FileCallbackState<AText>*)lpOverlapped;
			JsValue callback = state->callback;
			try
			{
				callback(getErrorMessage(dwErrorCode, state->file->toString()), (int)dwBytesTransferred);
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			delete state;
		}))
	{
		delete state;
		throwLastError(toString());
	}
}
void NativeFile::writeBuffer(double offset, JsValue text, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"3rd argument must be function");
	Buffer buffer = text.getBuffer();
	if (buffer == nullptr) throw JsException(u"2nd argument must be buffer");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;

	auto* state = _new FileCallbackState<JsPersistent>();
	state->file = this;
	(uint64_t&)state->Offset = offset64;
	state->callback = callback;
	state->buffer = text;
	if (!WriteFileEx(m_file, buffer.data(), intact<DWORD>(buffer.size()), state,
		[](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept {
			auto* state = (FileCallbackState<ABuffer>*)lpOverlapped;
			JsValue callback = state->callback;
			try
			{
				callback(getErrorMessage(dwErrorCode, state->file->toString()), (int)dwBytesTransferred);
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			delete state;
		}))
	{
		delete state;
		throwLastError(toString());
	}
}
double NativeFile::size() throws(JsException)
{
	LARGE_INTEGER size;
	if (!GetFileSizeEx(m_file, &size))
	{
		throwLastError(toString());
	}
	return (double)size.QuadPart;
}
TText16 NativeFile::toString() noexcept
{
	TText16 out;
	out << u"[file: " << m_file << ']';
	return out;
}
void NativeFile::initMethods(kr::JsClassT<NativeFile>* cls) noexcept
{
	cls->setMethod(u"close", &NativeFile::close);
	cls->setMethod(u"readUtf8", &NativeFile::readUtf8);
	cls->setMethod(u"readBuffer", &NativeFile::readBuffer);
	cls->setMethod(u"writeUtf8", &NativeFile::writeUtf8);
	cls->setMethod(u"writeBuffer", &NativeFile::writeBuffer);
	cls->setMethod(u"toString", &NativeFile::toString);
	cls->set(u"WRITE", GENERIC_WRITE);
	cls->set(u"READ", GENERIC_READ);
	cls->set(u"CREATE_NEW", CREATE_NEW);
	cls->set(u"CREATE_ALWAYS", CREATE_ALWAYS);
	cls->set(u"OPEN_EXISTING", OPEN_EXISTING);
	cls->set(u"OPEN_ALWAYS", OPEN_ALWAYS);
}
void NativeFile::clearMethods() noexcept
{
	reset();
}
void NativeFile::reset() noexcept
{
	for (NativeFile& file : s_list)
	{
		CloseHandle(file.m_file);
		file.m_file = INVALID_HANDLE_VALUE;
	}
	s_list.clear();
}