import * as child_process from "child_process";
import * as colors from "colors";
import * as path from "path";
import { fsutil } from "../fsutil";
import { spropsUtil } from "../serverproperties";
import * as BDS_VERSION_DEFAULT from "../version-bds.json";
import * as BDSX_CORE_VERSION_DEFAULT from "../version-bdsx.json";
import { BDSInstaller, InstallItem } from "./installercls";

const BDS_LINK_DEFAULT = "https://minecraft.azureedge.net/bin-win/bedrock-server-%BDS_VERSION%.zip";
const BDSX_CORE_LINK_DEFAULT = "https://github.com/bdsx/bdsx-core/releases/download/%BDSX_CORE_VERSION%/bdsx-core-%BDSX_CORE_VERSION%.zip";
const PDBCACHE_LINK_DEFAULT = "https://github.com/bdsx/pdbcache/releases/download/%BDS_VERSION%/pdbcache.zip";

const BDS_VERSION = process.env.BDSX_BDS_VERSION || BDS_VERSION_DEFAULT;
const BDSX_CORE_VERSION = process.env.BDSX_CORE_VERSION || BDSX_CORE_VERSION_DEFAULT;
const BDS_LINK = replaceVariable(process.env.BDSX_BDS_LINK || BDS_LINK_DEFAULT);
const BDSX_CORE_LINK = replaceVariable(process.env.BDSX_CORE_LINK || BDSX_CORE_LINK_DEFAULT);
const PDBCACHE_LINK = replaceVariable(process.env.BDSX_PDBCACHE_LINK || PDBCACHE_LINK_DEFAULT);

function replaceVariable(str: string): string {
    return str.replace(/%(.*?)%/g, (match, name: string) => {
        switch (name.toUpperCase()) {
            case "":
                return "%";
            case "BDS_VERSION":
                return BDS_VERSION;
            case "BDSX_CORE_VERSION":
                return BDSX_CORE_VERSION;
            default:
                return match;
        }
    });
}

const KEEPS_FILES = new Set([`whitelist.json`, `allowlist.json`, `valid_known_packs.json`, `server.properties`, `permissions.json`]);
const KEEPS_REGEXP = new Set([new RegExp(`config${path.sep}.*`)]);
function filterFiles(files: string[]): string[] {
    return files
        .filter(file => !KEEPS_FILES.has(file))
        .filter(v => {
            for (const reg of KEEPS_REGEXP) {
                if (reg.test(v)) {
                    return false;
                }
            }
            return true;
        });
}

const pdbcache = new InstallItem({
    name: "pdbcache",
    version: BDS_VERSION,
    url: PDBCACHE_LINK,
    targetPath: ".",
    key: "pdbcacheVersion",
    keyFile: "pdbcache.bin",
    async fallback(installer, statusCode) {
        if (statusCode !== 404) return;
        console.error(colors.yellow(`pdbcache-${BDS_VERSION} does not exist on the server`));
        console.error(colors.yellow("Generate through pdbcachegen.exe"));
        const pdbcachegen = path.join(installer.bdsPath, "pdbcachegen.exe");
        const pdbcachebin = path.join(installer.bdsPath, "pdbcache.bin");
        const bedrockserver = path.join(installer.bdsPath, "bedrock_server.exe");
        const res = child_process.spawnSync(pdbcachegen, [bedrockserver, pdbcachebin], { stdio: "inherit" });
        if (res.status !== 0) throw new InstallItem.Report(`Failed to generate pdbcache`);

        await installer.gitPublish(this, "pdbcache.bin", installer.bdsPath, "pdbcache.zip");
        return false;
    },
});

const bds = new InstallItem({
    name: "BDS",
    version: BDS_VERSION,
    url: BDS_LINK,
    targetPath: ".",
    key: "bdsVersion",
    keyFile: "bedrock_server.exe",
    skipExists: true,
    async confirm(installer) {
        console.log(`This will download and install Bedrock Dedicated Server to '${path.resolve(installer.bdsPath)}'`);
        console.log(`BDS Version: ${BDS_VERSION}`);
        console.log(`Minecraft End User License Agreement: https://account.mojang.com/terms`);
        console.log(`Privacy Policy: https://go.microsoft.com/fwlink/?LinkId=521839`);
        const ok = await installer.yesno("Do you agree to the terms above? (y/n)");
        if (!ok) throw new InstallItem.Report("Canceled");
    },
    async preinstall(installer) {
        if (installer.info.files) {
            const files = filterFiles(installer.info.files);
            // Removes KEEPS because they could have been stored before by bugs.

            await installer.removeInstalled(installer.bdsPath, files);
        }
    },
    async postinstall(installer, writtenFiles) {
        installer.info.files = filterFiles(writtenFiles);
        // `installer.info will` be saved to `bedrock_server/installinfo.json`.
        // Removes KEEPS because they don't need to be remembered.
    },
    merge: [["server.properties", spropsUtil.merge]],
});

const bdsxCore = new InstallItem({
    name: "bdsx-core",
    version: BDSX_CORE_VERSION,
    url: BDSX_CORE_LINK,
    targetPath: ".",
    key: "bdsxCoreVersion",
    keyFile: "VCRUNTIME140_1.dll",
    oldFiles: ["mods", "Chakra.pdb"],
    async fallback(installer, statusCode) {
        if (statusCode !== 404) return;
        console.error(colors.yellow(`bdsx-core-${BDSX_CORE_VERSION} does not exist on the server`));
        const corePath = path.join(fsutil.projectPath, `../bdsx-core/release/bdsx-core-${BDSX_CORE_VERSION}.zip`);
        if (await fsutil.exists(corePath)) {
            console.error(colors.yellow(`Found it from the local core project: ${corePath}`));
            await installer.gitPublish(this, corePath);
        }
        return false;
    },
});

export async function installBDS(bdsPath: string, opts: BDSInstaller.Options): Promise<boolean> {
    const installer = new BDSInstaller(bdsPath, opts);
    if (opts.skip !== undefined) {
        console.log(`Skipped by ${opts.skip}`);
        return true;
    }
    await installer.info.load();
    try {
        await bds.install(installer);
        await bdsxCore.install(installer);
        await pdbcache.install(installer);
        await installer.info.save();
        return true;
    } catch (err) {
        if (err instanceof InstallItem.Report) {
            console.error(err.message);
        } else {
            console.error(err.stack);
        }
        await installer.info.save();
        return false;
    }
}
