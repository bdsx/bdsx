export declare class FileWriter {
    readonly path: string;
    private readonly ws;
    private readonly errprom;
    constructor(path: string);
    write(data: string): Promise<void>;
    end(): Promise<void>;
    copyTo(path: string): Promise<void>;
}
