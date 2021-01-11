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
    'Crypto::Random::generateUUID',
    'ServerNetworkHandler::_getServerPlayer',
    'ServerPlayer::sendNetworkPacket',
    'RakNet::SystemAddress::ToString',
    'std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Tidy_deallocate',
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
    'NetworkHandler::onConnectionClosed',
    'BedrockLogOut',
    'google_breakpad::ExceptionHandler::HandleException',
    'google_breakpad::ExceptionHandler::HandleInvalidParameter',
    'DedicatedServer::stop',
    'NetworkIdentifier::operator==',
    'CommandOutputSender::send',
    'ServerInstance::startServerThread',
    'NetworkHandler::_getConnectionFromId',
    'NetworkHandler::send',
    'NetworkHandler::_sortAndPacketizeEvents',
    'PacketViolationHandler::_handleViolation',
    'NetworkHandler::_sendInternal',
] as const;

// decorated symbols
const symbols2 = [
    '??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ', // overrided function
] as const;

const SYMOPT_PUBLICS_ONLY = 0x00004000;

export const proc = pdb.getProcAddresses({}, symbols);
export type proc = typeof proc;

const oldoptions = pdb.setOptions(SYMOPT_PUBLICS_ONLY);
export const proc2 = pdb.getProcAddresses({}, symbols2);
export type proc2 = typeof proc2;
pdb.setOptions(oldoptions);

/**
 * Basiclly pdb is opened at starting.
 * close to reduce the resource usage.
 */
pdb.close();
