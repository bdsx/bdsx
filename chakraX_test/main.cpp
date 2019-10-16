

#include <KR3/main.h>
#include <KR3/initializer.h>
#include <KR3/js/js.h>

using namespace kr;

class Test:public JsObjectT<Test>
{
public:
	Test(const JsArguments & args) noexcept
		:JsObjectT(args)
	{
		args[0];
	}

	int test() noexcept
	{
		return 12;
	}

	static Text16 getClassName() noexcept
	{
		return u"Test";
	}
	static void initMethods(JsClassT<Test>* cls) noexcept
	{
		cls->setMethod(u"test", &Test::test);
	}
};



int main()
{
	setlocale(LC_ALL, "");

	Initializer<JsRuntime> __init;
	JsContext ctx;
	ctx.enter();
	try
	{
		JsRuntime::global().set(u"test", JsFunction::makeT([](AText16 text){
			ucout << text << endl;
		}));
		JsRuntime::run(u"test(new Test().test())");
	}
	catch (JsException &err)
	{
		Text16 message = err.toString();
		ucerr << message << endl;
	}
	ctx.exit();
	return 0;
}
