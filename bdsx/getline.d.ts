import { Encoding } from "./common";
export declare class GetLine {
    private readonly online;
    private readonly thread;
    constructor(online: (line: string) => void);
    static setEncoding(encoding: Encoding): void;
    close(): void;
}
