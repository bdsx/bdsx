import { SYMOPT_UNDNAME } from "bdsx/common";
import { pdb } from "bdsx/core";

const symbols = [
    'ScriptEngine::~ScriptEngine',
    'ScriptEngine::startScriptLoading',
    'MinecraftServerScriptEngine::onServerThreadStarted',
    'std::thread::_Invoke<std::tuple<<lambda_8914ed82e3ef519cb2a85824fbe333d8> >,0>',
    'ConsoleInputReader::getLine',
    '<lambda_8914ed82e3ef519cb2a85824fbe333d8>::operator()',
    'ScriptEngine::initialize',
    'Level::createDimension',
    'Level::fetchEntity',
    'Crypto::Random::generateUUID',
    'Player::getSupplies',
    'Player::setName',
    'Player::teleportTo',
    'ServerNetworkHandler::_getServerPlayer',
    'ServerNetworkHandler::allowIncomingConnections',
    'ServerNetworkHandler::disconnectClient',
    'ServerPlayer::changeDimension',
    'ServerPlayer::openInventory',
    'ServerPlayer::sendInventory',
    'ServerPlayer::sendNetworkPacket',
    'std::_Allocate<16,std::_Default_allocate_traits,0>',
    'MinecraftCommands::executeCommand',
    "ServerPlayer::`vftable'",
    'Actor::addTag',
    'Actor::getNameTag',
    'Actor::getPos',
    'Actor::getUniqueID',
    'Actor::hasTag',
    'ExtendedCertificate::getXuid',
    'ExtendedCertificate::getIdentityName',
    'ExtendedCertificate::getIdentity',
    'MinecraftPackets::createPacket',
    'NetworkHandler::onConnectionClosed#1',
    'BedrockLogOut',
    'DedicatedServer::stop',
    'NetworkIdentifier::operator==',
    'CommandOutputSender::send',
    'ServerInstance::ServerInstance',
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
    "ServerCommandOrigin::`vftable'",
    'Minecraft::getLevel',
    'std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Tidy_deallocate',
    "std::_Ref_count_obj2<CommandContext>::`vftable'",
    'CommandContext::CommandContext',
    'CommandVersion::CurrentVersion',
    'ServerCommandOrigin::ServerCommandOrigin',
    'ScriptApi::ScriptFramework::registerConsole',
    'ConsoleInputReader::ConsoleInputReader',
    'ConsoleInputReader::~ConsoleInputReader',
    'ConsoleInputReader::unblockReading',
    'Item::allowOffhand',
    'Item::getCommandName',
    'Item::isDamageable',
    'Item::isFood',
    'Item::setAllowOffhand',
    'ItemStackBase::getId',
    'ItemStackBase::getItem',
    'ItemStackBase::hasCustomHoverName',
    'ItemStackBase::isBlock',
    // 'ItemStackBase::isEmptyStack', // not found in 1.16.210.05
    'ItemStackBase::setCustomName',
    'PlayerInventory::getItem',
    'CommandRegistry::registerCommand',
    'CommandRegistry::findCommand',
    'CommandRegistry::registerOverloadInternal',
] as const;

// decorated symbols
const symbols2 = [
    '?ToString@SystemAddress@RakNet@@QEBAX_NPEADD@Z',
    '??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ',
    '??_7ServerInstance@@6BEnableNonOwnerReferences@Bedrock@@@',
    '??_7NetworkHandler@@6BIGameConnectionInfoProvider@Social@@@',
    '??_7RakNetInstance@@6BConnector@@@',
    '??_7RakPeer@RakNet@@6BRakPeerInterface@1@@',
    '??AValue@Json@@QEAAAEAV01@H@Z',
    '??AValue@Json@@QEAAAEAV01@PEBD@Z',
    '??$getline@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@YAAEAV?$basic_istream@DU?$char_traits@D@std@@@0@$$QEAV10@AEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@0@D@Z',
    '??_7MinecraftServerScriptEngine@@6BScriptFramework@ScriptApi@@@',
    '??_7MinecraftServerScriptEngine@@6B@',
    '?computeHash@HashedString@@SA_KAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z',
    '?getMutableInstance@BaseAttributeMap@@QEAAPEAVAttributeInstance@@I@Z',
    'sprintf',
    'vsnprintf',
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
