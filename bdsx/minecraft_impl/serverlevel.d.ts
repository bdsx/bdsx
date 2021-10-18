import { CxxVector } from "../cxxvector";
import { bool_t, uint8_t } from "../nativetype";
import { Wrapper } from "../pointer";
import './level';
declare module "../minecraft" {
    interface ServerLevel extends Level {
        actors: CxxVector<Actor>;
        /**
         * @deprecated is Level constructor
         */
        constructWith(v_1: Wrapper<Bedrock.NonOwnerPointer<SoundPlayerInterface>>, v_2: LevelStorage, v_3: LevelLooseFileStorage, iMinecraftEventing: IMinecraftEventing, b: bool_t, uc: uint8_t, scheduler: Scheduler, v_4: Wrapper<Bedrock.NonOwnerPointer<StructureManager>>, resourcePackManager: ResourcePackManager, v_5: Wrapper<Bedrock.NonOwnerPointer<IEntityRegistryOwner>>, weakRefT: WeakRefT<EntityRefTraits>, v_6: BlockComponentFactory, v_7: BlockDefinitionGroup): void;
    }
}
