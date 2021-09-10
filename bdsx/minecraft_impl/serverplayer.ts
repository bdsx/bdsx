import { Player, ServerPlayer } from "../minecraft";
import { CxxString, uint8_t } from "../nativetype";

declare module "../minecraft" {
    interface ServerPlayer extends Player {

        /** @deprecated is Actor constructor */
        constructWith(iLevel:ILevel):void;
        /** @deprecated is Actor constructor */
        constructWith(actorDefinitionGroup:ActorDefinitionGroup|null, actorDefinitionIdentifier:ActorDefinitionIdentifier):void;
        /** @deprecated is Player constructor */
        constructWith(level:Level, packetSender:PacketSender, gameType:GameType, networkIdentifier:NetworkIdentifier, uc:uint8_t, uuid:mce.UUID, str_1:CxxString, v:Certificate, str_2:CxxString, str_3:CxxString):void;

        changeDimension(changeDimensionPacket:ChangeDimensionPacket):void;
    }
}

(ServerPlayer as any).__proto__ = Player;
(ServerPlayer as any).prototype.__proto__ = Player.prototype;
