#pragma once

#include <KR3/js/js.h>

class NativeFile :public kr::JsObjectT<NativeFile>, public kr::Node<NativeFile, true>
{
public:
	static constexpr const char16_t className[] = u"File";
	static constexpr bool global = false;

	NativeFile(const kr::JsArguments& args) throws(kr::JsException);
	~NativeFile() noexcept;
	bool close() noexcept;
	void writeBuffer(double offset, kr::JsValue text, kr::JsValue callback) throws(kr::JsException);
	void writeUtf8(double offset, kr::Text16 text, kr::JsValue callback) throws(kr::JsException);
	void readBuffer(double offset, int size, kr::JsValue callback) throws(kr::JsException);
	void readUtf8(double offset, int size, kr::JsValue callback) throws(kr::JsException);
	double size() throws(kr::JsException);
	kr::TText16 toString() noexcept;

	static void initMethods(kr::JsClassT<NativeFile>* cls) noexcept;
	static void clearMethods() noexcept;
	static void reset() noexcept;

private:
	void* m_file;
};
