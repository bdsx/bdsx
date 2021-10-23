import { Dimension } from "./bds/dimension";
import "./minecraft_impl";
import minecraft = require("./minecraft");
export declare namespace bedrockServer {
    let sessionId: string;
    function withLoading(): Promise<void>;
    function afterOpen(): Promise<void>;
    function isLaunched(): boolean;
    /**
     * stop the BDS
     * It will stop next tick
     */
    function stop(): void;
    function forceKill(exitCode: number): never;
    function launch(): Promise<void>;
    /**
     * pass to stdin
     * recommend using command.execute instead
     * It exists in anticipation of other unexpected effects.
     */
    function executeCommandOnConsole(command: string): void;
    /**
     * @deprecated use 'command.execute' in 'bdsx/command'
     */
    function executeCommand(commandstr: string, mute?: boolean, permissionLevel?: number, dimension?: Dimension | null): minecraft.MCRESULT;
    class DefaultStdInHandler {
        protected online: (line: string) => void;
        private readonly getline;
        protected readonly onclose: () => void;
        constructor();
        static install(): DefaultStdInHandler;
        close(): void;
    }
}
