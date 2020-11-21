#pragma once

typedef void* JsRuntimeHandle;
typedef void* JsRef;
typedef JsRef JsContextRef;

namespace nodegate
{
	struct StringView
	{
		const char16_t* string;
		size_t length;

#ifdef __KR3_INCLUDED
		inline StringView(kr::Text16 text) noexcept {
			string = text.data();
			length = text.size();
		}
#endif
	};
	class JsCall
	{
	public:
		virtual void callMain() noexcept = 0;
		virtual void require(StringView a) noexcept = 0;
		virtual void log(StringView a) noexcept = 0;
		virtual void error(StringView a) noexcept = 0;
	};
	class NodeGateConfig
	{
	public:
		int argc;
		char** argv;

		virtual void main_call(JsCall* jscall) noexcept = 0;
		virtual void stderr_call(const char * str, size_t len) noexcept = 0;
		virtual void stdout_call(const char* str, size_t len) noexcept = 0;
	};

	void initNativeModule(void* jsvalue);
	int start(NodeGateConfig* arg) noexcept;

#ifdef NODEGATE_EXPORT
#define NODEGATE_EXPORT_ __declspec(dllexport) __stdcall
#else
#define NODEGATE_EXPORT_ __declspec(dllimport) __stdcall
#endif
	void NODEGATE_EXPORT_ setMainCallback(NodeGateConfig* _config) noexcept;
	void NODEGATE_EXPORT_ nodeProcessTimer() noexcept;
	bool NODEGATE_EXPORT_ isAlive() noexcept;


}
extern nodegate::JsCall* g_call;
