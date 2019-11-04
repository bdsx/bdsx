

#include <KR3/main.h>
#include <KR3/wl/windows.h>
#include <KR3/initializer.h>
#include <KR3/util/path.h>
#include <KR3/fs/file.h>
#include <KR3/fs/installer.h>
#include <KR3/js/js.h>
#include <KRWin/handle.h>

#include <KRHttp/httpd.h>
#include <KR3/msg/promise.h>
#include <KR3/fs/watcher.h>

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

int main()
{
	//Initializer<Socket> __init;
	//
	//HttpServer server(u"html");
	//server.open(80);
	//server.attachPage("/upload-test", Page::make([](HttpClient* client) {
	//	MultipartFormData& data =  client->getMultipartFormData();

	//	client->writeHeader({"Content-Type: text/html\r\n"});
	//	client->write(data.get("v"));
	//	client->flush();
	//	client->close();
	//}));

	//for(;;) Sleep(1000);

	//return 0;

	Text16 commandLine = (Text16)unwide(GetCommandLineW());
	Text16 injectorPath = readArgument(commandLine);
	Text16 exePath = readArgument(commandLine);
	Text16 dllPath = readArgument(commandLine);
	if (exePath.empty() || dllPath.empty())
	{
		cerr << "injector.exe> It needs exe and dll path" << endl;
		return EINVAL;
	}

	setlocale(LC_ALL, nullptr);

	win::Module* module = win::Module::getModule(nullptr);

	SetDllDirectoryW(wide(TSZ16() << path16.dirname(dllPath)));

	auto [proc, thread] = win::Process::execute(TSZ16() << exePath, TSZ16() << commandLine, TSZ16() << path16.dirname(exePath),
		win::ProcessOptions()
		.suspended(true)
		.console(true));
	if (!proc)
	{
		ucerr << u"injector.exe> Failed to run: " << exePath << endl;
		return ENOENT;
	}

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
