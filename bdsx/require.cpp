#include "require.h"

#include <KR3/fs/file.h>
#include <KR3/util/path.h>
#include <KR3/parser/jsonparser.h>
#include <KR3/wl/windows.h>

#include "console.h"
#include "native.h"
#include "funchook.h"

using namespace kr;

namespace
{
	Map<Text16, JsPersistent> s_modules;
	AText16 s_moduleRoot;
	AText s_jsmain;
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

	try
	{
		Must<File> file = File::open(path16.join({ s_moduleRoot, u"package.json" }));
		JsonParser parse((File*)file);
		parse.fields([&](JsonField& field) {
			field("main", &s_jsmain);
			});
	}
	catch (Error&)
	{
		ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
		cerr << "BDSX: failed to load package.json" << endl;
	}
}
void Require::start() noexcept
{
	if (s_jsmain != nullptr)
	{
		TSZ16 maindir;
		maindir << s_moduleRoot << u"/" << (Utf8ToUtf16)path.dirname(s_jsmain);

		AText16 dirname;
		path16.joinEx(&dirname, { maindir }, true);

		JsScope _scope;
		Require require(move(dirname));
		try
		{
			require(u"bdsx");

			TSZ16 main16;
			main16 << u"./";
			main16 << (Utf8ToUtf16)path.basename(s_jsmain);
			s_jsmain = nullptr;
			require(main16);
		}
		catch (JsException & err)
		{
			ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			ucerr << err.getValue().getProperty(u"stack").toString().as<Text16>() << endl;
		}
	}
}
void Require::clear() noexcept
{
	s_modules.clear();
}

JsValue Require::operator()(Text16 modulename) const throws(JsException)
{
	static AText16(* const findMain)(Text16, Text16) = [](Text16 jsonpath, Text16 modulename)->AText16 {
		AText16 entry;
		Must<File> file = File::open(jsonpath.data());
		try
		{
			JsonParser parse((File*)file);
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
			throw JsException(TSZ16() << u"failed to load package.json: " << modulename);
		}
		if (entry == nullptr)
		{
			ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			throw JsException(TSZ16() << u"main not found from package.json: " << modulename);
		}
		AText16 newfilepath;
		path16.joinEx(&newfilepath, { path16.dirname(jsonpath), entry }, true);
		return newfilepath;
	};

	AText16 filepath;

	TSZ16 normed = path16.join(modulename, '/');
	if (normed.startsWith(u"..") || path16.getProtocolInfo(normed).isAbsolute)
	{
		throw JsException(TSZ16() << u"Module path denided: " << modulename);
	}

	if (!modulename.startsWith(u'.'))
	{
		Text16 dirname = m_dirname;
		for (;;)
		{
			try
			{
				filepath = findMain(path16.join({ dirname, u"node_modules", normed, u"package.json" }) << nullterm, modulename);
				break;
			}
			catch (Error&)
			{
			}
			if (dirname.size() <= s_moduleRoot.size())
			{
				if (normed == u"bdsx" SEP u"native")
				{
					return NativeModule::instance->getModule();
				}

				throw JsException(TSZ16() << u"module not found: " << modulename);
			}
			dirname.cut_self(dirname.find_r(path16.sep));
		}
	}
	else
	{
		path16.joinEx(&filepath, { m_dirname, normed }, true);
	}

	Text16 importName = filepath;
	if (importName.endsWith(SEP u"index"))
	{
		importName.cut_self(importName.end() - 6);
	}
	auto res = s_modules.insert(importName, JsPersistent());
	if (!res.second)
	{
		return res.first->second;
	}


	TSZ16 filename;
	AText source;
	try
	{
		filename << filepath << nullterm;
		source = File::openAsArray<char>(filename.data());
		goto _finish;
	}
	catch (Error&)
	{
	}

	try
	{
		filename << u".js" << nullterm;
		source = File::openAsArray<char>(filename.data());
		goto _finish;
	}
	catch (Error&)
	{
	}

	try
	{
		filename.cut(filename.end() - 3);
		filename << path16.sep << u"index.js" << nullterm;
		source = File::openAsArray<char>(filename.data());
		goto _finish;
	}
	catch (Error&)
	{
	}

	if (filepath.endsWith(SEP u"node_modules" SEP u"bdsx" SEP u"native"))
	{
		JsValue native = NativeModule::instance->getModule();
		res.first->second = native;
		return native;
	}

	s_modules.erase(res.first);
	throw JsException(TSZ16() << u"module not found: " << modulename);
_finish:
	JsValue exports = JsNewObject;
	AText16 newdirname;
	path16.joinEx(&newdirname, { path16.dirname(filename) }, true);
	reline_new((void**)newdirname.data() - 1);

	Text16 moduleName = path16.basename(importName);

	JsValue require = JsFunction::makeT(Require(move(newdirname)));
	{
		JsValue func = JsRuntime::run(filename, TSZ16() << u"(function " << moduleName.filter(jsIdentifierFilter) << u"(exports, __dirname, require){" << utf8ToUtf16(source) << u"\n})", g_hookf->makeScriptId());
		func.call(undefined, { exports, m_dirname, require });
	}

	res.first->second = exports;
	return exports;
}
