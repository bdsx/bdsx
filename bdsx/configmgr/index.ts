import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export class Options {
    'enabled' = true;
}

export interface Options {
    'enabled': boolean
}

export class ConfigMgr<T extends Options> {
    private readonly rootConfigPath: string = join(process.cwd(), '..', 'config');
    options: T;
    private lock: boolean;
    private modName: string;
    private configPath: string;
    private fileName: string;

    constructor
    (
        type: {new(...args : any[]): T ;},
        modName: string,
        fileName: string = 'config.json'
    )
    {
        this.modName = modName;
        this.configPath = join(this.rootConfigPath, this.modName);
        fileName = !fileName.endsWith('.json') ? fileName + '.json' : fileName;
        this.fileName = join(this.configPath, fileName);
        this.existsOrMkdir(this.rootConfigPath);
        this.existsOrMkdir(this.configPath);
        this.logger('Loading config from ' + this.fileName);
        this.load<T>(type);
    }

    private logger = (message: string) => console.log('[BDSX-ConfigMgr: ' + this.modName + '] ' + message);

    /** Create the directory if it doesn't exist. */
    private existsOrMkdir(path: string) {
        if (!existsSync(path)) mkdirSync(path);
    }

    /** Loads the intial configuration or creates it if it doesn't exist. */
    private load<T extends Options>(type: {new(...args : any[]): T ;}): void {
        try {
            this.options = JSON.parse(readFileSync(this.fileName, 'utf8'));
            const optionsModel = new type;
            let modified = false;
            for (const prop in optionsModel) {
                if (!this.options.hasOwnProperty(prop)) {
                    (this.options as any)[prop] = (optionsModel as any)[prop];
                    modified = true;
                }
            }
            if (modified) this.save();
        } catch {
            if (!this.options) {
                (this.options as any) = new type;
                this.save();
            }
        }
    }

    /** Reloads configuration from disk. Could probably be implemented later to watch for file changes instead. */
    public reload() {
        let updated: string[] = [];
        const newOptions = JSON.parse(readFileSync(this.fileName, 'utf8'));
        for (const prop in this.options) {
            if (newOptions.hasOwnProperty(prop)) {
                const key = Object.keys(this.options).indexOf(prop);
                const oldVal = Object.values(this.options)[key];
                const newVal = Object.values(newOptions)[key];
                if (oldVal != newVal) {
                    this.logger('Configuration option ' + prop + ' on disk (' + newVal + ') is different to running value (' + oldVal +'). Updating running value.');
                    updated.push(prop);
                    (this.options as any)[prop] = newVal;
                }
            }
        }
        return {
            modified: updated instanceof Array && updated.length > 0,
            updated: updated
        }
    }

    /** Saves configuration to disk. */
    public save(): void {
        const SAVE_RETRY_TIMEOUT = setTimeout(() => this.save(), 1000);
        if (this.lock) {
            this.logger(this.fileName + ' is currently locked. Will retry..');
            return;
        }
        this.lock = true;
        clearTimeout(SAVE_RETRY_TIMEOUT);
        try {
            writeFileSync(this.fileName, JSON.stringify(this.options, null, ' '));
        }
        catch {}
        finally {
            this.lock = false;
        }
    }
}
