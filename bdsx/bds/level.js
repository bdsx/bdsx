"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagRegistry = exports.AdventureSettings = exports.BlockPalette = exports.ActorFactory = exports.LevelData = exports.ServerLevel = exports.Level = exports.Difficulty = void 0;
const common_1 = require("../common");
const nativeclass_1 = require("../nativeclass");
const minecraft = require("../minecraft");
exports.Difficulty = minecraft.Difficulty;
/** @deprecated */
class Level extends nativeclass_1.NativeClass {
    createDimension(id) {
        (0, common_1.abstract)();
    }
    destroyBlock(blockSource, blockPos, dropResources) {
        (0, common_1.abstract)();
    }
    fetchEntity(id, fetchRemovedActor) {
        (0, common_1.abstract)();
    }
    getActivePlayerCount() {
        (0, common_1.abstract)();
    }
    getActorFactory() {
        (0, common_1.abstract)();
    }
    getAdventureSettings() {
        (0, common_1.abstract)();
    }
    getBlockPalette() {
        (0, common_1.abstract)();
    }
    getDimension(dimension) {
        (0, common_1.abstract)();
    }
    getLevelData() {
        (0, common_1.abstract)();
    }
    getGameRules() {
        (0, common_1.abstract)();
    }
    getScoreboard() {
        (0, common_1.abstract)();
    }
    getSeed() {
        (0, common_1.abstract)();
    }
    getTagRegistry() {
        (0, common_1.abstract)();
    }
    hasCommandsEnabled() {
        (0, common_1.abstract)();
    }
    setCommandsEnabled(value) {
        (0, common_1.abstract)();
    }
    setShouldSendSleepMessage(value) {
        (0, common_1.abstract)();
    }
    syncGameRules() {
        (0, common_1.abstract)();
    }
}
exports.Level = Level;
/** @deprecated */
class ServerLevel extends Level {
}
exports.ServerLevel = ServerLevel;
class LevelData extends nativeclass_1.NativeClass {
    getGameDifficulty() {
        (0, common_1.abstract)();
    }
    setGameDifficulty(value) {
        (0, common_1.abstract)();
    }
}
exports.LevelData = LevelData;
class ActorFactory extends nativeclass_1.NativeClass {
}
exports.ActorFactory = ActorFactory;
class BlockPalette extends nativeclass_1.NativeClass {
}
exports.BlockPalette = BlockPalette;
class AdventureSettings extends nativeclass_1.NativeClass {
}
exports.AdventureSettings = AdventureSettings;
class TagRegistry extends nativeclass_1.NativeClass {
}
exports.TagRegistry = TagRegistry;
//# sourceMappingURL=level.js.map