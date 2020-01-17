#include "fs.h"
#include <KR3/wl/windows.h>
#include <KR3/fs/file.h>
#include <KR3/util/path.h>

#include "watcher.h"
#include "nativefile.h"

using namespace kr;

JsValue createFsModule() noexcept
{
	JsValue fs = JsNewObject;
	fs.set(u"Watcher", Watcher::classObject);
	fs.set(u"File", NativeFile::classObject);
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
	fs.setMethod(u"appendUtf8FileSync", [](Text16 filename, Text16 text) {
		try
		{
			Must<File> file = File::openAndWrite(TSZ16() << filename);
			TSZ utf8;
			utf8 << (Utf16ToUtf8)text;
			file->movePointerToEnd(0);
			file->write(utf8.data(), utf8.size());
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
		});
	fs.setMethod(u"appendBufferFileSync", [](Text16 filename, JsValue text) {
		Buffer buffer = text.getBuffer();
		if (buffer == nullptr) throw JsException(u"2nd argument must be buffer");

		try
		{
			Must<File> file = File::openAndWrite(TSZ16() << filename);
			file->movePointerToEnd(0);
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
