#pragma once

#include <KR3/js/js.h>
#include <KR3/wl/handle.h>

class StaticPointer;

class NativeModule:public kr::JsObjectT<NativeModule>
{
public:
	static constexpr const char16_t className[] = u"DLL";
	static constexpr bool global = false;

	NativeModule(const kr::JsArguments& args) throws(kr::JsException);
	kr::JsValue get(kr::Text16 name) noexcept;
	kr::win::Module* module() noexcept;

	static kr::JsValue createFunctionFromJsPointer(StaticPointer* pointer) throws(kr::JsException);
	static kr::JsValue createFunctionFromPointer(void* fn) noexcept;
	static void initMethods(kr::JsClassT<NativeModule>* cls) noexcept;
	static void clearMethods() noexcept;

private:
	kr::win::Module* m_module;
	static kr::JsPropertyId s_addressId;
};
