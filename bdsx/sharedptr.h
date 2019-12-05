#pragma once

#include <KR3/js/js.h>
#include "reverse.h"
#include "staticpointer.h"

class SharedPointer:public kr::JsObjectT<SharedPointer, StaticPointer>
{
public:
	static constexpr const char16_t className[] = u"SharedPointer";
	static constexpr bool global = false;

	SharedPointer(const kr::JsArguments & args) throws(kr::JsException);
	SharedPtrData& getRaw() noexcept;
	void setRaw(SharedPtrData data) noexcept;
	void dispose() noexcept;
	void assignTo(StaticPointer* ptr) throws(kr::JsException);

	static void initMethods(kr::JsClassT<SharedPointer> * cls) noexcept;

private:
	SharedPtrData m_data;
};

