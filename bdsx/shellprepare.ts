import * as ts from "typescript";
import glob = require('glob');
import fs = require('fs');

const BDSX_PERMANENT = process.env.BDSX_PERMANENT === 'true';
const DATA_FILE_PATH = './bedrock_server/bdsx_shell_data.ini';
const RESTART_TIME_THRESHOLD = 30000;

const data:Record<string, string> = {};
(data as any).__proto__ = null;
try {
    const lines = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    let matched:RegExpExecArray|null;
    const matcher = /^[ \t]*([^\s=]+)[ \t]*=[ \t]*([^\s]+)[ \t]*$/gm;
    while ((matched = matcher.exec(lines)) !== null) {
        data[matched[1]] = matched[2];
    }
} catch(err) {
}

function build():void {
    function getTsConfig():ts.ParsedCommandLine {
        const curdir = process.cwd();
        const configPath = ts.findConfigFile(curdir, ts.sys.fileExists);
        if (configPath == null) {
            return {
                options: ts.getDefaultCompilerOptions(),
                fileNames: glob.sync('**/*.ts'),
                errors: []
            };
        }
        const configFileJson = ts.readConfigFile(configPath, ts.sys.readFile);
        return ts.parseJsonConfigFileContent(configFileJson.config, ts.sys, curdir);
    }

    const config = getTsConfig();
    let files:string[];
    if (config.options.outDir == null && config.options.outFile == null && config.options.out == null) {
        files = [];
        for (const ts of config.fileNames) {
            if (!ts.endsWith('.ts')) continue;
            const js = ts.substr(0, ts.length-2)+'js';
            try {
                const ts_stat = fs.statSync(ts);
                const js_stat = fs.statSync(js);
                if (ts_stat.mtimeMs >= js_stat.mtimeMs) {
                    files.push(ts);
                }
            } catch (err) {
                files.push(ts);
                continue;
            }
        }
    } else {
        files = config.fileNames;
    }
    if (files.length !== 0) {
        ts.createProgram(files, config.options).emit();
    }
}

function exit(exitCode:number):never {
    delete data.exit;
    if (exitCode === 1) {
        let out = '';
        for (const name in data) {
            out += name;
            out += '=';
            out += data[name];
            out += '\n';
        }
        fs.writeFileSync(DATA_FILE_PATH, out, 'utf8');
    } else {
        try { fs.unlinkSync(DATA_FILE_PATH); } catch (err) {}
    }
    process.exit(exitCode);
}

function firstLaunch():never {
    build();
    data.startAt = Date.now()+'';
    exit(1);
}

function relaunch():void {
    console.log(`Re-Launch BDSX`);
    let counter = 3;
    setInterval(()=>{
        if (counter === 0) {
            if (BDSX_PERMANENT) build();
            exit(1);
        } else {
            console.log(counter--);
        }
    }, 1000);
}

function repeatedLaunch():void {
    const exitCode = +data.exit;
    if (exitCode !== 0) {
        console.log(`Exited with code ${(exitCode < 0  || exitCode > 0x1000000) ? '0x'+(exitCode >>> 0).toString(16) : exitCode}`);

        const startTime = +data.startAt;
        const passed = Date.now() - startTime;
        if (passed > RESTART_TIME_THRESHOLD) {
            // re-launch
            relaunch();
            return;
        }
    } else if (BDSX_PERMANENT) {
        relaunch();
        return;
    }
    exit(0);
}


if (data.exit == null) {
    firstLaunch();
} else {
    repeatedLaunch();
}
