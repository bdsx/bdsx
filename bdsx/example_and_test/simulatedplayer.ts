import { CommandPermissionLevel } from 'bdsx/bds/command';
import { SimulatedPlayer } from 'bdsx/bds/player';
import { command } from 'bdsx/command';
import { CxxString } from 'bdsx/nativetype';

let counter = 0;

command.register('spawnsimulatedplayer', 'spawnsimulatedplayer', CommandPermissionLevel.Operator).overload((params, origin, output) => {
    const owner = origin.getEntity();
    if(owner && owner.isPlayer()){
        const name = params.name || ('Simulated Player ' + (++counter));
        // You can use any BlockPos and supported DimensionId.
        const player = SimulatedPlayer.create(name, owner.getPosition(), owner.getDimensionId()); // Create SimulatedPlayer

        // player.simulateDisconnect(); // Disconnect SimulatedPlayer
        output.success(`Spawned SimulatedPlayer ${name}`);
    }
}, {name: [CxxString, true]});
