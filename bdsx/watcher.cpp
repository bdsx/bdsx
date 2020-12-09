#include "watcher.h"
#include "native.h"
#include "nodegate.h"

using namespace kr;

namespace
{
	LinkedList<Watcher> s_list;
}

void Watcher::Impl::onCreated(Text16 name) noexcept
{
	JsPersistent& oncreate = _watcher()->m_onCreate;
	if (oncreate.isEmpty()) return;
	try
	{
		(JsValue(oncreate))(name);
	}
	catch (JsException & err)
	{
		g_native->fireError(err.getValue());
	}
	g_call->tickCallback();
}
void Watcher::Impl::onDeleted(Text16 name) noexcept
{
	JsPersistent& oncreate = _watcher()->m_onDelete;
	if (oncreate.isEmpty()) return;
	try
	{
		(JsValue(oncreate))(name);
	}
	catch (JsException & err)
	{
		g_native->fireError(err.getValue());
	}
	g_call->tickCallback();
}
void Watcher::Impl::onModified(Text16 name) noexcept
{
	JsPersistent& oncreate = _watcher()->m_onModified;
	if (oncreate.isEmpty()) return;
	try
	{
		(JsValue(oncreate))(name);
	}
	catch (JsException & err)
	{
		g_native->fireError(err.getValue());
	}
	g_call->tickCallback();
}
void Watcher::Impl::onRenamed(Text16 newname, Text16 oldname) noexcept
{
	JsPersistent& oncreate = _watcher()->m_onRename;
	if (oncreate.isEmpty()) return;
	try
	{
		(JsValue(oncreate))(newname, oldname);
	}
	catch (JsException & err)
	{
		g_native->fireError(err.getValue());
	}
	g_call->tickCallback();
}
Watcher* Watcher::Impl::_watcher() noexcept
{
	return (Watcher*)((byte*)this - offsetof(Watcher, m_impl));
}

Watcher::Watcher(const JsArguments& args) throws(JsException)
	:JsObjectT(args)
{
	m_closed = false;
	try
	{
		m_impl.open(args.at<Text16>(0).data(), args.equalsAt(0, true));
	}
	catch (Error&)
	{
		throw JsException(ErrorCode::getLast().getMessage<char16>());
	}
	s_list.attach(this);
}
Watcher::~Watcher() noexcept
{
	close();
}
void Watcher::close() noexcept
{
	if (m_closed) return;
	m_closed = true;
	s_list.detach(this);
	m_impl.close();
}
void Watcher::setOnCreated(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onCreate = func;
}
void Watcher::setOnDeleted(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onDelete = func;
}
void Watcher::setOnModified(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onModified = func;
}
void Watcher::setOnRenamed(JsValue func) throws(JsException)
{
	if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
	m_onRename = func;
}
void Watcher::initMethods(JsClassT<Watcher>* cls) noexcept
{
	cls->setMethod(u"close", &Watcher::close);
	cls->setMethod(u"setOnCreated", &Watcher::setOnCreated);
	cls->setMethod(u"setOnDeleted", &Watcher::setOnDeleted);
	cls->setMethod(u"setOnModified", &Watcher::setOnModified);
	cls->setMethod(u"setOnRenamed", &Watcher::setOnRenamed);
}
void Watcher::clearMethods() noexcept
{
	reset();
}
void Watcher::reset() noexcept
{
	for (Watcher& watcher : s_list)
	{
		watcher.m_impl.close();
		watcher.m_closed = true;
	}
	s_list.detachAll();
}
