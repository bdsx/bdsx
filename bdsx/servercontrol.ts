/**
 * @deprecated combined to bedrockServer in launcher.ts
 */
import { bedrockServer } from './launcher';

/**
 * @deprecated use bedrockServer.*
 */
export namespace serverControl
{
    /**
     * @deprecated use bedrockServer.stop()
     */
    export function stop():void {
        bedrockServer.stop();
    }
}
