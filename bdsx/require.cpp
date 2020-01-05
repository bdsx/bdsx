#include "require.h"

#include <KR3/fs/file.h>
#include <KR3/util/path.h>
#include <KR3/parser/jsonparser.h>
#include <KR3/wl/windows.h>

#include "console.h"
#include "native.h"
#include "mcf.h"

using namespace kr;

namespace
{
	Map<Text16, JsPersistent> s_modules;
	AText16 s_moduleRoot;
	JsPropertyId s_exports;
}

char16 jsIdentifierFilter(char16 chr) noexcept
{
	switch (chr)
	{
	case u'!':
	case u'@':
	case u'#':
	case u'%':
	case u'^':
	case u'&':
	case u'*':
	case u'(':
	case u')':
	case u'+':
	case u'|':
	case u'-':
	case u'=':
	case u'\\':
	case u'`':
	case u'~':
	case u'[':
	case u']':
	case u'{':
	case u'}':
	case u';':
	case u':':
	case u'\'':
	case u'\"':
	case u',':
	case u'.':
	case u'<':
	case u'>':
	case u'/':
	case u'?':
		return u'_'; break;
	default: return chr; break;
	}
}

Require::Require(AText16 dirname) noexcept
	:m_dirname(move(dirname))
{
}
Require::Require(Require&& _move) noexcept
	:m_dirname(move(_move.m_dirname))
{
}
Require::~Require() noexcept
{
}

void Require::init(Text16 root) noexcept
{
	path16.joinEx(&s_moduleRoot, { root }, true);
	if (path16.endsWithSeperator(s_moduleRoot)) s_moduleRoot.pop();
}
void Require::start() noexcept
{
	s_exports = u"exports";
	_loadPackageJson();
}
void Require::clear() noexcept
{
	s_modules.clear();
	s_exports = nullptr;
}
void Require::_loadPackageJson() noexcept
{
	AText jsmain;
	try
	{
		Must<File> file = File::open(path16.join({ s_moduleRoot, u"package.json" }));
		JsonParser parse((File*)file);
		parse.fields([&](JsonField& field) {
			field("main", &jsmain);
			});
		if (jsmain == nullptr)
		{
			jsmain = "index.js";
		}
	}
	catch (Error&)
	{
		ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
		cerr << "BDSX: failed to load package.json" << endl;
	}

	TSZ16 maindir;
	maindir << s_moduleRoot << u"/" << (Utf8ToUtf16)path.dirname(jsmain);

	AText16 dirname;
	path16.joinEx(&dirname, { maindir }, true);

	JsScope _scope;
	Require require(move(dirname));
	try
	{
		require(u"bdsx");

		TSZ16 main16;
		main16 << u"./";
		main16 << (Utf8ToUtf16)path.basename(jsmain);
		require(main16);
	}
	catch (JsException & err)
	{
		JsValue exceptionobj = err.getValue();
		g_native->fireError(exceptionobj);
	}
	JsRuntime::global().set(u"require", JsFunction::makeT(move(require)));
}

JsValue Require::operator()(Text16 modulename) const throws(JsException)
{
	AText16 filepath;
	
	TSZ16 normed = path16.join(modulename, '/');
#ifndef NDEBUG
	Array<AText16> lastPathes;
	Array<dword> lastErrors;
	lastPathes.push(normed);
#endif

	static const auto packagecut = [](Text16 normed)->pcstr16{
		pcstr16 slash = normed.find('/');
		if (slash == nullptr) return nullptr;
		if (normed.startsWith('@'))
		{
			slash = normed.subarr(slash + 1).find('/');
			if (slash == nullptr) return nullptr;
		}
		return slash;
	};
	auto getPackageRoot = [&](Text16 packagename, TText16 * jsonpath)->File* {
		Text16 dirname = m_dirname;
		for (;;)
		{
			jsonpath->clear();
			path16.joinEx(jsonpath, { dirname, u"node_modules", packagename, u"package.json" }, true);
			*jsonpath << nullterm;

			try
			{
				AText16 entry;
				File * file = File::open(jsonpath->data());
				return file;
			}
			catch (Error&)
			{
#ifndef NDEBUG
				lastPathes.push(*jsonpath);
				lastErrors.push(GetLastError());
#endif
			}
			if (dirname.size() <= s_moduleRoot.size())
			{
				throw NotFoundException();
			}
			dirname.cut_self(dirname.find_r(path16.sep));
		}
	};
	auto getEntryFromModule = [&](Text16 packagejson, File * file)->AText16 {
		AText16 entry;
		try
		{
			JsonParser parse(file);
			parse.object([&](Text key) {
				if (key == "main")
				{
					entry = (Utf8ToUtf16)parse.ttext();
				}
				else
				{
					parse.skipValue();
				}
				});
		}
		catch (...)
		{
			ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			throw JsException(TSZ16() << u"failed to load package.json: " << packagejson);
		}
		if (entry == nullptr)
		{
			entry = u"index.js";
		}
		AText16 path;
		path16.joinEx(&path, { path16.dirname(packagejson), entry }, true);
		return path;
	};

	if (!modulename.startsWith(u'.'))
	{
	_retry:
		AText16 normed_backup = normed;
		try
		{
			pcstr16 packageslash = packagecut(normed);
			TText16 packagejsonpath;
			if (packageslash == nullptr)
			{
				Must<File> packagejson = getPackageRoot(normed, &packagejsonpath);
				filepath = getEntryFromModule(packagejsonpath, packagejson);
			}
			else
			{
				delete getPackageRoot(normed.cut(packageslash), &packagejsonpath);
				path16.joinEx(&filepath, { path16.dirname(packagejsonpath), normed.subarr(packageslash + 1) }, true);
			}
			goto _done;
		}
		catch (NotFoundException&)
		{
			if (normed == u"bdsx" SEP u"native")
			{
				return g_native->getModule();
			}

#ifndef NDEBUG
			debug(); /// TOFIX: module relative path but find package.json
#endif
			// throw JsException(TSZ16() << u"module not found: " << modulename);
		}
		int a = 0;
		normed.subcopy(normed_backup);
		goto _retry;
	}
	else
	{
		path16.joinEx(&filepath, { m_dirname, normed }, true);
		if (!filepath.startsWith(s_moduleRoot))
		{
			throw JsException(TSZ16() << u"Module path denided: " << modulename);
		}

	}
_done:

	Text16 importName = filepath;
	if (importName.endsWith(SEP u".js"))
	{
		importName.cut_self(importName.end() - 3);
	}
	if (importName.endsWith(SEP u"index"))
	{
		importName.cut_self(importName.end() - 6);
	}
	else if (importName.endsWith(SEP u"."))
	{
		importName.cut_self(importName.end() - 2);
	}
	auto res = s_modules.insert(importName, JsPersistent());
	if (!res.second)
	{
		return res.first->second;
	}


	AText source;

	TSZ16 filename;
	filename << filepath << nullterm;
	try
	{
		source = File::openAsArray<char>(filename.data());
		goto _finish;
	}
	catch (Error&)
	{
#ifndef NDEBUG
		lastPathes.push(filename);
		lastErrors.push(GetLastError());
#endif
	}

	filename << u".js" << nullterm;
	try
	{
		source = File::openAsArray<char>(filename.data());
		goto _finish;
	}
	catch (Error&)
	{
#ifndef NDEBUG
		lastPathes.push(filename);
		lastErrors.push(GetLastError());
#endif
	}

	filename.cut_self(filename.end() - 3);
	filename << path16.sep << u"index.js" << nullterm;
	try
	{
		source = File::openAsArray<char>(filename.data());
		goto _finish;
	}
	catch (Error&)
	{
#ifndef NDEBUG
		lastPathes.push(filename);
		lastErrors.push(GetLastError());
#endif
	}

	if (filepath.endsWith(SEP u"node_modules" SEP u"bdsx" SEP u"native"))
	{
		JsValue native = g_native->getModule();
		res.first->second = native;
		return native;
	}

	s_modules.erase(res.first);
#ifndef NDEBUG
	debug();
#endif
	throw JsException(TSZ16() << u"module not found: " << modulename);
_finish:
	JsValue winmodule = JsNewObject;
	JsValue exports = JsNewObject;
	winmodule.set(s_exports, exports);

	Text16 moduleName = path16.basename(importName);

	JsValue require = JsFunction::makeT(Require(path16.dirname(filename)));
	{
		uintptr_t contextId = g_server == nullptr ? 0 : g_server->makeScriptId();
		JsValue func = JsRuntime::run(filename, TSZ16() << u"(function " << moduleName.filter(jsIdentifierFilter) << u"_js(module, exports, __dirname, require){" << utf8ToUtf16(source) << u"\n})", contextId);
		func(winmodule, exports, m_dirname, require);
	}
	
	exports = winmodule.get(s_exports);
	res.first->second = exports;
	return exports;
}
