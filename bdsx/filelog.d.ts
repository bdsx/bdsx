export declare class FileLog {
    private readonly path;
    private appending;
    private flushing;
    constructor(filepath: string);
    private _flush;
    log(...message: any[]): void;
}
