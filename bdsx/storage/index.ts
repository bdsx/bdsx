import * as path from "path";
import { fsutil } from "../fsutil";
import { timeout } from "../util";
import * as util from "util";
import Module = require("module");
import { CircularDetector } from "../circulardetector";

interface StorageClassBase {
    [Storage.classId]: string;
    prototype: HasStorage;
}

const storages = new Map<string, StorageImpl>();
const storageStored = Symbol("storage");
const storageBase = Symbol("storageBase");
const proxyBase = Symbol("proxyBase");

enum State {
    Loaded,
    Loading,
    Unloaded,
    Deleted,
}

class StorageArray<T> extends Array<T> {
    [storageBase]: StorageImpl | null;
    [proxyBase]: Array<T>;

    constructor(storage: StorageImpl, arrayLength: number) {
        super(arrayLength);
        this[storageBase] = storage;
        this[proxyBase] = this;
    }
    set(index: number, value: T): boolean {
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        if (this[index] !== value) {
            this[index] = storage.convert(value) as T;
            storage.saveRequest();
        } else if (value === undefined && !(index in this)) {
            this[index] = value;
            storage.saveRequest();
        }
        return true;
    }
    delete(index: number): boolean {
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        const res = delete this[index];
        if (res) {
            storage.saveRequest();
        }
        return res;
    }
    push(...items: T[]): number {
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        const n = items.length;
        for (let i = 0; i !== n; i = (i + 1) | 0) {
            items[i] = storage.convert(items[i]) as T;
        }
        const res = super.push(...items);
        storage.saveRequest();
        return res;
    }
    pop(): T | undefined {
        if (this.length === 0) return undefined;
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        const res = super.pop();
        storage.saveRequest();
        return res;
    }
    unshift(...items: T[]): number {
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        const n = items.length;
        for (let i = 0; i !== n; i = (i + 1) | 0) {
            items[i] = storage.convert(items[i]) as T;
        }
        const res = super.unshift(...items);
        storage.saveRequest();
        return res;
    }
    shift(): T | undefined {
        if (this.length === 0) return undefined;
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        const res = super.shift();
        storage.saveRequest();
        return res;
    }

    reverse(): T[] {
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        super.reverse();
        storage.saveRequest();
        return this;
    }

    sort(compareFn?: ((a: T, b: T) => number) | undefined): this {
        const storage = this[storageBase];
        if (storage === null) throw Error("deleted storage array");
        super.sort(compareFn);
        storage.saveRequest();
        return this;
    }

    [util.inspect.custom](depth: number, options: Record<string, any>): unknown {
        return CircularDetector.check(this, () => [...this]);
    }
}

const arrayProxyHandler: ProxyHandler<any> = {
    set(target, p, value) {
        const storage: StorageImpl | null = target[storageBase];
        if (storage === null) throw Error("deleted storage array");
        if (typeof p === "number") {
            if (storage.state !== State.Loaded) throw Error(`storage is not loaded`);
            return target.set(p, value);
        } else {
            target[p] = value;
            return true;
        }
    },
    deleteProperty(target, p) {
        const storage: StorageImpl | null = target[storageBase];
        if (storage === null) throw Error("deleted storage array");
        if (typeof p === "number") {
            if (storage.state !== State.Loaded) throw Error(`storage is not loaded`);
            return target.delete(p);
        } else {
            return delete target[p];
        }
    },
};
const objectProxyHandler: ProxyHandler<any> = {
    set(target, p, value) {
        if (typeof p === "string") {
            const storage: StorageImpl | null = target[storageBase];
            if (storage === null) throw Error("deleted storage object");
            if (storage.state !== State.Loaded) throw Error(`storage is not loaded`);
            if (target[p] !== value) {
                target[p] = storage.convert(value);
                storage.saveRequest();
            } else if (value === undefined && !(p in target)) {
                target[p] = value;
                storage.saveRequest();
            }
        } else {
            target[p] = value;
        }
        return true;
    },
    deleteProperty(target, p) {
        if (typeof p === "string") {
            const storage: StorageImpl | null = target[storageBase];
            if (storage === null) throw Error("deleted storage object");
            if (storage.state !== State.Loaded) throw Error(`storage is not loaded`);
            const res = delete target[p];
            if (res) storage.saveRequest();
            return res;
        } else {
            return delete target[p];
        }
    },
};

export abstract class Storage<T> {
    static readonly classId = Symbol("storageClassId");
    static readonly id = Symbol("storageId");
    static readonly aliasId = Symbol("storageId");

    abstract get data(): T;
    abstract get isLoaded(): boolean;
    abstract init(value: T | undefined): void;
    abstract close(): boolean;

    protected constructor() {
        // empty
    }

    delete(): void {
        this.init(undefined);
    }
}

class StorageImpl extends Storage<any> {
    private storageData: StorageData | null = null;
    private saving: Promise<void> | null = null;
    private modified = false;
    public state = State.Unloaded;

    private loading: Promise<StorageImpl> | null = null;

    constructor(
        private container: HasStorage | null,
        private readonly classId: string | null,
        private mainId: string,
        private aliasId: string | null,
        private isStringId: boolean,
        private readonly driver: StorageDriver,
    ) {
        super();

        const mainKey = classId + "/" + mainId;
        if (storages.has(mainKey)) throw Error(`storage key duplicated`);
        storages.set(mainKey, this);

        if (aliasId !== null) {
            const aliasKey = classId + "/" + aliasId;
            if (storages.has(aliasKey)) throw Error(`storage key duplicated`);
            storages.set(aliasKey, this);
        }
        if (container !== null) {
            container[storageStored] = this;
        }
    }

    get data(): any {
        const data = this.storageData;
        if (data === null) return undefined;
        return data.data;
    }

    get isLoaded(): boolean {
        return this.storageData !== null;
    }

    private async _load(): Promise<StorageImpl> {
        if (this.state !== State.Unloaded) throw Error(`storage is already loaded`);
        this.state = State.Loading;

        let data = await this.driver.read(this.classId, this.mainId);
        if ((this.state as any) === State.Unloaded) return this; // unloaded while loading

        if (data === null && this.aliasId !== null) {
            data = await this.driver.read(this.classId, this.aliasId);
            if ((this.state as any) === State.Unloaded) return this; // unloaded while loading
        }

        this._loadData(data);
        return this;
    }

    private _loadSync(): StorageImpl {
        if (this.state !== State.Unloaded) throw Error(`storage is already loaded`);
        this.state = State.Loading;

        let data = this.driver.readSync(this.classId, this.mainId);
        if ((this.state as any) === State.Unloaded) return this; // unloaded while loading

        if (data === null && this.aliasId !== null) {
            data = this.driver.readSync(this.classId, this.aliasId);
            if ((this.state as any) === State.Unloaded) return this; // unloaded while loading
        }

        this._loadData(data);
        return this;
    }

    private _loadData(data: StorageData | null): void {
        if (data === null) {
            this.storageData = {
                mainId: null,
                aliasId: null,
                data: undefined,
            };
        } else {
            this.storageData = data;
            data.data = this.convert(data.data);
            if (this.isStringId) {
                this._changeKeys(data.mainId!, data.aliasId);
            } else if (data.mainId !== this.mainId || data.aliasId !== this.aliasId) {
                this.saveRequest();
            }
        }
        this.state = State.Loaded;
    }

    setContainer(container: HasStorage, mainId: string, aliasId: string | null): void {
        this.isStringId = false;
        this.container = container;
        container[storageStored] = this;
        this._changeKeys(mainId, aliasId);
    }

    private _changeKeys(mainId: string, aliasId: string | null): void {
        if (mainId !== this.mainId) {
            if (this.aliasId === mainId) {
                this.aliasId = null;
            } else {
                storages.delete(this.classId + "/" + this.mainId);

                const newMainKey = this.classId + "/" + mainId;
                if (storages.has(newMainKey)) throw Error("storage key duplicated");
                storages.set(newMainKey, this);
            }
            this.mainId = mainId;
            this.saveRequest();
        }
        if (aliasId !== this.aliasId) {
            if (this.aliasId !== null) {
                storages.delete(this.classId + "/" + this.aliasId);
            }

            if (aliasId !== null) {
                const newAliasKey = this.classId + "/" + aliasId;
                if (storages.has(newAliasKey)) throw Error("storage key duplicated");
                storages.set(newAliasKey, this);
            }
            this.aliasId = aliasId;
            this.saveRequest();
        }
    }

    load(): Promise<StorageImpl> {
        if (this.loading !== null) return this.loading;
        return (this.loading = this._load());
    }

    loadSync(): StorageImpl {
        this.loading = Promise.resolve(this);
        return this._loadSync();
    }

    init(value: unknown): void {
        const data = this.storageData;
        if (data === null) throw Error(`storage is not loaded`);
        data.data = this.convert(value);
        this.saveRequest();
    }

    close(): boolean {
        if (this.state === State.Unloaded) return false;
        this.state = State.Unloaded;
        if (this.saving === null) this._unload();
        return true;
    }

    private _unload(): void {
        storages.delete(this.classId + "/" + this.mainId);
        if (this.aliasId !== null) storages.delete(this.classId + "/" + this.aliasId);
        if (this.container !== null) {
            delete this.container[storageStored];
        }
        this.loading = null;
        this.storageData = null;
    }

    saveRequest(): Promise<void> {
        this.modified = true;
        if (this.saving !== null) return this.saving;
        return (this.saving = (async () => {
            await timeout(this.driver.flushDelay);
            try {
                while (this.modified) {
                    this.modified = false;
                    await this.driver.write(this.classId, this.mainId, this.aliasId, this.storageData!);
                }
            } finally {
                this.saving = null;
                if (this.state === State.Unloaded) this._unload();
            }
        })());
    }

    convert(value: unknown): unknown {
        switch (typeof value) {
            case "bigint":
                throw Error("Not implemented yet");
            case "function":
                throw Error("Cannot store the function to the storage");
            case "object":
                if (value === null) return null;
                if (value instanceof Array) {
                    return this._makeArrayProxy(value);
                } else {
                    return this._makeObjectProxy(value);
                }
                break;
            default:
                return value;
        }
    }

    private _makeArrayProxy(array: unknown[]): any[] {
        const n = array.length;
        const base = new StorageArray(this, n);
        for (let i = 0; i !== n; i = (i + 1) | 0) {
            base.set(i, array[i]);
        }
        return new Proxy<any[]>(base, arrayProxyHandler);
    }
    private _makeObjectProxy(obj: Record<string | symbol, any>): any {
        const realObj = obj[proxyBase];
        if (realObj !== undefined) obj = realObj;

        const base: Record<string | symbol, unknown> = {};
        base[storageBase] = this;
        base[proxyBase] = base;
        for (const key in obj) {
            base[key] = this.convert(obj[key]);
        }

        return new Proxy<any>(base, objectProxyHandler);
    }
}

export interface HasStorage {
    [storageStored]?: StorageImpl;
    [Storage.aliasId]?(): string;
    [Storage.id](): string;
}

export interface StorageData {
    mainId: string | null;
    aliasId: string | null;
    data: any;
}

export abstract class StorageDriver {
    static readonly NOT_FOUND = Symbol();
    flushDelay = 500;

    abstract write(classId: string | null, mainId: string, aliasId: string | null, data: StorageData): Promise<void>;
    abstract read(classId: string | null, id: string): Promise<StorageData | null>;
    abstract readSync(classId: string | null, id: string): StorageData | null;

    abstract createIndex(classId: string, indexKey: string): Promise<void>;
    abstract deleteIndex(classId: string, indexKey: string): Promise<void>;
    abstract search(classId: string, indexKey: string, value: unknown): AsyncIterableIterator<string>;

    abstract list(classId: string | null): AsyncIterableIterator<string>;
    abstract listClass(): AsyncIterableIterator<string>;
}
function driverNotProvided(): never {
    throw Error("storage.driver is not provided");
}
class NullDriver extends StorageDriver {
    write(classId: string | null, mainId: string, aliasId: string | null, data: StorageData | null): Promise<void> {
        driverNotProvided();
    }
    read(classId: string | null, id: string): Promise<StorageData | null> {
        driverNotProvided();
    }
    readSync(classId: string | null, id: string): StorageData | null {
        driverNotProvided();
    }
    createIndex(classId: string, indexKey: string): Promise<void> {
        driverNotProvided();
    }
    deleteIndex(classId: string, indexKey: string): Promise<void> {
        driverNotProvided();
    }
    search(classId: string, indexKey: string, value: unknown): AsyncIterableIterator<string> {
        driverNotProvided();
    }
    list(classId: string | null): AsyncIterableIterator<string> {
        driverNotProvided();
    }
    listClass(): AsyncIterableIterator<string> {
        driverNotProvided();
    }
}
export namespace StorageDriver {
    export const nullDriver = new NullDriver();
}

export class StorageManager {
    constructor(public driver: StorageDriver = StorageDriver.nullDriver) {}

    close(objOrKey: HasStorage | string): void {
        if (typeof objOrKey !== "string") {
            const obj = objOrKey;
            let storage = obj[storageStored];
            if (storage != null) {
                storage.close();
            } else {
                const classId = (obj.constructor as any)[Storage.classId];
                if (classId == null) return;

                const mainId = obj[Storage.id]();
                storage = storages.get(classId + "/" + mainId);
                if (obj[Storage.aliasId] != null) {
                    const aliasId = obj[Storage.aliasId]!();
                    if (storage == null) {
                        storage = storages.get(classId + "/" + aliasId);
                    }
                }
                if (storage != null) {
                    storage.close();
                }
            }
        } else {
            const key = objOrKey;
            const storage = storages.get(key);
            if (storage != null) {
                storage.close();
            }
        }
    }

    private _getWithoutLoad(objOrKey: HasStorage | string): StorageImpl {
        let storage: StorageImpl | undefined;
        if (typeof objOrKey !== "string") {
            const obj = objOrKey;
            storage = obj[storageStored];
            if (storage == null) {
                const classId = (obj.constructor as any)[Storage.classId];
                if (classId == null) throw Error(`The storage class does not provide the id. Please define 'static [Storage.classId]'`);
                const mainId = obj[Storage.id]();
                storage = storages.get(classId + "/" + mainId);
                let aliasId: string | null = null;
                if (obj[Storage.aliasId] != null) {
                    aliasId = obj[Storage.aliasId]!();
                    if (storage == null) {
                        storage = storages.get(classId + "/" + aliasId);
                    }
                }
                if (storage != null) {
                    storage.setContainer(obj, mainId, aliasId);
                    return storage;
                }

                storage = new StorageImpl(obj, classId, mainId, aliasId, false, this.driver);
            }
        } else {
            const key = objOrKey;
            storage = storages.get(key);
            if (storage == null) {
                let mainId: string;
                let classId: string | null;
                const idx = key.indexOf("/");
                if (idx === -1) {
                    classId = null;
                    mainId = key;
                } else {
                    classId = key.substr(0, idx);
                    mainId = key.substr(idx + 1);
                }
                storage = new StorageImpl(null, classId, mainId, null, true, this.driver);
            }
        }
        return storage;
    }

    getSync<T = unknown>(objOrKey: HasStorage | string): Storage<T> {
        return this._getWithoutLoad(objOrKey).loadSync();
    }

    get<T = unknown>(objOrKey: HasStorage | string): Promise<Storage<T>> {
        return this._getWithoutLoad(objOrKey).load();
    }

    createIndex(storageClass: StorageClassBase, indexKey: string): Promise<void> {
        const classId = storageClass[Storage.classId];
        return this.driver.createIndex(classId, indexKey);
    }

    async *search(storageClass: StorageClassBase, indexKey: string, value: unknown): AsyncIterableIterator<Storage<any>> {
        const classId = storageClass[Storage.classId];
        for await (const id of this.driver.search(classId, indexKey, value)) {
            yield await this.get(classId + "/" + id);
        }
    }

    listClass(): AsyncIterableIterator<string> {
        return this.driver.listClass();
    }

    async *list(storageClass?: StorageClassBase): AsyncIterableIterator<string> {
        const classId = storageClass == null ? null : storageClass[Storage.classId];
        for await (const id of this.driver.list(classId)) {
            yield classId + "/" + id;
        }
    }
}

declare global {
    namespace NodeJS {
        interface Module {
            [Storage.id](): string;
        }
    }
    interface NodeModule {
        [Storage.id](): string;
    }
}

Module.prototype[Storage.id] = function () {
    let rpath = path.relative(fsutil.projectPath, module.filename).replace(/\\/g, "/");
    if (rpath.endsWith(".js")) rpath = rpath.substr(0, rpath.length - 3);
    if (rpath.endsWith("/index")) rpath = rpath.substr(0, rpath.length - 6);
    return rpath;
};

(Module as any)[Storage.classId] = "module";

export const storageManager = new StorageManager();
