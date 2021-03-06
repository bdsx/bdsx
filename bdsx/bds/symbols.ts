import { SYMOPT_UNDNAME } from "bdsx/common";
import { pdb } from "bdsx/core";

const symbols = [
    'mainCRTStartup',
    'main',
    'ScriptEngine::~ScriptEngine',
    'ScriptEngine::startScriptLoading',
    'MinecraftServerScriptEngine::onServerThreadStarted',
    'std::_Pad::_Release',
    'std::_LaunchPad<std::unique_ptr<std::tuple<<lambda_85c8d3d148027f864c62d97cac0c7e52> >,std::default_delete<std::tuple<<lambda_85c8d3d148027f864c62d97cac0c7e52> > > > >::_Go',
    'std::_LaunchPad<std::unique_ptr<std::tuple<<lambda_cab8a9f6b80f4de6ca3785c051efa45e> >,std::default_delete<std::tuple<<lambda_cab8a9f6b80f4de6ca3785c051efa45e> > > > >::_Execute<0>',
    '<lambda_85c8d3d148027f864c62d97cac0c7e52>::operator()',
    'ScriptEngine::initialize',
    'Level::createDimension',
    'Level::fetchEntity',
    'Crypto::Random::generateUUID',
    'ServerNetworkHandler::_getServerPlayer',
    'ServerPlayer::sendNetworkPacket',
    'RakNet::SystemAddress::ToString',
    'std::_Allocate<16,std::_Default_allocate_traits,0>',
    'MinecraftCommands::executeCommand',
    "ServerPlayer::`vftable'",
    'Actor::getUniqueID',
    'BaseAttributeMap::getMutableInstance',
    'ExtendedCertificate::getXuid',
    'ExtendedCertificate::getIdentityName',
    'ExtendedCertificate::getTitleID',
    'ExtendedCertificate::getIdentity',
    'MinecraftPackets::createPacket',
    'NetworkHandler::onConnectionClosed#1',
    'BedrockLogOut',
    'google_breakpad::ExceptionHandler::HandleException',
    'google_breakpad::ExceptionHandler::HandleInvalidParameter',
    'DedicatedServer::stop',
    'NetworkIdentifier::operator==',
    'CommandOutputSender::send',
    'ServerInstance::startServerThread',
    'NetworkHandler::_getConnectionFromId',
    'NetworkHandler::send',
    'LoopbackPacketSender::sendToClients',
    'NetworkHandler::_sortAndPacketizeEvents',
    'NetworkHandler::_sendInternal',
    'PacketViolationHandler::_handleViolation',
    'Level::removeEntityReferences',
    'Actor::~Actor',
    'ScriptEngine::_processSystemInitialize',
    'NetworkIdentifier::getHash',
    'BatchedNetworkPeer::sendPacket',
    'Json::Value::isMember',
    'Json::Value::~Value',
    'Json::Value::getMemberNames',
    'Json::Value::size',
    'MinecraftServerScriptEngine::onServerUpdateEnd',
    'printf',
    'ServerNetworkHandler::_onPlayerLeft',
    "ServerCommandOrigin::`vftable'",
    "Minecraft::getLevel",
] as const;

// decorated symbols
const symbols2 = [
    '??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ', 
    '?_Tidy_deallocate@?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAAXXZ',
    '??_7ServerInstance@@6BAppPlatformListener@@@',
    '??_7NetworkHandler@@6BIGameConnectionInfoProvider@Social@@@',
    '??_7RakNetInstance@@6BConnector@@@',
    '??_7RakPeer@RakNet@@6BRakPeerInterface@1@@',
    '??AValue@Json@@QEAAAEAV01@H@Z',
    '??AValue@Json@@QEAAAEAV01@PEBD@Z',
    '?log@ItemTransactionLogger@@YAXV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z',
    '?sItemTransactionLoggerEnabled@?A0x5e9fdcc2@@3_NA',
    '??$getline@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@YAAEAV?$basic_istream@DU?$char_traits@D@std@@@0@$$QEAV10@AEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@0@D@Z',
    '??_7MinecraftServerScriptEngine@@6BScriptFramework@ScriptApi@@@',
    '??_7MinecraftServerScriptEngine@@6B@',
    '?computeHash@HashedString@@SA_KAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z',
    'sprintf',
    '??$make_shared@VCommandContext@@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$unique_ptr@VServerCommandOrigin@@U?$default_delete@VServerCommandOrigin@@@std@@@3@AEBH@std@@YA?AV?$shared_ptr@VCommandContext@@@0@$$QEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@0@$$QEAV?$unique_ptr@VServerCommandOrigin@@U?$default_delete@VServerCommandOrigin@@@std@@@0@AEBH@Z',
    '??$make_unique@VServerCommandOrigin@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAVServerLevel@@$0A@@std@@YA?AV?$unique_ptr@VServerCommandOrigin@@U?$default_delete@VServerCommandOrigin@@@std@@@0@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@0@AEAVServerLevel@@@Z',
] as const;


pdb.setOptions(SYMOPT_UNDNAME);
export const proc = pdb.getList(pdb.coreCachePath, {}, symbols);
/** @deprecated use typeof proc */
export type proc = typeof proc;
pdb.setOptions(0);

export const proc2 = pdb.getList(pdb.coreCachePath, {}, symbols2);
/** @deprecated use typeof proc2 */
export type proc2 = typeof proc2;

pdb.close();
