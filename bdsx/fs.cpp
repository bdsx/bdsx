#include "fs.h"
#include <KR3/wl/windows.h>
#include <KR3/fs/file.h>
#include <KR3/fs/watcher.h>
#include <KR3/util/path.h>

using namespace kr;

namespace
{
	template <typename T>
	struct FileCallbackState :OVERLAPPED
	{
		NativeFile* file;
		JsPersistent callback;
		T buffer;
	};

}

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



class Watcher : public JsObjectT<Watcher>
{
public:
	static constexpr char16_t className[] = u"NativeFile";
	class Impl :public DirectoryWatcher
	{
	public:
		void onCreate(Text16 name) noexcept override;
		void onDelete(Text16 name) noexcept override;
		void onModified(Text16 name) noexcept override;
		void onRename(Text16 oldname, Text16 newname) noexcept override;

	private:
		Watcher* _watcher() noexcept;
	};
	Watcher(const JsArguments & args) noexcept;
	void setOnCreate(JsValue func) throws(JsException);
	void setOnDelete(JsValue func) throws(JsException);
	void setOnModified(JsValue func) throws(JsException);
	void setOnRename(JsValue func) throws(JsException);
	static void initMethods(JsClassT<Watcher>* cls) noexcept;

private:
	Impl m_impl;
	JsPersistent m_onCreate;
	JsPersistent m_onDelete;
	JsPersistent m_onModified;
	JsPersistent m_onRename;
};


void Watcher::Impl::onCreate(Text16 name) noexcept
{
}
void Watcher::Impl::onDelete(Text16 name) noexcept
{
}
void Watcher::Impl::onModified(Text16 name) noexcept
{
	udout << u"modified: " << name << endl;
}
void Watcher::Impl::onRename(Text16 oldname, Text16 newname) noexcept
{
	JsValue func = _watcher()->m_onRename;
}
Watcher* Watcher::Impl::_watcher() noexcept
{
	return (Watcher*)((byte*)this - offsetof(Watcher, m_impl));
}

Watcher::Watcher(const JsArguments& args) noexcept
	:JsObjectT(args)
{
}
void Watcher::setOnCreate(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onCreate = func;
}
void Watcher::setOnDelete(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onDelete = func;
}
void Watcher::setOnModified(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onModified = func;
}
void Watcher::setOnRename(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onRename = func;
}
void Watcher::initMethods(JsClassT<Watcher>* cls) noexcept
{
	cls->setMethod(u"setOnCreate", &Watcher::setOnCreate);
	cls->setMethod(u"setOnDelete", &Watcher::setOnDelete);
	cls->setMethod(u"setOnModified", &Watcher::setOnModified);
	cls->setMethod(u"setOnRename", &Watcher::setOnRename);
}

JsValue createFsModule() noexcept
{
	JsValue fs = JsNewObject;
	fs.setMethod(u"readUtf8FileSync", [](Text16 filename) {
		try
		{
			Must<File> file = File::open(TSZ16() << filename);
			filesize_t size = file->size();
			if (size >= 512 * 1024 * 1024) throw JsException(TSZ16() << u"File is too big: " << filename);
			AText buffer(size);
			size_t readed = file->read(buffer.data(), size);
			buffer.resize(readed);
			TText16 text16;
			text16 << utf8ToUtf16(buffer);
			return (JsValue)text16;
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
	});
	fs.setMethod(u"readBufferFileSync", [](Text16 filename) {
		try
		{
			Must<File> file = File::open(TSZ16() << filename);
			filesize_t size = file->size();
			if (size >= 512 * 1024 * 1024) throw JsException(TSZ16() << u"File is too big: " << filename);
			JsValue buffer = JsNewArrayBuffer(size);
			size_t readed = file->read(buffer.getTypedArrayBuffer().data(), size);
			return (JsValue)JsNewTypedArray(buffer, JsTypedArrayType::Uint8, readed);
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
	});
	fs.setMethod(u"writeUtf8FileSync", [](Text16 filename, Text16 text) {
		try
		{
			Must<File> file = File::create(TSZ16() << filename);
			TSZ utf8;
			utf8 << (Utf16ToUtf8)text;
			file->write(utf8.data(), utf8.size());
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
	});
	fs.setMethod(u"writeBufferFileSync", [](Text16 filename, JsValue text) {
		Buffer buffer = text.getBuffer();
		if (buffer == nullptr) throw JsException(u"2nd argument must be buffer");

		try
		{
			Must<File> file = File::create(TSZ16() << filename);
			file->write(buffer.data(), buffer.size());
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
	});
	fs.setMethod(u"cwd", [](){
		return move(TText16() << currentDirectory);
	});
	fs.setMethod(u"chdir", [](TText16 dir) {
		SetCurrentDirectoryW(szlize(dir, &TText16()));
	});
	return fs;
}

NativeFile::NativeFile(const JsArguments& args) throws(JsException)
	:JsObjectT<NativeFile>(args)
{
	int access = args[1].cast<int>();
	int creation = args[2].cast<int>();
	Text16 filename = args[0].cast<Text16>();
	m_file = CreateFileW(wide((TSZ16() << filename).c_str()),
		access, FILE_SHARE_READ | FILE_SHARE_WRITE, nullptr, creation, FILE_FLAG_OVERLAPPED, nullptr);
	if (m_file == INVALID_HANDLE_VALUE) throwLastError(filename);
}
bool NativeFile::close() noexcept
{
	if (m_file == INVALID_HANDLE_VALUE) return false;
	CloseHandle(m_file);
	m_file = INVALID_HANDLE_VALUE;
	return true;
}
void NativeFile::readUtf8(double offset, int size, JsValue callback) throws(JsException)
{
	if (callback.getType() != JsType::Function) throw JsException(u"2nd argument must be function");

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
		if (dwErrorCode == ERROR_HANDLE_EOF)
		{
			value.call(undefined, { nullptr, u""_tx });
		}
		else
		{
			TText16 text16;
			text16 << utf8ToUtf16(state->buffer.cut(dwBytesTransferred));
			value.call(undefined, { getErrorMessage(dwErrorCode, state->file->toString()), (Text16)text16 });
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
	if (callback.getType() != JsType::Function) throw JsException(u"2nd argument must be function");

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
				value.call(undefined, { getErrorMessage(dwErrorCode, state->file->toString()), buffer });
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
	if (callback.getType() != JsType::Function) throw JsException(u"2nd argument must be function");

	uint64_t offset64 = (offset < 0) ? -1 : (uint64_t)offset;

	auto* state = _new FileCallbackState<AText>();
	state->file = this;
	(uint64_t&)state->Offset = offset64;
	state->callback = callback;
	state->buffer = toUtf8(text);

	if (!WriteFileEx(m_file, state->buffer.data(), intact<DWORD>(state->buffer.size()), state, 
		[](DWORD dwErrorCode, DWORD dwBytesTransferred, LPOVERLAPPED lpOverlapped) noexcept {
		auto* state = (FileCallbackState<AText>*)lpOverlapped;
		JsValue value = state->callback;
		value.call(undefined, { getErrorMessage(dwErrorCode, state->file->toString()), (int)dwBytesTransferred });
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
			JsValue value = state->callback;
			value.call(undefined, { getErrorMessage(dwErrorCode, state->file->toString()), (int)dwBytesTransferred });
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