#pragma once

#include <KR3/main.h>
#include <KR3/http/httpd.h>
#include <KR3/js/js.h>
#include <KR3/data/strstore.h>

class WebServer;

class Request :public kr::JsObjectT<Request>
{
	friend WebServer;
public:
	static constexpr const char16_t className[] = u"Request";
	static constexpr bool global = false;

	Request(const kr::JsArguments& args) noexcept;
	~Request() noexcept;
	void header(kr::Text16 name, kr::Text16 value) noexcept;
	void send(kr::Text16 text) noexcept;
	void sendFile(kr::Text16 filename) noexcept;
	void end() noexcept;

	static void initMethods(kr::JsClassT<Request>* cls) noexcept;

private:
	kr::Keep<kr::HttpClient> m_client;
	kr::AText m_statusLine;
	kr::HeaderStore m_header;
};


class WebServer:public kr::JsObjectT<WebServer>
{
public:
	static constexpr const char16_t className[] = u"WebServer";
	static constexpr bool global = false;

	WebServer(const kr::JsArguments& args) noexcept;

	void page(kr::Text16 path, kr::JsValue cb) noexcept;
	void close() noexcept;

	static void initMethods(kr::JsClassT<WebServer>* cls) noexcept;

private:
	kr::HttpServer* m_server;
};