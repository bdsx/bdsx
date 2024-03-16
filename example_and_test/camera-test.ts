import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { CommandResultType } from "bdsx/commandresult";

command.register("camera-test", "camera example").overload(
    (param, origin, output) => {
        const caller = origin.getEntity();
        if (!caller?.isPlayer()) return;
        const level = caller.getLevel();
        let entities = level.getEntities()
        const entity = entities[0]

        if (entity == null) return;
        let pos = entity.getPosition();
        const res = bedrockServer.executeCommand(`camera @a set minecraft:free pos ${pos.x} ${pos.y} ${pos.z} rot 0 0`, CommandResultType.Data);

    },
    {},
);
