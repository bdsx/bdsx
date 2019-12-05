#include "sharedptr.h"
#include "nativepointer.h"


using namespace kr;

SharedPointer::SharedPointer(const JsArguments& args) throws(kr::JsException)
	:JsObjectT(args)
{
	if (m_address == nullptr) return;
	try
	{
		m_data = *(SharedPtrData*)m_address;
		m_address = (byte*)m_data.pointer;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

SharedPtrData& SharedPointer::getRaw() noexcept
{
	return m_data;
}
void SharedPointer::setRaw(SharedPtrData data) noexcept
{
	m_data = ::move(data);
	setAddressRaw(m_data.pointer);
}
void SharedPointer::dispose() noexcept
{
	m_data.discard();
	m_address = nullptr;
}
void SharedPointer::assignTo(StaticPointer* ptr) throws(JsException)
{
	if (ptr == nullptr) throw JsException(u"1st argument must be *Pointer");
	void * rawptr = ptr->getAddressRaw();
	try
	{
		*(SharedPtrData*)rawptr = m_data;
	}
	catch (...)
	{
		accessViolation(rawptr);
	}
}

void SharedPointer::initMethods(JsClassT<SharedPointer>* cls) noexcept
{
	cls->setMethod(u"assignTo", &SharedPointer::assignTo);
	cls->setMethod(u"dispose", &SharedPointer::dispose);
}
