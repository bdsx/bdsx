#include <KR3/main.h>
#include <KR3/initializer.h>
#include <KR3/http/fetch.h>
#include <KR3/msg/pump.h>
#include <KR3/parser/jsonparser.h>
#include <KR3/util/compress.h>
#include <KR3/fs/file.h>
#include <KR3/util/process.h>
#include <KR3/io/selfbufferedstream.h>

using namespace kr;

AText currentTagName;
AText latestTagName;
EventPump * g_pump = EventPump::getInstance();

int wmain(int argn, wchar_t** argv)
{
	try
	{
		currentTagName = File::openAsArrayT<char>(u"VERSION");
	}
	catch (Error&)
	{
		currentTagName = "UNKNOWN";
	}
	cout << "Current Version: " << currentTagName << endl;

	fetchAsTextFromWeb("https://api.github.com/repos/karikera/bdsx/releases/latest")->then([&](Text content) {
		AText browserDownloadUrl;
		try
		{
			JsonParser parser(&content);
			parser.fields([&](JsonField& field) {
				field("tag_name", &latestTagName);
				field("assets", [&](JsonArray& array){
					if (array.getIndex() != 0) return;
					array([&](JsonField& field) {
						field("browser_download_url", &browserDownloadUrl);
						});
					});
				});
			cout << "New Version: " << latestTagName << endl;
		}
		catch (InvalidSourceException&)
		{
			cerr << "the received data is not json" << endl;
			cerr << content << endl;
			throw ThrowAbort();
		}
		if (browserDownloadUrl == nullptr)
		{
			cerr << "browser_download_url not found" << endl;
			throw ThrowAbort();
		}
		if (latestTagName == nullptr)
		{
			cerr << "latestTagName not found" << endl;
			throw ThrowAbort();
		}
		if (latestTagName == currentTagName)
		{
			cout << "LATEST" << endl;
			throw ThrowAbort();
		}
		else
		{
			cout << "Downloading..." << endl;
			return fetchAsFile(browserDownloadUrl, u"bdsx.zip");
		}
		})->then([]() {
			cout << "Extracting..." << endl;

			Unzipper unzipper(L"bdsx.zip");
			unzipper.filter = [](Unzipper* unzipper, Text filename, Text16 destpath)->pcstr16{
				Text read = filename;

				Text firstdir = read.readwith('\\');
				if (firstdir == nullptr)
				{
					cout << "unzip " << filename << endl;
				}
				else
				{
					if (firstdir == "bdsx")
					{
						if (read == "package.json")
						{
							return u"../bdsx/new_package.json";
						}
						return nullptr;
					}

					if (firstdir == "worlds") return nullptr; // just in case, preventing world overlaping

					Text seconddir = read.readwith_e('\\');
					if (firstdir == "server")
					{
						if (seconddir == "permissions.json") return nullptr;
						if (seconddir == "server.properties") return nullptr;
						if (seconddir == "whitelist.json") return nullptr;

						if (seconddir == "behavior_packs" || seconddir == "resource_packs")
						{
							if (read.find('\\') == nullptr)
							{
								if (File::exists(destpath.data()))
								{
									cout << "remove " << filename << endl;
									File::removeFull(destpath.data());
								}
								cout << "unzip " << filename << endl;
								return destpath.data();
							}

						}
					}
					if (read.empty())
					{
						cout << "unzip " << filename << endl;
					}
				}
				return destpath.data();
			};


			File::removeFull(u"..\\server\\structures");
			File::removeFull(u"..\\server\\definitions");
			unzipper.extractTo(u"..");
			File::remove(u"bdsx.zip");
			
			currentDirectory.set(u"../bdsx");

			AText version;
			{
				io::FIStream<char> fis = File::open(u"new_package.json");
				JsonParser json(&fis);
				json.fields([&](JsonField& field) {
					field("dependencies", [&](JsonField& field){
						field("bdsx", &version);
						});
					});
			}
			File::remove(u"new_package.json");
			
			{
				TSZ npm_install;
				npm_install << "npm i bdsx@" << (version.startsWith('^') ? (Text)version.subarr(1) : (Text)version);
				cout << npm_install << endl;
				shellPiped(TSZ16() << (Utf8ToUtf16)npm_install);
			}
			File::saveFromArray<char>(u"VERSION", latestTagName);

			g_pump->quit(0);
		})->katch([](exception_ptr&){
			g_pump->quit(0);
			});

	return g_pump->messageLoop();
}

