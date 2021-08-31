// The permissions system is currently deprecated and not useable. This is an example of the api works for reference.

import { command } from 'bdsx/command';
import { ActorWildcardCommandSelector, CommandPermissionLevel, CommandRawText } from 'bdsx/bds/command';
import { Permissions } from 'bdsx/permissions';
import { Player } from 'bdsx/bds/player';
import { bedrockServer } from 'bdsx/launcher';

const commandPerm = Permissions.registerPermission("command", "Minecraft commands", Permissions.registerPermission("minecraft", "Minecraft data", null, false), false);

Permissions.registerPermission("me", "Vanilla me command", commandPerm, true);
Permissions.registerPermission("say", "Vanilla say command", commandPerm, true);
Permissions.registerPermission("give", "Vanilla give command", commandPerm, false);
export const bdsxExampleNode = Permissions.registerPermission("example", "BDSX examples", Permissions.registerPermission("bdsx", "BDSX permissions", null, false), false);
Permissions.registerPermission("imacow", "Permission to use the commandthatneedspermission command", bdsxExampleNode, false);

command.register('commandthatneedspermission', 'Say "I\'m a cow"').overload((params, origin, result) => {
    if(!origin.getEntity()?.isPlayer()) return;
    const node = Permissions.permissionNodeFromString("bdsx.example.imacow");
    const res = node?.getUser(origin.getEntity() as Player);
    if(res) {
        bedrockServer.executeCommand(`execute "${origin.getName()}" ~ ~ ~ say I'm a cow`);
    } else {
        result.error("You don't have permission 'bdsx.example.imacow' needed to use this command");
    }
}, {});
command.register('giveperm', 'Give a player a permission', CommandPermissionLevel.Operator).overload((params, origin, res) => {
    let result = "Gave the permission " + params.permission.text + " to ";
    for(const p of params.target.newResults(origin)) {
        if(!p.isPlayer()) continue;
        Permissions.permissionNodeFromString(params.permission.text)?.setUser(p as Player, true);
        result += p.getName() + ", ";
    }
    result = result.substr(0, result.length - 2);
    res.success(result);
}, {
    target: ActorWildcardCommandSelector,
    permission: CommandRawText
});
