#pragma once

#include <KR3/js/js.h>
#include <KR3/wl/handle.h>

kr::JsValue createFsModule() noexcept;

class NativeFile :public kr::JsObjectT<NativeFile>
{
public:
	static constexpr char16_t className[] = u"NativeFile";
	static constexpr bool global = false;

	NativeFile(const kr::JsArguments& args) throws(kr::JsException);
	bool close() noexcept;
	void write(double offset, kr::JsValue text, kr::JsValue callback) throws(kr::JsException);
	void read(double offset, int size, kr::JsValue callback, bool isBuffer) throws(kr::JsException);

	static void initMethods(kr::JsClassT<NativeFile>* cls) noexcept;

private:
	void* m_file;
};
