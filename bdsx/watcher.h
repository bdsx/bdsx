#pragma once

#include <KR3/js/js.h>
#include <KR3/fs/watcher.h>

class Watcher : public kr::JsObjectT<Watcher>,public kr::Node<Watcher, true>
{
public:
	static constexpr const char16_t className[] = u"Watcher";
	static constexpr bool global = false;

	class Impl :public kr::DirectoryWatcher
	{
	public:
		void onCreated(kr::Text16 name) noexcept override;
		void onDeleted(kr::Text16 name) noexcept override;
		void onModified(kr::Text16 name) noexcept override;
		void onRenamed(kr::Text16 newname, kr::Text16 oldname) noexcept override;

	private:
		Watcher* _watcher() noexcept;
	};
	Watcher(const kr::JsArguments& args) throws(kr::JsException);
	~Watcher() noexcept;
	void close() noexcept;
	void setOnCreated(kr::JsValue func) throws(kr::JsException);
	void setOnDeleted(kr::JsValue func) throws(kr::JsException);
	void setOnModified(kr::JsValue func) throws(kr::JsException);
	void setOnRenamed(kr::JsValue func) throws(kr::JsException);
	static void initMethods(kr::JsClassT<Watcher>* cls) noexcept;
	static void clearMethods() noexcept;
	static void reset() noexcept;

private:
	Impl m_impl;
	kr::JsPersistent m_onCreate;
	kr::JsPersistent m_onDelete;
	kr::JsPersistent m_onModified;
	kr::JsPersistent m_onRename;
	bool m_closed;
};

