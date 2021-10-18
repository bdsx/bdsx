"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installMinecraftAddons = void 0;
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const colors = require("colors");
const stripJsonComments = require("strip-json-comments");
const fsutil_1 = require("./fsutil");
const ProgressBar = require("progress");
const serverproperties_1 = require("./serverproperties");
var Provider;
(function (Provider) {
    Provider[Provider["Server"] = 0] = "Server";
    Provider[Provider["World"] = 1] = "World";
    Provider[Provider["BDSX"] = 2] = "BDSX";
})(Provider || (Provider = {}));
var PackDirectoryType;
(function (PackDirectoryType) {
    PackDirectoryType["ResourcePacks"] = "resource_packs";
    PackDirectoryType["BehaviorPacks"] = "behavior_packs";
})(PackDirectoryType || (PackDirectoryType = {}));
class PackInfo {
    constructor(packPath, managedDirPath, managedName, manifest) {
        this.managedName = managedName;
        this.path = packPath;
        this.name = manifest.header.name.replace(/\W/g, '');
        this.managedPath = managedDirPath + '/' + managedName;
        this.uuid = manifest.header.uuid;
        this.version = manifest.header.version || manifest.header.modules[0].version;
        if (manifest.modules != null) {
            this.type = manifest.modules[0].type.toLowerCase();
        }
        else if (manifest.header.modules != null) {
            this.type = manifest.header.modules[0].type.toLowerCase();
        }
        else {
            throw new Error(`${path}: modules not found.`);
        }
        switch (this.type) {
            case 'data':
                this.directoryType = PackDirectoryType.BehaviorPacks;
                break;
            case 'resources':
                this.directoryType = PackDirectoryType.ResourcePacks;
                break;
            case 'javascript':
                this.directoryType = PackDirectoryType.BehaviorPacks;
                break;
        }
    }
    isResourcePack() {
        return this.type === 'resources';
    }
    isBehaviorPack() {
        return this.type === 'data' || this.type === 'javascript';
    }
    static async createFrom(packPath, hostManagePath, managedName) {
        const menifestPath = await findFiles(manifestNames, packPath);
        if (menifestPath === null) {
            console.error(colors.red(`[MCAddons] ${hostManagePath}/${managedName}: menifest not found`));
            return null;
        }
        const json = await fsutil_1.fsutil.readFile(menifestPath);
        const manifest = JSON.parse(stripJsonComments(json));
        return new PackInfo(packPath, hostManagePath, managedName, manifest);
    }
}
class PackDirectory {
    constructor(host, type, path, managedPath) {
        this.host = host;
        this.type = type;
        this.path = path;
        this.managedPath = managedPath;
        this.packs = new Map();
        this.loaded = false;
    }
    async _load() {
        if (this.loaded)
            return;
        this.loaded = true;
        this.packs.clear();
        const packs = await fsutil_1.fsutil.readdir(this.path);
        for (const packName of packs) {
            const packPath = path.join(this.path, packName);
            try {
                const pack = await PackInfo.createFrom(packPath, this.managedPath, packName);
                if (pack === null) {
                    continue;
                }
                if (this.type !== null && pack.directoryType !== this.type) {
                    console.error(colors.red(`[MCAddons] ${this.managedPath}/${packName}: addon directory unmatched (pack = ${pack.directoryType}, host = ${this.type})`));
                    continue;
                }
                this.packs.set(pack.uuid, pack);
            }
            catch (err) {
                if (err.code === 'ENOENT') { // broken link
                    console.error(colors.yellow(`[MCAddons] ${this.managedPath}/${packName}: Link is broken, removing`));
                    await fsutil_1.fsutil.unlinkQuiet(packPath);
                    continue;
                }
                console.trace(colors.red(`[MCAddons] ${this.managedPath}/${packName}: ${err && err.message}`));
            }
        }
    }
    async makeLink(pack) {
        await dirmaker.make(this.path);
        await this._load();
        const already = this.packs.get(pack.uuid);
        const installPath = this.path + path.sep + pack.name;
        if (already == null) {
            try {
                await fsutil_1.fsutil.symlink(pack.path, installPath, 'junction');
            }
            catch (err) {
                if (err.code === 'ENOENT') { // broken link
                    console.error(colors.yellow(`[MCAddons] addons/${pack.managedName}: Link is broken, fixing`));
                    await fsutil_1.fsutil.unlinkQuiet(pack.path);
                    await fsutil_1.fsutil.symlink(pack.path, installPath, 'junction');
                }
            }
        }
        else {
            if (!await isLink(already.path)) {
                console.error(colors.yellow(`[MCAddons] addons/${pack.managedName}: already exist`));
            }
        }
        return installPath;
    }
    /**
     * delete if it's symlink
     */
    async unlink(mpack) {
        if (mpack.uuid !== null) {
            this.packs.delete(mpack.uuid);
        }
        const installPath = this.path + path.sep + mpack.packName;
        try {
            if (!(await isLink(installPath))) {
                console.error(colors.yellow(`[MCAddons] ${installPath}: Skip removing. is not installed by bdsx.`));
                return;
            }
        }
        catch (err) {
            if (err.code !== 'ENOENT')
                throw err;
        }
        await fsutil_1.fsutil.unlinkQuiet(installPath);
    }
}
var ZipType;
(function (ZipType) {
    ZipType[ZipType["mcaddon"] = 0] = "mcaddon";
    ZipType[ZipType["mcpack"] = 1] = "mcpack";
    ZipType[ZipType["zip"] = 2] = "zip";
})(ZipType || (ZipType = {}));
class ManagedPack {
    constructor(managedName) {
        this.managedName = managedName;
        this.state = ManagedPackState.Removed;
        this.installMTime = null;
        this.directory = null;
        this.zip = null;
        this.zipType = null;
        this.uuid = null;
        this.packName = null;
        this.pack = null;
    }
    checkUpdated(targetTime) {
        return this.installMTime === null || targetTime > this.installMTime;
    }
    async loadPack() {
        if (this.pack !== null)
            return this.pack;
        if (this.directory === null)
            throw Error(`${this.managedName}: does not have directory`);
        const pack = await PackInfo.createFrom(this.directory.path, 'addons', this.managedName);
        if (pack === null) {
            throw Error(`${this.managedName}: does not have pack`);
        }
        this.pack = pack;
        this.uuid = pack.uuid;
        this.packName = pack.name;
        return pack;
    }
    static fromJson(managedName, json) {
        const [mtime, zipType, packName, uuid] = json;
        const mpack = new ManagedPack(managedName);
        mpack.installMTime = mtime;
        mpack.uuid = uuid || null;
        mpack.packName = packName || null;
        mpack.zipType = zipType;
        return mpack;
    }
    toJson() {
        if (this.uuid !== null) {
            return [this.installMTime, this.zipType, this.packName, this.uuid];
        }
        else {
            return [this.installMTime, this.zipType];
        }
    }
}
class BdsxPackDirectory {
    constructor(worldPath, worldName) {
        this.worldName = worldName;
        this.loaded = false;
        this.modified = false;
        this.managedPacks = new Map();
        this.bdsxAddonsJsonPath = worldPath + path.sep + 'addons_from_bdsx.json';
    }
    async getPacks() {
        await this._load();
        return this.managedPacks.values();
    }
    _getManagedPack(stat, addonName) {
        let packName = stat.name;
        if (addonName != null)
            packName += '/' + addonName;
        let newPack = false;
        let mpack = this.managedPacks.get(packName);
        if (mpack == null) {
            mpack = new ManagedPack(packName);
            mpack.state = ManagedPackState.Added;
            newPack = true;
        }
        else {
            if (mpack.state === ManagedPackState.Removed) {
                mpack.state = ManagedPackState.Already;
            }
        }
        if (stat.isDirectory) {
            mpack.directory = stat;
        }
        else {
            let zipType;
            if (stat.base.endsWith('.mcaddon')) {
                zipType = ZipType.mcaddon;
            }
            else if (stat.base.endsWith('.mcpack')) {
                zipType = ZipType.mcpack;
            }
            else if (stat.base.endsWith('.zip')) {
                zipType = ZipType.zip;
            }
            else {
                console.error(colors.red(`[MCAddons] Unexpected file: addons/${stat}`));
                return null;
            }
            if (mpack.zipType === null) {
                mpack.zipType = zipType;
                mpack.zip = stat;
            }
            else {
                if (mpack.zipType !== zipType) {
                    console.error(colors.red(`[MCAddons] Pack type conflict. (new=${stat.base}, old=${stat.name}.${ZipType[mpack.zipType]})`));
                    console.error(colors.red(`Please rename it to make it sure`));
                }
                else {
                    mpack.zip = stat;
                }
            }
        }
        if (newPack) {
            this.managedPacks.set(mpack.managedName, mpack);
        }
        return mpack;
    }
    async _addDirectory(mpack) {
        try {
            let files = null;
            if (mpack.zip !== null) {
                if (mpack.directory === null || mpack.zip.mtime > mpack.directory.mtime) {
                    console.error(`[MCAddons] ${mpack.managedName}.${ZipType[mpack.zipType]}: unzip`);
                    mpack.directory = await this._makeDirectory(mpack.zip);
                    files = await unzip(mpack.managedName, mpack.zip, mpack.directory, true);
                }
            }
            else if (mpack.directory === null) {
                console.trace(`[MCAddons] ${mpack.managedName}: does not have zip or directory`);
                return;
            }
            if (!mpack.checkUpdated(mpack.directory.mtime)) {
                return;
            }
            mpack.installMTime = mpack.directory.mtime;
            const dirName = mpack.managedName;
            if (mpack.zipType === ZipType.mcpack) {
                await mpack.loadPack();
                return;
            }
            if (files == null)
                files = await readdirWithStats(mpack.directory.path);
            const packFiles = [];
            if (mpack.zipType === ZipType.mcaddon) {
                for (const stat of files) {
                    if (stat.isDirectory) {
                        packFiles.push(stat);
                    }
                    else if (stat.base.endsWith('.mcpack')) {
                        packFiles.push(stat);
                    }
                }
            }
            else {
                for (const stat of files) {
                    if (stat.isDirectory) {
                        packFiles.push(stat);
                    }
                    else if (mpack.zipType === ZipType.mcaddon) {
                        if (stat.base.endsWith('.mcpack')) {
                            packFiles.push(stat);
                        }
                    }
                    else if (manifestNames.has(stat.base)) {
                        mpack.zipType = ZipType.mcpack;
                        await mpack.loadPack();
                        return;
                    }
                    else if (stat.base.endsWith('.mcpack')) {
                        mpack.zipType = ZipType.mcaddon;
                        packFiles.push(stat);
                    }
                }
            }
            const mpacks = new Set();
            for (const unzipped of packFiles) {
                const mpack = this._getManagedPack(unzipped, dirName);
                if (mpack === null)
                    continue;
                mpack.zipType = ZipType.mcpack;
                mpacks.add(mpack);
            }
            for (const mpack of mpacks) {
                await this._addDirectory(mpack);
            }
        }
        catch (err) {
            console.trace(colors.red(`[MCAddons] addons/${mpack.managedName}: ${err && err.message}`));
        }
    }
    async _makeDirectory(zip) {
        const dirPath = path.dirname(zip.path) + path.sep + zip.name;
        await dirmaker.make(dirPath);
        return {
            base: zip.name,
            path: dirPath,
            isDirectory: true,
            mtime: Date.now(),
            name: zip.name,
            size: 0
        };
    }
    async _load() {
        if (this.loaded)
            return;
        this.loaded = true;
        const managedInfos = await readObjectJson(this.bdsxAddonsJsonPath);
        for (const name in managedInfos) {
            const mpack = ManagedPack.fromJson(name, managedInfos[name]);
            this.managedPacks.set(name, mpack);
        }
        const packFiles = await readdirWithStats(addonsPath);
        for (const stat of packFiles) {
            if (!stat.isDirectory && (stat.base.endsWith('.txt') || stat.base.endsWith('.md') || stat.base.endsWith('.html'))) {
                continue; // Ignore READMEs or similiar things.
            }
            this._getManagedPack(stat); // make managed packs from zip or directory or both
        }
        for (const pack of this.managedPacks.values()) {
            if (pack.state === ManagedPackState.Removed)
                continue;
            await this._addDirectory(pack);
        }
    }
    async save() {
        if (!this.modified)
            return;
        const obj = {};
        for (const managedPack of this.managedPacks.values()) {
            if (managedPack.state !== ManagedPackState.Removed) {
                obj[managedPack.managedName] = managedPack.toJson();
            }
        }
        await fsutil_1.fsutil.writeJson(this.bdsxAddonsJsonPath, obj);
    }
}
var ManagedPackState;
(function (ManagedPackState) {
    ManagedPackState[ManagedPackState["Removed"] = 0] = "Removed";
    ManagedPackState[ManagedPackState["Already"] = 1] = "Already";
    ManagedPackState[ManagedPackState["Added"] = 2] = "Added";
})(ManagedPackState || (ManagedPackState = {}));
class PackManager {
    constructor(provider, jsonPath) {
        this.provider = provider;
        this.jsonPath = jsonPath;
        this.data = [];
        this.loaded = false;
        this.modified = false;
    }
    async _load() {
        if (this.loaded)
            return;
        this.loaded = true;
        this.data.length = 0;
        try {
            const json = await fsutil_1.fsutil.readFile(this.jsonPath);
            const result = JSON.parse(json);
            if (result instanceof Array) {
                this.data = result;
            }
        }
        catch (err) {
        }
    }
    async save() {
        if (!this.modified)
            return;
        await dirmaker.make(path.dirname(this.jsonPath));
        await fsutil_1.fsutil.writeJson(this.jsonPath, this.data);
    }
    async uninstall(mpack) {
        if (mpack.uuid === null)
            throw TypeError(`${mpack.managedName}: does not have uuid`);
        await this._load();
        const packIndex = this._indexOf(mpack.uuid);
        if (packIndex !== -1) {
            this.data.splice(packIndex, 1);
            this.modified = true;
        }
    }
}
class WorldPackManager extends PackManager {
    constructor(type, worldPath, worldName) {
        super(Provider.World, `${worldPath}${path.sep}world_${type}.json`);
        this.type = type;
        this.installed = new PackDirectory(Provider.World, type, worldPath + path.sep + type, `${worldName}/${type}`);
    }
    _indexOf(uuid) {
        return this.data.findIndex(v => v.pack_id === uuid);
    }
    async install(mpack) {
        const pack = await mpack.loadPack();
        await this.installed.makeLink(pack);
        await this._load();
        const wpack = {
            pack_id: pack.uuid,
            version: pack.version
        };
        const already = this.data.findIndex(v => v.pack_id === mpack.uuid);
        if (already !== -1) {
            this.data.splice(already, 1, wpack);
        }
        else {
            this.data.unshift(wpack);
        }
        this.modified = true;
    }
    async uninstall(mpack) {
        await super.uninstall(mpack);
        await this.installed.unlink(mpack);
    }
}
class ServerPackManager extends PackManager {
    constructor(jsonPath) {
        super(Provider.Server, jsonPath);
        this.installedResources = new PackDirectory(Provider.Server, PackDirectoryType.ResourcePacks, bdsPath + path.sep + 'resource_packs', 'bedrock_server/resource_packs');
        this.installedBehaviors = new PackDirectory(Provider.Server, PackDirectoryType.BehaviorPacks, bdsPath + path.sep + 'behavior_packs', 'bedrock_server/behavior_packs');
    }
    _indexOf(uuid) {
        return this.data.findIndex(v => v.uuid === uuid);
    }
    getPackDirectory(type) {
        switch (type) {
            case PackDirectoryType.ResourcePacks:
                return this.installedResources;
            case PackDirectoryType.BehaviorPacks:
                return this.installedBehaviors;
        }
    }
    async install(mpack) {
        const pack = await mpack.loadPack();
        await this.getPackDirectory(pack.directoryType).makeLink(pack);
        await this._load();
        const already = this.data.findIndex(v => v.uuid === pack.uuid);
        const spack = {
            file_system: "RawPath",
            path: `${pack.directoryType}/${pack.name}`,
            uuid: pack.uuid,
            version: `${pack.version[0]}.${pack.version[1]}.${pack.version[2]}`
        };
        if (already !== -1) {
            this.data.splice(already, 1, spack);
        }
        else {
            this.data.splice(1, 0, spack);
        }
        this.modified = true;
    }
    async uninstall(mpack) {
        await super.uninstall(mpack);
        await this.installedResources.unlink(mpack);
        await this.installedBehaviors.unlink(mpack);
    }
}
async function readObjectJson(path) {
    try {
        const json = await fsutil_1.fsutil.readFile(path);
        const result = JSON.parse(json);
        if (result === null || !(result instanceof Object)) {
            return Object.create(null);
        }
        result.__proto__ = null;
        return result;
    }
    catch (err) {
        return Object.create(null);
    }
}
async function readdirWithStats(dirPath) {
    try {
        const files = await fsutil_1.fsutil.readdir(dirPath);
        const out = [];
        for (const fileName of files) {
            const filePath = dirPath + path.sep + fileName;
            const stat = await fsutil_1.fsutil.stat(filePath);
            const extidx = fileName.lastIndexOf('.');
            out.push({
                name: extidx === -1 ? fileName : fileName.substr(0, extidx),
                path: filePath,
                base: fileName,
                isDirectory: stat.isDirectory(),
                mtime: +stat.mtime,
                size: stat.size
            });
        }
        return out;
    }
    catch (err) {
        if (err.code === 'ENOENT')
            return [];
        else
            throw err;
    }
}
async function unzip(name, zip, targetDir, getRootFiles = false) {
    const bar = new ProgressBar(`${name}: Unzip :bar :current/:total`, zip.size);
    const rootFiles = getRootFiles ? new Map() : null;
    await fs.createReadStream(zip.path)
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
        bar.tick(entry.vars.compressedSize);
        if (rootFiles !== null) {
            const rootedFile = /^[/\\]?([^/\\]+)([/\\]?)/.exec(entry.path);
            if (rootedFile !== null) {
                const fileName = rootedFile[1];
                if (!rootFiles.has(fileName)) {
                    const extidx = fileName.lastIndexOf('.');
                    rootFiles.set(fileName, {
                        name: extidx === -1 ? fileName : fileName.substr(0, extidx),
                        path: targetDir.path + path.sep + fileName,
                        base: fileName,
                        isDirectory: rootedFile[2] !== '' || entry.type === 'Directory',
                        mtime: entry.vars.lastModifiedTime,
                        size: entry.extra.uncompressedSize
                    });
                }
            }
        }
        const targetPath = path.join(targetDir.path, entry.path);
        await dirmaker.make(path.dirname(targetPath));
        if (entry.type === 'File') {
            entry.pipe(fs.createWriteStream(targetPath));
        }
    }).promise();
    bar.update(bar.total);
    bar.terminate();
    if (targetDir.mtime < zip.mtime) {
        await fsutil_1.fsutil.utimes(targetDir.path, zip.mtime, zip.mtime);
    }
    return (rootFiles !== null) ? [...rootFiles.values()] : null;
}
async function findFiles(filenames, directory) {
    const directories = [path.resolve(directory)];
    const files = [];
    for (;;) {
        for (const dir of directories) {
            const contents = await fsutil_1.fsutil.readdir(dir);
            for (const file of contents) {
                const filepath = dir + path.sep + file;
                if (filenames.has(file))
                    return path.join(filepath);
                files.push(filepath);
            }
        }
        directories.length = 0;
        for (const file of files) {
            if (await fsutil_1.fsutil.isDirectory(file)) {
                directories.push(file);
            }
        }
        files.length = 0;
        if (directories.length === 0) {
            return null;
        }
    }
}
async function isLink(filepath) {
    return (await fsutil_1.fsutil.lstat(filepath)).isSymbolicLink();
}
const projectPath = fsutil_1.fsutil.projectPath;
const bdsPath = projectPath + path.sep + 'bedrock_server';
const addonsPath = projectPath + path.sep + 'addons';
const manifestNames = new Set(['manifest.json', 'pack_manifest.json']);
const dirmaker = new fsutil_1.fsutil.DirectoryMaker;
dirmaker.dirhas.add(projectPath);
async function installMinecraftAddons() {
    await dirmaker.make(bdsPath);
    const worldName = serverproperties_1.serverProperties['level-name'] || 'Bedrock level';
    const worldPath = bdsPath + path.sep + 'worlds' + path.sep + worldName;
    const serverPacks = new ServerPackManager(bdsPath + path.sep + 'valid_known_packs.json');
    const worldResources = new WorldPackManager(PackDirectoryType.ResourcePacks, worldPath, worldName);
    const worldBehaviors = new WorldPackManager(PackDirectoryType.BehaviorPacks, worldPath, worldName);
    const bdsxPacks = new BdsxPackDirectory(worldPath, worldName);
    function getWorldPackManager(type) {
        switch (type) {
            case PackDirectoryType.ResourcePacks:
                return worldResources;
            case PackDirectoryType.BehaviorPacks:
                return worldBehaviors;
        }
    }
    for (const mpack of await bdsxPacks.getPacks()) {
        switch (mpack.state) {
            case ManagedPackState.Removed:
                if (mpack.uuid !== null) {
                    await worldResources.uninstall(mpack);
                    await worldBehaviors.uninstall(mpack);
                    await serverPacks.uninstall(mpack);
                    console.log(colors.red(`[MCAddons] addons/${mpack.managedName}: removed`));
                    bdsxPacks.modified = true;
                }
                break;
            case ManagedPackState.Added: {
                if (mpack.pack !== null) {
                    await getWorldPackManager(mpack.pack.directoryType).install(mpack);
                    await serverPacks.install(mpack);
                    bdsxPacks.modified = true;
                    console.log(colors.green(`[MCAddons] addons/${mpack.managedName}: added`));
                }
                break;
            }
            case ManagedPackState.Already:
                console.log(`[MCAddons] addons/${mpack.managedName}`);
                break;
        }
    }
    await serverPacks.save();
    await worldResources.save();
    await worldBehaviors.save();
    await bdsxPacks.save();
}
exports.installMinecraftAddons = installMinecraftAddons;
//# sourceMappingURL=addoninstaller.js.map