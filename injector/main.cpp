

#include <KR3/main.h>
#include <KR3/wl/windows.h>
#include <KR3/initializer.h>
#include <KR3/util/path.h>
#include <KR3/fs/file.h>
#include <KR3/fs/installer.h>
#include <KR3/js/js.h>
#include <KRWin/handle.h>

#include <io.h>
#include <fcntl.h>

using namespace kr;

Text16 readArgument(Text16 & line) noexcept
{
	if (line.empty()) return u"";
	if (*line == '"')
	{
		line++;
		Text16 out = line.readwith_e('"');
		line.skipspace();
		return out;
	}
	else
	{
		Text16 out = line.readwith_e(' ');
		line.skipspace();
		return out;
	}
}

#pragma warning(disable:4996)
int main()
{
	Text16 commandLine = (Text16)unwide(GetCommandLineW());
	Text16 injectorPath = readArgument(commandLine);
	Text16 exePath = readArgument(commandLine);
	Text16 dllPath = readArgument(commandLine);
	if (exePath.empty() || dllPath.empty())
	{
		cerr << "injector.exe> it needs exe and dll path" << endl;
		return EINVAL;
	}

	setlocale(LC_ALL, nullptr);

	win::Module* module = win::Module::getModule(nullptr);

	SetDllDirectoryW(wide(TSZ16() << path16.dirname(dllPath)));

	auto [proc, thread] = win::Process::execute(TSZ16() << exePath, TSZ16() << path16.dirname(exePath),
		win::ProcessOptions()
		.console(true)
		.suspended(true));
	if (!proc)
	{
		ucerr << u"injector.exe> Failed to run: " << exePath << endl;
		return ENOENT;
	}

	//Installer::copy(
	//	(TSZ16() << path16.dirname((Text16)path) << u"\\ChakraCore.Debugger.dll").c_str(),
	//	u"ChakraCore.Debugger.dll",
	//	u"ChakraCore.Debugger.dll copied");
	win::Module * injected = proc->injectDll(TSZ16() << path16.basename(dllPath));
	if (!injected)
	{
		ucerr << u"injector.exe> Failed to inject: " << dllPath << endl;
		proc->terminate();
		thread->detach();
		return EFAULT;
	}

	thread->resume();
	thread->detach();
	delete proc;
	return 0;
}
