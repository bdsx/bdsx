/// <reference types="node" />
import fs = require('fs');
export declare namespace fsutil {
    const projectPath: string;
    /** @deprecated use fsutil.projectPath */
    function getProjectPath(): string;
    /**
     * @param filepath any file path
     * @param extname contains dot
     * @returns
     */
    function replaceExt(filepath: string, extname: string): string;
    function isDirectory(filepath: string): Promise<boolean>;
    function isFile(filepath: string): Promise<boolean>;
    function isDirectorySync(filepath: string): boolean;
    function isFileSync(filepath: string): boolean;
    function checkModified(ori: string, out: string): Promise<boolean>;
    function checkModifiedSync(ori: string, out: string): boolean;
    function readFile(path: string): Promise<string>;
    function readFile(path: string, encoding: null): Promise<Buffer>;
    function readFile(path: string, encoding: string): Promise<string>;
    function writeFile(path: string, content: string | Uint8Array): Promise<void>;
    /**
     * uses system EOL and add a last line
     */
    function writeJson(path: string, content: unknown): Promise<void>;
    /**
     * uses system EOL and add a last line
     */
    function writeJsonSync(path: string, content: unknown): void;
    function readdir(path: string): Promise<string[]>;
    function readdirWithFileTypes(path: string): Promise<fs.Dirent[]>;
    function mkdir(path: string): Promise<void>;
    function mkdirRecursive(dirpath: string, dirhas?: Set<string>): Promise<void>;
    function mkdirRecursiveFromBack(dir: string): Promise<boolean>;
    function rmdir(path: string): Promise<void>;
    function stat(path: string): Promise<fs.Stats>;
    function lstat(path: string): Promise<fs.Stats>;
    function utimes(path: string, atime: string | number | Date, mtime: string | number | Date): Promise<void>;
    function unlink(path: string): Promise<void>;
    function copyFile(from: string, to: string): Promise<void>;
    function isModified(from: string, to: string): Promise<boolean>;
    function exists(path: string): Promise<boolean>;
    function del(filepath: string): Promise<void>;
    function unlinkQuiet(path: string): Promise<void>;
    function symlink(target: string, path: string, type?: fs.symlink.Type): Promise<void>;
    class DirectoryMaker {
        readonly dirhas: Set<string>;
        make(pathname: string): Promise<void>;
        del(pathname: string): void;
    }
}
