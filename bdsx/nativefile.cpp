#include "nativefile.h"
#include "native.h"
#include "encoding.h"
#include "nodegate.h"
#include <KR3/win/windows.h>

using namespace kr;


const char* getWineVersion() noexcept
{
	static HMODULE hntdll = GetModuleHandle("ntdll.dll");
	if (!hntdll) return nullptr;

	static const char* (CDECL * pwine_get_version)(void) = (autoptr)GetProcAddress(hntdll, "wine_get_version");
	if (pwine_get_version)
	{
		return pwine_get_version();
	}
	else
	{
		return nullptr;
	}
}

const char* g_wineVersion = getWineVersion();


namespace
{
	TText16 getErrorMessage(int errcode, Text16 extra_msg) noexcept
	{
		if (errcode == 0) return nullptr;
		if (g_wineVersion != nullptr)
		{
			TSZ16 msg;
			msg << u"Error(" << errcode << u"): " << extra_msg;
			return msg;
		}
		TSZ16 msg = ErrorCode(errcode).getMessage<char16_t>();
		msg << u" (" << errcode << u"): " << extra_msg;
		return move(msg);
	}

	ATTR_NORETURN void throwError(int errcode, Text16 extra_msg) throws(JsException)
	{
		throw JsException((Text16)getErrorMessage(errcode, extra_msg));
	}

	template <typename T>
	struct FileCallbackState :OVERLAPPED
	{
		NativeFile* file;
		JsPersistent filekeep;
		JsPersistent callback;
		T buffer;
	};

	template <typename T>
	struct FileCallbackStateWithCharset :FileCallbackState<T>
	{
		Charset cs;
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
	if (m_file == INVALID_HANDLE_VALUE) throwError(GetLastError(), filename);
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
void NativeFile::read(double offset, int size, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"3rd argument must be function");
	
	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;

	auto* state = _new FileCallbackState<JsPersistent>();
	JsValue buffer = JsNewArrayBuffer(size);
	state->file = this;
	state->filekeep = *this;
	state->buffer = buffer;
	(uint64_t&)state->Offset = offset64;
	state->callback = callback;
	if (!ReadFileEx(m_file, buffer.getArrayBuffer().data(), size, state,
		[](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) {
			auto* state = (FileCallbackState<JsPersistent>*)lpOverlapped;
			JsValue callback = state->callback;
			JsValue ab = state->buffer;
			try
			{
				if (dwErrorCode == ERROR_HANDLE_EOF)
				{
					JsValue buffer = JsNewTypedArray(ab, JsTypedType::Uint8, 0);
					callback(nullptr, buffer);
				}
				else
				{
					JsValue buffer = JsNewTypedArray(ab, JsTypedType::Uint8, dwBytesTransferred);
					if (dwErrorCode == 0)
					{
						callback(nullptr, buffer);
					}
					else
					{
						callback(getErrorMessage(dwErrorCode, state->file->toString()), buffer);
					}
				}
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			g_call->tickCallback();
			delete state;
		}))
	{
		int err = GetLastError();
		delete state;
		if (err == ERROR_HANDLE_EOF)
		{
			JsValue ab = state->buffer;
			JsValue buffer = JsNewTypedArray(ab, JsTypedType::Uint8, 0);
			callback(nullptr, buffer);
			g_call->tickCallback();
			return;
		}
		throwError(err, toString());
	}
}
void NativeFile::write(double offset, JsValue obj, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"3rd argument must be a function");
	Buffer buffer = obj.getBuffer();
	if (buffer == nullptr) throw JsException(u"3rd argument must be a buffer");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;
	auto* state = _new FileCallbackState<JsPersistent>();
	state->file = this;
	(uint64_t&)state->Offset = offset64;
	state->callback = callback;
	state->buffer = obj;
	if (!WriteFileEx(m_file, buffer.data(), intact<DWORD>(buffer.size()), state,
		[](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept {
			auto* state = (FileCallbackState<JsPersistent>*)lpOverlapped;
			JsValue callback = state->callback;
			try
			{
				if (dwErrorCode != 0)
				{
					callback(getErrorMessage(dwErrorCode, state->file->toString()), (int)dwBytesTransferred);
				}
				else
				{
					callback(nullptr, (int)dwBytesTransferred);
				}
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			g_call->tickCallback();
			delete state;
		}))
	{
		int err = GetLastError();
		delete state;
		throwError(err, toString());
	}
}
double NativeFile::size() throws(JsException)
{
	LARGE_INTEGER size;
	if (!GetFileSizeEx(m_file, &size))
	{
		int err = GetLastError();
		throwError(err, toString());
	}
	return (double)size.QuadPart;
}
TText16 NativeFile::toString() noexcept
{
	TText16 out;
	out << u"[file: " << m_file << u']';
	return out;
}
void NativeFile::initMethods(kr::JsClassT<NativeFile>* cls) noexcept
{
	cls->setMethod(u"close", &NativeFile::close);
	cls->setMethod(u"read", &NativeFile::read);
	cls->setMethod(u"write", &NativeFile::write);
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