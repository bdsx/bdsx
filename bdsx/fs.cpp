#include "fs.h"
#include <KR3/win/windows.h>
#include <KR3/fs/file.h>
#include <KR3/util/path.h>

#include "watcher.h"
#include "nativefile.h"
#include "encoding.h"

using namespace kr;

JsValue createFsModule() noexcept
{
	JsValue fs = JsNewObject;
	fs.set(u"Watcher", Watcher::classObject);
	fs.set(u"File", NativeFile::classObject);
	fs.setMethod(u"readFileSync", [](Text16 filename, int encoding) {
		try
		{
			Must<File> file = File::open(TSZ16() << filename);
			filesize_t size = file->size();
			if (size >= 512 * 1024 * 1024) throw JsException(TSZ16() << u"File is too big: " << filename);

			if (encoding == ExEncoding::BUFFER)
			{
				JsValue buffer = JsNewArrayBuffer(size);
				size_t readed = file->read(buffer.getTypedArrayBuffer().data(), size);
				return (JsValue)JsNewTypedArray(buffer, JsTypedArrayType::Uint8, readed);
			}
			else
			{
				TText buffer(size);
				size_t readed = file->read(buffer.data(), size);
				buffer.resize(readed);
				if (encoding == ExEncoding::UTF16)
				{
					return (JsValue)Text16((pcstr16)buffer.data(), buffer.size() >> 1);
				}
				else
				{
					Charset cs = (Charset)encoding;
					TText16 text16;
					CHARSET_CONSTLIZE(cs,
						text16 << MultiByteToUtf16<cs>(buffer);
					);
					return (JsValue)text16;
				}
			}
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
	});
	fs.setMethod(u"writeFileSync", [](Text16 filename, JsValue jsval, int encoding) {
		try
		{
			if (encoding == ExEncoding::BUFFER)
			{
				Buffer buffer = jsval.getBuffer();
				if (buffer == nullptr) throw JsException(u"2nd argument must be buffer");

				Must<File> file = File::create(TSZ16() << filename);
				file->write(buffer.data(), buffer.size());
			}
			else
			{
				Must<File> file = File::create(TSZ16() << filename);
				if (encoding == ExEncoding::UTF16)
				{
					Text16 text = jsval.cast<Text16>();;
					file->write(text.data(), text.size());
				}
				else
				{
					TSZ mb;
					Charset cs = (Charset)encoding;
					CHARSET_CONSTLIZE(cs,
						mb << (Utf16ToMultiByte<cs>)jsval.cast<Text16>();
					);
					file->write(mb.data(), mb.size());
				}
			}
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
	});
	fs.setMethod(u"appendFileSync", [](Text16 filename, JsValue jsval, int encoding) {
		try
		{
			if (encoding == ExEncoding::BUFFER)
			{
				Buffer buffer = jsval.getBuffer();
				if (buffer == nullptr) throw JsException(u"2nd argument must be buffer");

				Must<File> file = File::openWrite(TSZ16() << filename);
				file->movePointerToEnd(0);
				file->write(buffer.data(), buffer.size());
			}
			else
			{
				Must<File> file = File::openWrite(TSZ16() << filename);
				if (encoding == ExEncoding::UTF16)
				{
					file->movePointerToEnd(0);
					Text16 text = jsval.cast<Text16>();
					file->write(text.data(), text.size()*2);
				}
				else
				{
					TSZ mb;
					Charset cs = (Charset)encoding;
					CHARSET_CONSTLIZE(cs,
						mb << (Utf16ToMultiByte<cs>)jsval.cast<Text16>();
					);
					file->movePointerToEnd(0);
					file->write(mb.data(), mb.size());
				}
			}
			
		}
		catch (ErrorCode & err)
		{
			throw JsException(err.getMessage<char16>() << u": " << filename);
		}
		});
	fs.setMethod(u"deleteFileSync", [](Text16 filename) {
		return File::remove(filename.data());
		});
	fs.setMethod(u"deleteRecursiveSync", [](Text16 path) {
		return File::removeFullDirectory(path.data());
		});
	fs.setMethod(u"copyFileSync", [](Text16 from, Text16 to) {
		return File::copy(to.data(), from.data());
		});
	fs.setMethod(u"copyRecursiveSync", [](Text16 from, Text16 to) {
		return File::copyFull(to.data(), from.data());
		});
	fs.setMethod(u"mkdirSync", [](Text16 path) {
		return File::createDirectory(path.data());
		});
	fs.setMethod(u"mkdirRecursiveSync", [](Text16 path) {
		return File::createFullDirectory(path);
		});
	fs.setMethod(u"cwd", [](){
		return move(TText16() << currentDirectory);
	});
	fs.setMethod(u"chdir", [](TText16 dir) {
		SetCurrentDirectoryW(szlize(dir, &TText16()));
	});
	return fs;
}
