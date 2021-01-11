

// View<McftRenamer::Entry> McftRenamer::getEntires() noexcept
// {
// #define ENTRY(x) {#x, (void* (MinecraftFunctionTable::*))&MinecraftFunctionTable::x, 0}
// #define ENTRY_IDX(x, n) {#x, (void* (MinecraftFunctionTable::*))&MinecraftFunctionTable::x, n}
// 	static const Entry entries[] = {
// 		ENTRY(NetworkHandler$getEncryptedPeerForUser),
// 		ENTRY(ScriptEngine$isScriptingEnabled),
// 		ENTRY(std$string$_Tidy_deallocate),
// 		ENTRY(std$string$assign),
// 		ENTRY_IDX(std$string$append, 1),
// 		ENTRY(std$string$resize),
// 		ENTRY(DedicatedServer$stop),
// 		ENTRY(StopCommand$mServer),
// 		ENTRY(NetworkHandler$send),
// 		ENTRY(NetworkIdentifier$getHash),
// 		ENTRY(Actor$dtor$Actor),
// 		ENTRY(Level$fetchEntity),
// 		ENTRY(LoopbackPacketSender$sendToClients),
// 		ENTRY(Level$removeEntityReferences),
// 		ENTRY(CommandOutputSender$send),
// 	};
// #undef ENTRY

// 	return entries;
// }
// View<Text> McftRenamer::getReplaceMap() noexcept
// {
// 	static const Text list[] = {
// 		"basic_string<char,std::char_traits<char>,std::allocator<char> >"_tx, "string"_tx,
// 		"::"_tx, "$"_tx,
// 		"<0>"_tx, "$_0_"_tx,
// 		"`vftable'"_tx, "$_vftable_"_tx,
// 		""_tx, "$_stdin_t_"_tx,
// 		"~"_tx, "dtor$"_tx,
// 	};
// 	return list;
// }
	

// redirect x button close

// 				SetConsoleCtrlHandler([](DWORD CtrlType)->BOOL {
// 					switch (CtrlType)
// 					{
// 					case CTRL_CLOSE_EVENT:
// 					case CTRL_LOGOFF_EVENT:
// 					case CTRL_SHUTDOWN_EVENT:
// 						g_mainPump->post([] {
// 			g_mcf.stopServer();
// 							});
// 						ThreadHandle::getCurrent()->terminate();
// 						return true;
// 					}