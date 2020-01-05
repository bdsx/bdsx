
#include <KR3/main.h>
#include <KR3/wl/windows.h>
#include <KR3/initializer.h>
#include <KR3/util/path.h>
#include <KR3/util/parameter.h>
#include <KR3/fs/file.h>
#include <KR3/fs/installer.h>
#include <KRWin/handle.h>

using namespace kr;

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
	Text16 dllPath = readArgument(commandLine);
	if (commandLine.empty() || dllPath.empty())
	{
		cerr << "injector.exe> It needs exe and dll path" << endl;
#ifndef NDEBUG
		MessageBoxW(nullptr, L"It needs exe and dll path", nullptr, MB_OK | MB_ICONERROR);
#endif
		return EINVAL;
	}
	setlocale(LC_ALL, nullptr);
	win::Module* winmodule = win::Module::getModule(nullptr);

	SetDllDirectoryW(wide(path16.resolve(path16.dirname(dllPath))));

	auto [proc, thread] = win::Process::execute((pstr16)commandLine.data(), TSZ16() << currentDirectory,
		win::ProcessOptions()
		.suspended(true)
		.console(true));
	if (!proc)
	{
		ErrorCode last = ErrorCode::getLast();
#ifndef NDEBUG
		MessageBoxW(nullptr, wide(TSZ16() << u"Failed to run: " << commandLine), nullptr, MB_OK | MB_ICONERROR);
#endif
		ucerr << u"injector.exe> Failed to run: " << commandLine << endl;
		ucerr << last.getMessage<char16>() << endl;
		return ENOENT;
	}

	win::Module * injected = proc->injectDll(TSZ16() << path16.basename(dllPath));
	if (!injected)
	{
		ErrorCode last = ErrorCode::getLast();
#ifndef NDEBUG
		MessageBoxW(nullptr, wide(TSZ16() << u"Failed to inject: " << dllPath), nullptr, MB_OK | MB_ICONERROR);
#endif
		ucerr << u"injector.exe> Failed to inject: " << dllPath << endl;
		ucerr << last.getMessage<char16>() << endl;
		proc->terminate();
		thread->detach();
		return EFAULT;
	}
	thread->resume();
	thread->detach();
	delete proc;
	return 0;
}
