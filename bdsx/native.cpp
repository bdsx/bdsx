#include "native.h"
#include "console.h"
#include "fs.h"
#include "nativepointer.h"
#include "nethook.h"

#include <KR3/util/process.h>

using namespace kr;

Manual<NativeModule> NativeModule::instance;

NativeModule::NativeModule() noexcept
{
	JsValue native = JsNewObject;
	native.set(u"console", createConsoleModule());
	native.setMethod(u"setOnErrorListener", [](JsValue listener) {
		if (listener.getType() != JsType::Function) throw JsException(u"argument must be function");
		instance->m_onError = listener;
		});
	native.setMethod(u"execSync", [](Text16 path, JsValue curdir) {
		return (AText)shell(path, curdir != undefined ? curdir.toString().as<Text16>().data() : nullptr);
		});
	native.setMethod(u"debug", [] {
		requestDebugger();
		debug();
		});
	native.set(u"fs", createFsModule());
	native.set(u"NativePointer", NativePointer::classObject);
	native.set(u"NativeFile", NativeFile::classObject);
	native.set(u"nethook", createNetHookModule());

	{
		JsValue ipban = JsNewObject;
		ipban.setMethod(u"add", [](Text16 ipport) {
			Text16 iptext = ipport.readwith_e('|');
			if (iptext.empty()) return;
			instance->m_banlist.insert(Ipv4Address(TSZ() << toNone(iptext)));
			});
		ipban.setMethod(u"remove", [](Text16 ipport) {
			Text16 iptext = ipport.readwith_e('|');
			if (iptext.empty()) return;
			instance->m_banlist.erase(Ipv4Address(TSZ() << toNone(iptext)));
			});
		native.set(u"ipban", ipban);
	}
	m_module = native;
}
NativeModule::~NativeModule() noexcept
{
	destroyNetHookModule();
}
JsValue NativeModule::getModule() noexcept
{
	return m_module;
}
void NativeModule::load() noexcept
{
}
bool NativeModule::isBanned(Ipv4Address ip) noexcept
{
	return m_banlist.has(ip);
}
bool NativeModule::fireError(const JsRawData& err) noexcept
{
	JsValue onError = m_onError;
	if (onError.isEmpty()) return false;
	return onError.call(undefined, { err }) == false;
}
