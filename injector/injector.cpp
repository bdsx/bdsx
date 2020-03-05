
#include <KR3/main.h>
#include <KR3/win/windows.h>
#include <KR3/initializer.h>
#include <KR3/util/path.h>
#include <KR3/util/parameter.h>
#include <KR3/fs/file.h>
#include <KR3/fs/installer.h>
#include <KRWin/handle.h>

using namespace kr;

int main()
{
	Text16 commandLine = (Text16)unwide(GetCommandLineW());

	TText16 injectorPath = readArgument(&commandLine);
	AText16 dllPath;
	bool resurrection = false;
	bool noWindow = false;
	
	for (;;)
	{
		TText16 param = readArgument(&commandLine);
		if (param.empty())
		{
			cerr << "injector.exe> It needs exe and dll path" << endl;
#ifndef NDEBUG
			dout << "injector.exe> It needs exe and dll path" << endl;
			dout.flush();
#endif
			return EINVAL;
		}
		if (!param.startsWith_y(u"-/"))
		{
			dllPath = param;
			break;
		}

		if (param.subarr(1) == u"q")
		{
			noWindow = true;
		}
		else if (param.subarr(1) == u"r")
		{
			resurrection = true;
		}
		else
		{
			ucerr << u"unknown flags: " << param << endl;
		}
	}

	if (commandLine.empty() || dllPath.empty())
	{
		cerr << "injector.exe> It needs exe and dll path" << endl;
#ifndef NDEBUG
		dout << "injector.exe> It needs exe and dll path" << endl;
		dout.flush();
#endif
		return EINVAL;
	}
	setlocale(LC_ALL, nullptr);
	SetDllDirectoryW(wide(path16.resolve(path16.dirname(dllPath))));

	for (;;)
	{
		auto [proc, thread] = win::Process::execute((pstr16)commandLine.data(), TSZ16() << currentDirectory,
			win::ProcessOptions()
			.suspended(true)
			.console(!noWindow)
			.noWindow(noWindow));
		if (!proc)
		{
			ErrorCode last = ErrorCode::getLast();
			TSZ16 errmsg = last.getMessage<char16>();
#ifndef NDEBUG
			udout << u"injector.exe> Failed to run: " << commandLine << endl;
			udout << errmsg << endl;
			udout.flush();
#endif
			ucerr << u"injector.exe> Failed to run: " << commandLine << endl;
			ucerr << errmsg << endl;
			return ENOENT;
		}

		win::Module* injected = proc->injectDll(TSZ16() << path16.basename(dllPath));
		if (!injected)
		{
			ErrorCode last = proc->getLastError();
			TSZ16 errmsg = last.getMessage<char16>();
#ifndef NDEBUG
			udout << u"injector.exe> Failed to inject: " << dllPath << endl;
			udout << errmsg << endl;
			udout.flush();
#endif
			ucerr << u"injector.exe> Failed to inject: " << dllPath << endl;
			ucerr << errmsg << endl;
			proc->terminate();
			thread->detach();
			return EFAULT;
		}
		thread->resume();
		thread->detach();
		if (!resurrection)
		{
			delete proc;
			break;
		}
		proc->wait();
		delete proc;

	}
	return 0;
}
