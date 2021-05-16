import { pdb } from "bdsx/core";
import { UNDNAME_NAME_ONLY } from "../common";

const symbols = [
    'ScriptEngine::~ScriptEngine',
    'ScriptEngine::startScriptLoading',
    'MinecraftServerScriptEngine::onServerThreadStarted',
    'std::thread::_Invoke<std::tuple<<lambda_8914ed82e3ef519cb2a85824fbe333d8> >,0>',
    'ConsoleInputReader::getLine',
    '<lambda_8914ed82e3ef519cb2a85824fbe333d8>::operator()',
    'ScriptEngine::initialize',
    'ScriptEngine::shutdown',
    'Level::createDimension',
    'Level::fetchEntity',
    'Level::getActivePlayerCount',
    'Crypto::Random::generateUUID',
    'Player::attack',
    'Player::drop',
    'Player::getCarriedItem',
    'Player::getPlayerGameType',
    'Player::getSupplies',
    'Player::setName',
    'Player::take',
    'Player::teleportTo',
    'Player::getPlayerPermissionLevel',
    'ServerNetworkHandler::_getServerPlayer',
    'ServerNetworkHandler::allowIncomingConnections',
    'ServerNetworkHandler::disconnectClient',
    'ServerNetworkHandler::updateServerAnnouncement',
    'ServerPlayer::changeDimension',
    'ServerPlayer::openInventory',
    'ServerPlayer::sendInventory',
    'ServerPlayer::sendNetworkPacket',
    'std::_Allocate<16,std::_Default_allocate_traits,0>',
    'MinecraftCommands::executeCommand',
    "ServerPlayer::`vftable'",
    'Actor::addTag',
    'Actor::getNameTag',
    'Actor::getOffhandSlot',
    'Actor::getPos',
    'Actor::getRegionConst',
    'Actor::getUniqueID',
    'Actor::hasTag',
    'Actor::setNameTag',
    'Actor::hurt',
    'Actor::getArmor',
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
    'ServerInstance::disconnectAllClientsWithMessage',
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
    'Item::getCreativeCategory',
    'Item::setAllowOffhand',
    'ItemStackBase::getId',
    'ItemStackBase::getItem',
    'ItemStackBase::getName',
    'ItemStackBase::getUserData',
    'ItemStackBase::hasCustomHoverName',
    'ItemStackBase::isBlock',
    'ItemStackBase::isNull',
    'ItemStackBase::setCustomName',
    'ItemStackBase::getEnchantValue',
    'ItemStackBase::isEnchanted',
    'ItemStackBase::setCustomLore',
    'ItemStackBase::setDamageValue',
    'ItemStackBase::startCoolDown',
    'ItemStackBase::load',
    'ItemStackBase::sameItem',
    'ItemStackBase::isStackedByData',
    'ItemStackBase::isStackable',
    'ItemStackBase::isWearableItem',
    'ItemStackBase::isPotionItem',
    'ItemStackBase::isPattern',
    'ItemStackBase::isMusicDiscItem',
    'ItemStackBase::isLiquidClipItem',
    'ItemStackBase::isHorseArmorItem',
    'ItemStackBase::isGlint',
    'ItemStackBase::isFullStack',
    'ItemStackBase::isFireResistant',
    'ItemStackBase::isExplodable',
    'ItemStackBase::isDamaged',
    'ItemStackBase::isDamageableItem',
    'ItemStackBase::isArmorItem',
    'ItemStackBase::getComponentItem',
    'ItemStackBase::getMaxDamage',
    'ItemStackBase::getDamageValue',
    'ItemStackBase::getAttackDamage',
    'PlayerInventory::add',
    'PlayerInventory::clearSlot',
    'PlayerInventory::getContainerSize',
    'PlayerInventory::getFirstEmptySlot',
    'PlayerInventory::getHotbarSize',
    'PlayerInventory::getItem',
    'PlayerInventory::getSelectedItem',
    'PlayerInventory::getSlotWithItem',
    'PlayerInventory::getSlots',
    'PlayerInventory::removeItem',
    'PlayerInventory::selectSlot',
    'PlayerInventory::setItem',
    'PlayerInventory::setSelectedItem',
    'PlayerInventory::swapSlots',
    'CommandRegistry::registerCommand',
    'CommandRegistry::registerAlias',
    'CommandRegistry::findCommand',
    'CommandRegistry::registerOverloadInternal',
    'BlockSource::getBlock',
    'BlockSource::mayPlace',
    'GameMode::_creativeDestroyBlock',
    'SurvivalMode::destroyBlock',
    'Block::getName',
    'BlockLegacy::getCommandName',
    'BlockLegacy::getCreativeCategory',
    'BlockLegacy::setDestroyTime',
    'RakNetServerLocator::announceServer',
    'HealthAttributeDelegate::change',
    'MinecraftCommands::getRegistry',
    'CommandSelectorBase::CommandSelectorBase',
    'CommandSelectorBase::~CommandSelectorBase',
    'CommandSelectorBase::newResults',
    'ScriptServerActorEventListener::onActorSneakChanged',
    'ScriptServerActorEventListener::onActorCreated',
    'ScriptServerActorEventListener::onActorDeath',
    'ScriptServerActorEventListener::onActorRemoved',
    'Dimension::getDimensionId',
    'TeleportCommand::computeTarget',
    'TeleportCommand::applyTarget',
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
    '?_spawnMovingBlocks@PistonBlockActor@@AEAAXAEAVBlockSource@@@Z',
    'sprintf',
    'vsnprintf',
    '??0CompoundTag@@QEAA@XZ',
    '??1CompoundTag@@UEAA@XZ',
    '?getInt@CompoundTag@@QEBAHV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?putInt@CompoundTag@@QEAAAEAHV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@H@Z',
    '?print@CompoundTag@@UEBAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAVPrintStream@@@Z',
    '?get@CompoundTag@@QEAAPEAVTag@@V?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?getCompound@ListTag@@QEBAPEBVCompoundTag@@_K@Z',
    '?getString@CompoundTag@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?size@ListTag@@QEBAHXZ',
    '?getShort@CompoundTag@@QEBAFV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?getBlockEntity@BlockSource@@QEAAPEAVBlockActor@@AEBVBlockPos@@@Z',
    '?getByte@CompoundTag@@QEBAEV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?clone@CompoundTag@@QEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@XZ',
    '?contains@CompoundTag@@QEBA_NV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?contains@CompoundTag@@QEBA_NV?$basic_string_span@$$CBD$0?0@gsl@@W4Type@Tag@@@Z',
    '?copy@CompoundTag@@UEBA?AV?$unique_ptr@VTag@@U?$default_delete@VTag@@@std@@@std@@XZ',
    '?deepCopy@CompoundTag@@QEAAXAEBV1@@Z',
    '?equals@CompoundTag@@UEBA_NAEBVTag@@@Z',
    '?getBoolean@CompoundTag@@QEBA_NV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?getByteArray@CompoundTag@@QEBAAEBUTagMemoryChunk@@V?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?getCompound@CompoundTag@@QEAAPEAV1@V?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?getFloat@CompoundTag@@QEBAMV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?getInt64@CompoundTag@@QEBA_JV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?getList@CompoundTag@@QEAAPEAVListTag@@V?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '?isEmpty@CompoundTag@@QEBA_NXZ',
    '?put@CompoundTag@@QEAAAEAVTag@@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@$$QEAV2@@Z',
    '?putBoolean@CompoundTag@@QEAAXV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@_N@Z',
    '?putByte@CompoundTag@@QEAAAEAEV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@E@Z',
    '?putByteArray@CompoundTag@@QEAAAEAUTagMemoryChunk@@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@U2@@Z',
    '?putCompound@CompoundTag@@QEAAAEAV1@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V1@@Z',
    '?putFloat@CompoundTag@@QEAAAEAMV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@M@Z',
    '?putInt64@CompoundTag@@QEAAAEA_JV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@_J@Z',
    '?putShort@CompoundTag@@QEAAAEAFV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@F@Z',
    '?putString@CompoundTag@@QEAAAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V23@0@Z',
    '?remove@CompoundTag@@QEAA_NV?$basic_string_span@$$CBD$0?0@gsl@@@Z',
    '??0ListTag@@QEAA@XZ',
    '??1ListTag@@UEAA@XZ',
    '?add@ListTag@@QEAAXV?$unique_ptr@VTag@@U?$default_delete@VTag@@@std@@@std@@@Z',
    '?copy@ListTag@@UEBA?AV?$unique_ptr@VTag@@U?$default_delete@VTag@@@std@@@std@@XZ',
    '?copyList@ListTag@@QEBA?AV?$unique_ptr@VListTag@@U?$default_delete@VListTag@@@std@@@std@@XZ',
    '?deleteChildren@ListTag@@UEAAXXZ',
    '?equals@ListTag@@UEBA_NAEBVTag@@@Z',
    '?get@ListTag@@QEBAPEAVTag@@H@Z',
    '?getCompound@ListTag@@QEBAPEBVCompoundTag@@_K@Z',
    '?getDouble@ListTag@@QEBANH@Z',
    '?getFloat@ListTag@@QEBAMH@Z',
    '?getInt@ListTag@@QEBAHH@Z',
    '?getString@ListTag@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@H@Z',

] as const;


export const proc = pdb.getList(pdb.coreCachePath, {}, symbols, false, UNDNAME_NAME_ONLY);
/** @deprecated use typeof proc */
export type proc = typeof proc;

export const proc2 = pdb.getList(pdb.coreCachePath, {}, symbols2);
/** @deprecated use typeof proc2 */
export type proc2 = typeof proc2;

pdb.close();
