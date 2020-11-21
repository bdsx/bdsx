#include "nodegate.h"
#include <KR3/main.h>

#define BUILDING_NODE_EXTENSION

#pragma comment(lib, "bdsx_node.lib")

#pragma warning(push, 0)
#include "node.h"
#pragma warning(pop)

nodegate::JsCall* g_call;

int nodegate::start(NodeGateConfig* ngc) noexcept
{
    setMainCallback(ngc);
    return node::Start(ngc->argc, ngc->argv);
}

namespace
{
    struct NativeModule
    {
        static void init(v8::Local<v8::Object> exports)
        {
            v8::Object* obj = *exports;
            nodegate::initNativeModule(obj);
        }
    };
}

NODE_MODULE(bdsx_native, NativeModule::init);
