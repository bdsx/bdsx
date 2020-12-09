#include "encoding.h"

using namespace kr;

JsValue ExEncoding::jsencode(JsValue buffer, int encoding) throws(JsException)
{
	if (encoding == BUFFER) return buffer;
	Buffer buf = buffer.getBuffer();
	if (buf != nullptr) return buffer;

	JsValue destbuf;
	Text16 text = buffer.cast<Text16>();
	if (encoding == UTF16)
	{
		size_t textBytes = text.bytes();
		destbuf = JsNewTypedArray(JsTypedType::Uint8, textBytes);
		WBuffer dest = destbuf.getBuffer();
		memcpy(dest.data(), text.data(), textBytes);
	}
	else
	{
		Charset cs = (Charset)encoding;
		CHARSET_CONSTLIZE(cs,
			Utf16ToMultiByte<cs> encoding = text;
			size_t textBytes = encoding.size();
			destbuf = JsNewTypedArray(JsTypedType::Uint8, textBytes);
			WBuffer dest = destbuf.getBuffer();
			encoding.copyTo((char*)dest.data());
		);
	}
	return destbuf;
}
JsValue ExEncoding::jsdecode(JsValue buffer, int encoding) throws(JsException)
{
	Buffer buf = buffer.getBuffer();
	if (buf == nullptr) throw JsException(u"1st parameter must be buffer");

	if (encoding == BUFFER)
	{
		JsValue out = JsNewArray(2);
		out.set(0, buffer);
		out.set(1, intact<int>(buf.size()));
		return out;
	}

	JsValue out = JsNewArray(2);
	if (encoding == UTF16)
	{
		size_t bytes = buf.size();
		size_t sz = bytes >> 1;
		out.set(0, Text16((char16*)buf.data(), sz));
		out.set(1, intact<int>(sz << 1));
	}
	else
	{
		Charset cs = (Charset)encoding;
		Text text = buf.cast<char>();
		CHARSET_CONSTLIZE(cs,
			if (meml<cs>::endsWithOdd(text)) text.popGet();
			out.set(0, TText16() << (MultiByteToUtf16<cs>)text);
			out.set(1, intact<int>(text.size()));
		);
	}
	return out;
}