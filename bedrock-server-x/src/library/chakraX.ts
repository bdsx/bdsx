
declare global
{
    namespace chakraX {
        const fs: {
        };

        /**
         * Catch global errors
         * default error printing is disabled if cb returns false
         */
        function setOnErrorListener(cb: (err: Error) => void | boolean): void;

        /**
         * Request native debugger
         */
        function debug(): void;

        /**
         * Native console object
         */
        const console: {
            /**
                * print message to console
                */
            log(message: string): void;
            /**
                * set text color
                * @param color color bit flags, You can composite like console.FOREGROUND_BLUE | console.FOREGROUND_RED
                */
            setTextAttribute(color: number): void;
            /**
                * get text color
                */
            getTextAttribute(): number;
            readonly FOREGROUND_BLUE: number;
            readonly FOREGROUND_GREEN: number;
            readonly FOREGROUND_RED: number;
            readonly FOREGROUND_INTENSITY: number;
            readonly BACKGROUND_BLUE: number;
            readonly BACKGROUND_GREEN: number;
            readonly BACKGROUND_RED: number;
            readonly BACKGROUND_INTENSITY: number;
        };

        /**
            * It must be called on system.update
            * It process I/O completion from File Writing/Reading
            */
        function update(): void;

        /**
            * Native file, It will open file with CreateFile WinAPI function
            * Must be closed
            */
        class NativeFile {
            /**
                * @param path file path
                * @param access bit flags, NativeFile.WRITE or NativeFile.READ
                * @param creation NativeFile.CREATE_NEW or NativeFile.CREATE_ALWAYS or NativeFile.OPEN_EXISTING or NativFile.OPEN_ALWAYS
                */
            constructor(path: string, access: number, creation: number);
            /**
                * NativeFile must be closed after used
                */
            close(): void;
            /**
                * Read as buffer
                * @param offset position from begin of file
                * @param size reading size
                * @param callback callback, error is zero if succeeded
                * @param buffer true = result is buffer, false = result is string
                */
            read(offset: number, size: number, callback: (error: Error | null, buffer: Uint8Array) => void, buffer: true): void;
            /**
                * Read as string
                * @param offset position from begin of file
                * @param size reading size
                * @param callback callback, error is zero if succeeded
                * @param buffer true = result is buffer, false = result is string
                */
            read(offset: number, size: number, callback: (error: Error | null, buffer: string) => void, buffer: false): void;
            /**
                * Write file
                * @param offset position from begin of file
                * @param buffer buffer for writing
                * @param callback callback, error is zero if succeeded
                */
            write(offset: number, buffer: string | ArrayBuffer | ArrayBufferView | DataView, callback: (error: Error | null, bytes: number) => void): void;
            /**
                * get file size
                * is not async function
                */
            size(): number;

            static readonly WRITE: number;
            static readonly READ: number;
            static readonly CREATE_NEW: number;
            static readonly CREATE_ALWAYS: number;
            static readonly OPEN_EXISTING: number;
            static readonly OPEN_ALWAYS: number;
        }

        /**
            * for packet listening
            */
        const nethook: {
            /**
                * @param packetId Listening packetId, I refer to this document: https://github.com/NiclasOlofsson/MiNET/blob/master/src/MiNET/MiNET/Net/MCPE%20Protocol%20Documentation.md
                * @param listener Callback function, ptr is native pointer of a parsed packet, 
                * Maybe you cannot find any document about the parsed packet structure
                * Just Read It and Print It!
                */
            setOnPacketReadListener(packetId: number, listener: (ptr: NativePointer, networkIdentifier: string, packetId: number) => void | boolean): void;
            setOnPacketAfterListener(packetId: number, listener: (ptr: NativePointer, networkIdentifier: string, packetId: number) => void | boolean): void;
            setOnPacketAfterListener(packetId: 1, listener: (ptr: NativePointer, networkIdentifier: string, packetId: number, loginInfo: { id: string, ip: string, xuid: string }) => void | boolean): void;
            setOnConnectionClosedListener(listener: (networkIdentifier: string) => void): void;
        };

        /**
            * for access native pointer
            */
        class NativePointer {
            setAddress(lowBits: number, highBits: number): void;
            move(lowBits: number, highBits?: number): void;
            readUint8(): number;
            readUint16(): number;
            readUint32(): number;
            readInt8(): number;
            readInt16(): number;
            readInt32(): number;
            readPointer(): NativePointer;

            /**
                * read C++ std::string
                */
            readCxxString(): string;

            /**
                * read UTF16 string
                * @param bytes if it's not provided, It will read until reach null character
                */
            readUtf16(bytes?: number): string;

            /**
                * read UTF8 string
                * @param bytes if it's not provided, It will read until reach null character
                */
            readUtf8(bytes?: number): string;

            readBuffer(bytes: number): Uint8Array;
        }
    }
}

if (typeof chakraX === undefined) {
    const msg = 'Bedrock Server X Required: https://www.npmjs.com/package/bedrock-server-x';
    console.error(msg);
    throw Error(msg);
}

export = chakraX;
