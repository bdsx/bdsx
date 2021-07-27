import { command } from 'bdsx/command';
import { ActorWildcardCommandSelector, CommandPermissionLevel, CommandRawText, PlayerWildcardCommandSelector } from 'bdsx/bds/command';
import { Permissions } from 'bdsx/permissions';
import { Player } from 'bdsx/bds/player';
import { bedrockServer } from 'bdsx/launcher';

const commandPerm = Permissions.registerPermission("command", "Minecraft commands", Permissions.registerPermission("minecraft", "Minecraft data", null, false), false);

Permissions.registerPermission("me", "Vanilla me command", commandPerm, true);
Permissions.registerPermission("say", "Vanilla say command", commandPerm, true);
Permissions.registerPermission("give", "Vanilla give command", commandPerm, false);
command.register('commandthatneedspermission', 'Say "I\'m a cow"').overload((params, origin) => {
    if(!origin.getEntity()?.isPlayer()) return;
    if(Permissions.permissionNodeFromString("bdsx.example.imacow")?.getUser(origin.getEntity() as Player)) {
        bedrockServer.executeCommand(`execute ${origin.getName()} ~ ~ ~ say I'm a cow`);
    }
}, {});
command.register('giveperm', 'Give a player a permission', CommandPermissionLevel.Operator).overload((params, origin) => {
    for(const p of params.target.newResults(origin)) {
        if(!p.isPlayer()) continue;
        Permissions.permissionNodeFromString(params.permission.text)?.setUser(p as Player, true);
    }
}, {
    target: ActorWildcardCommandSelector,
    permission: CommandRawText
});
