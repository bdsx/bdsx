#pragma once

#include <KR3/main.h>
#include <KR3/js/js.h>

#ifdef WIN32
#define SEP u"\\"
#else
#define SEP u"/"
#endif

class Require
{
public:
	Require(kr::AText16 dirname) noexcept;

	Require(Require&& _move) noexcept;

	~Require() noexcept;

	static void init(kr::Text16 root) noexcept;
	static void start() noexcept;
	static void clear() noexcept;

	kr::JsValue operator ()(kr::Text16 modulename) const throws(JsException);

private:
	kr::AText16 m_dirname;
	static void _loadPackageJson() noexcept;
};
