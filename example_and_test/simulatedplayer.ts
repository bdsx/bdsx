import { BlockPos } from 'bdsx/bds/blockpos';
import { CommandPermissionLevel } from 'bdsx/bds/command';
import { SimulatedPlayer } from 'bdsx/bds/player';
import { command } from 'bdsx/command';
import { bedrockServer } from 'bdsx/launcher';
import { CxxString } from 'bdsx/nativetype';
command.register('spawnsimulatedplayer', 'spawnsimulatedplayer', CommandPermissionLevel.Operator).overload((params, origin, output) => {
    const owner = origin.getEntity();
    if(owner && owner.isPlayer()){
        const name = params.name;
        //You can use any BlockPos and supported DimensionId.
        const player = SimulatedPlayer.create(name, BlockPos.create(owner.getPosition()), owner.getDimensionId(), bedrockServer.minecraft.getNonOwnerPointerServerNetworkHandler()); //Create SimulatedPlayer

        player.simulateDisconnect(); //Disconnect SimulatedPlayer
        output.success(`Spawned SimulatedPlayer ${name}`);
    }
}, {name: CxxString});