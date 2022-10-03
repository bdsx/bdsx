import { command } from "bdsx/command";
import { CxxString, int32_t } from "bdsx/nativetype";

command.register('bdsxtitle', '').overload((params, origin, output) => {
    const actor = origin.getEntity();
    if (!actor?.isPlayer()) return;
    actor.setTitleDuration(20, params.duration ?? 60, 20);
    actor.sendTitle(params.message);
}, {
    message: CxxString,
    duration: [int32_t, true],
});
