#include "webserver.h"
#include <KR3/fs/file.h>
#include "native.h"
#include "nativefile.h"
#include "nodegate.h"

using namespace kr;

Request::Request(const JsArguments& args) noexcept
	:JsObjectT(args)
{
}
Request::~Request() noexcept
{
	if (m_client)
	{
		m_client->lock().closeClient();
	}
}
void Request::header(Text16 name, Text16 value) noexcept
{
	m_header.set(TSZ() << toUtf8(name), TSZ() << toUtf8(value));
}
void Request::send(Text16 text) noexcept
{
	if (m_client == nullptr) return;
	HttpClient::Lock lock = m_client->lock();
	lock.writeHeader();
	lock.write(TSZ() << toUtf8(text));
}
void Request::sendFile(Text16 filename) noexcept
{
	if (m_client == nullptr) return;
	File* file = File::open(filename.data());

	constexpr size_t BUFFER_SIZE = 8192;
	TText buffer;
	buffer.resize(BUFFER_SIZE);
	char * bufferptr = buffer.data();
	try
	{
		for (;;)
		{
			size_t size = file->read(bufferptr, BUFFER_SIZE);

			m_client->lock().write(Text(bufferptr, size));
		}
	}
	catch (EofException&)
	{
	}
	m_client->sendFile(AText() << toUtf8(filename), file);
	m_client = nullptr;
}
void Request::end() noexcept
{
	if (m_client == nullptr) return;
	HttpClient::Lock lock = m_client->lock();
	lock.writeHeader();
	lock.flush();
	lock.closeClient();
	m_client = nullptr;
}

void Request::initMethods(JsClassT<Request>* cls) noexcept
{
	cls->setMethod(u"send", &Request::send);
	cls->setMethod(u"sendFile", &Request::sendFile);
	cls->setMethod(u"end", &Request::end);
}

WebServer::WebServer(const JsArguments& args) noexcept
	:JsObjectT(args)
{
	int port = args.at<int>(1);

	HttpServer::init(1);
	m_server = _new HttpServer((args.at<Text16>(0)));
	m_server->open(port == 0 ? 80 : port);
}

void WebServer::page(Text16 path, JsValue cb) noexcept
{
	if (m_server == nullptr) return;

	EventPump* pump = EventPump::getInstance();
	m_server->onPage(TSZ() << toUtf8(path), [cbp = (JsPersistent)cb, pump](HttpClient* client){
		pump->post([&cbp, client = Keep<HttpClient>(client)]() mutable{

			JsScope _scope;
			try
			{
				Request* req = Request::newInstance();
				req->m_client = move(client);
				JsValue cb = cbp;
				cb.call(req);
			}
			catch (JsException& err)
			{
				g_native->fireError(err.getValue());
			}
			g_call->tickCallback();
			});
		});
}
void WebServer::close() noexcept
{
	delete m_server;
	m_server = nullptr;
}

void WebServer::initMethods(JsClassT<WebServer>* cls) noexcept
{
	cls->setMethod(u"page", &WebServer::page);
}
