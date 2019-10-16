

#include <KR3/main.h>
#include <KR3/wl/windows.h>
#include <KR3/initializer.h>
#include <KR3/util/path.h>
#include <KR3/fs/file.h>
#include <KR3/fs/installer.h>
#include <KR3/js/js.h>
#include <KRWin/handle.h>

using namespace kr;

Text16 readArgument(Text16 & line) noexcept
{
	if (line.empty()) return u"";

	Text16 start = line;
	if (line.read() == '"')
	{
		line.readto('"');
		Text16 out = (start+1).cut(line);
		line++;
		line.skipspace();
		return out;
	}
	else
	{
		line.readto(' ');
		if (line == nullptr) return u"";
		Text16 out = start.cut(line);
		line++;
		line.skipspace();
		return out;
	}
}

int WINAPI wWinMain(HINSTANCE, HINSTANCE, LPWSTR commandLineSz, int)
{
	Text16 commandLine = (Text16)unwide(commandLineSz);
	Text16 exePath = readArgument(commandLine);
	Text16 dllPath = readArgument(commandLine);
	if (exePath.empty() || dllPath.empty())
	{
		errorBox(u"it needs exe and dll path");
		return EINVAL;
	}

	win::Module* module = win::Module::getModule(nullptr);

	auto [proc, thread] = win::Process::execute(TSZ16() << exePath, nullptr,
		win::ProcessOptions()
		.console(true)
		.suspended(true));

	Text16 dllBaseName = path16.basename(dllPath);
	Installer::copy(
		(TSZ16() << path16.dirname(exePath) << dllBaseName).c_str(),
		TSZ16() << dllPath, 
		u"");
	//Installer::copy(
	//	(TSZ16() << path16.dirname((Text16)path) << u"\\ChakraCore.Debugger.dll").c_str(),
	//	u"ChakraCore.Debugger.dll",
	//	u"ChakraCore.Debugger.dll copied");
	proc->injectDll(TSZ16() << dllBaseName);

	thread->resume();
	thread->detach();
	delete proc;
	return 0;
}
