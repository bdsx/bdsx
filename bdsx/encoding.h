#pragma once

#include <KR3/js/js.h>

namespace ExEncoding
{
	static constexpr int UTF16 = -2;
	static constexpr int BUFFER = -1;

	kr::JsValue jsencode(kr::JsValue buffer, int encoding, kr::JsValue cacheBuffer) throws(kr::JsException);
	kr::JsValue jsdecode(kr::JsValue buffer, int encoding) throws(kr::JsException);
}
