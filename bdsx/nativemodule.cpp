#include "nativemodule.h"
#include "staticpointer.h"
#include "nativepointer.h"
#include "networkidentifier.h"
#include "actor.h"

#include <KRWin/handle.h>
#include <KR3/util/stackgc.h>


using namespace kr;
using namespace win;


using namespace kr;

namespace NativeCaller
{
	static intptr_t getParameterValue(const JsValue& value, StackGC* gc) throws(JsException)
	{
		JsType type = value.getType();
		switch (type)
		{
		case JsType::Undefined: return 0;
		case JsType::Null: return 0;
		case JsType::Boolean: return value.as<bool>() ? 1 : 0;
		case JsType::Integer: return value.as<int>();
		case JsType::Float:
		{
			int res = value.as<int>();
			if ((double)value.as<int>() != value.as<double>())
			{
				throw JsException(u"non-supported type: float number");
			}
			return res;
		}
		case JsType::String:
		{
			return (intptr_t)value.as<Text16>().data();
		}
		case JsType::Function:
			throw JsException(u"non-supported type: function");
		case JsType::Object:
		{
			StaticPointer* ptr = value.getNativeObject<StaticPointer>();
			if (ptr) return (intptr_t)ptr->getAddressRaw();
			JsNetworkIdentifier* netid = value.getNativeObject<JsNetworkIdentifier>();
			if (netid) return (intptr_t)&netid->identifier;
			NativeActor* actor = value.getNativeObject<NativeActor>();
			if (actor) return (intptr_t)actor->ptr();
			NativeModule* winmodule = value.getNativeObject<NativeModule>();
			if (winmodule) return (intptr_t)winmodule->getModule();
			throw JsException(TSZ16() << u"non-supported type: object, " << JsValue(value.toString()).cast<Text16>());
		}
		case JsType::ArrayBuffer:
		case JsType::TypedArray:
		case JsType::DataView:
			return (intptr_t)value.getBuffer().data();
		default:
			throw JsException(TSZ16() << u"unknown javascript type: " << (int)type);
		}
	}

	template <size_t ... idx>
	struct Expander
	{
		template <size_t idx>
		using param = intptr_t;

		static intptr_t call(void* fn, const JsArguments& args) throws(JsException)
		{
			StackGC gc;
			return ((intptr_t(*)(param<idx>...))fn)(getParameterValue(args[idx], &gc) ...);
		}
	};

	template <size_t size>
	struct Call
	{
		static NativePointer* call(void* fn, const JsArguments& args) throws(...)
		{
			if (args.size() != size) return Call<size - 1>::call(fn, args);
			using caller = typename meta::make_numlist_counter<size>::template expand<Expander>;
			NativePointer* ptr = NativePointer::newInstance();
			intptr_t ret = caller::call(fn, args);
			ptr->setAddressRaw((void*)ret);
			return ptr;
		}
	};

	template <>
	struct Call<-1>
	{
		static NativePointer* call(void* fn, const JsArguments& args) throws(...)
		{
			unreachable();
		}
	};

	template <size_t size>
	static NativePointer* call(void* fn, const JsArguments& args) throws(JsException)
	{
		return Call<size>::call(fn, args);
	}

};

kr::JsPropertyId NativeModule::s_addressId;

JsValue NativeModule::createFunctionFromJsPointer(StaticPointer* pointer) throws(JsException)
{
	if (pointer == nullptr) throw JsException(u"argument must be *Pointer");
	return createFunctionFromPointer(pointer->getAddressRaw());
}
JsValue NativeModule::createFunctionFromPointer(void* fn) noexcept
{
	JsValue jsfn = JsFunction::make([fn](const kr::JsArguments& arguments) {
		JsAssert(arguments.size(), arguments.size() <= 16);
		return NativeCaller::call<16>(fn, arguments);
		});

	NativePointer* p = NativePointer::newInstance();
	p->setAddressRaw(fn);
	jsfn.set(s_addressId, p);
	return jsfn;
}

NativeModule::NativeModule(const JsArguments& args) throws(JsException)
	:JsObjectT(args)
{
	Text16 name = args.at<Text16>(0);
	m_module = Module::load(name.data());
	if (m_module == nullptr)
	{
		throw JsException(TSZ16() << u"LastError: " << GetLastError());
	}
}

JsValue NativeModule::get(Text16 name) noexcept
{
	void * fn = m_module->get(TSZ() << (Utf16ToUtf8)name);
	if (fn == nullptr) return nullptr;
	return createFunctionFromPointer(fn);
}
Module* NativeModule::getModule() noexcept
{
	return m_module;
}
void NativeModule::initMethods(kr::JsClassT<NativeModule>* cls) noexcept
{
	cls->setMethod(u"get", &NativeModule::get);
	cls->setStaticMethod(u"pointerToFunction", &NativeModule::createFunctionFromJsPointer);

	s_addressId = u"address";
}
void NativeModule::clearMethods() noexcept
{
	s_addressId = nullptr;
}
