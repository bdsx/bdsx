
import * as child_process from 'child_process';
import * as colors from 'colors';
import { fsutil } from '../fsutil';

const projectDir = fsutil.projectPath;
const DEFAULT_OPTS = {cwd:projectDir, encoding:'ascii' as const};

let gitVersion:undefined|null|string[];

namespace git {
    export function isRepository():boolean {
        try {
            return child_process.execSync('git rev-parse --is-inside-work-tree', DEFAULT_OPTS).trim() === 'true';
        } catch (err) {
            return false;
        }
    }
    export function version():string[]|null {
        if (gitVersion !== undefined) return gitVersion;

        try {
            let res = child_process.execSync('git --version', DEFAULT_OPTS).trim();
            const numidx = res.search(/\d/);
            if (numidx !== -1) {
                res = res.substr(numidx);
            }
            gitVersion = res.split('.');
        } catch (err) {
            gitVersion = null;
        }
        return gitVersion;
    }
    export function checkVersion(major:number, minor:number):boolean {
        const v = version();
        if (v === null) return false;
        let diff = +v[0] - major;
        if (diff !== 0) return diff > 0;
        diff = +v[1] - minor;
        return diff >= 0;
    }
    export function currentBranch():string|null {
        try {
            return child_process.execSync('git rev-parse --abbrev-ref @', DEFAULT_OPTS).trim();
        } catch (err) {
            return null;
        }
    }
    export function upstream():string|null {
        try {
            const upstream = child_process.execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', DEFAULT_OPTS).trim();
            return upstream === '' ? null : upstream;
        } catch (err) {
            return null;
        }
    }
    export function remoteUpdate(remote:string):void {
        child_process.execSync(`git remote update ${remote}`, {cwd:projectDir, stdio:'inherit'});
    }
    export function mergeBaseSha1(upstream:string):string {
        return child_process.execSync(`git merge-base @ ${upstream}`, DEFAULT_OPTS).trim();
    }
    export function remoteSha1(upstream:string):string {
        return child_process.execSync(`git rev-parse ${upstream}`, DEFAULT_OPTS).trim();
    }
    export function remoteBranches():string[] {
        const remote = child_process.execSync('git branch -r', DEFAULT_OPTS).trim();
        if (remote === '') return [];
        return remote.split('\n').map(name=>name.split('->')[0].trim());
    }
}

function warn(message:string):void {
    console.error(colors.yellow('[BDSX/GIT] '+message));
}

export async function gitCheck():Promise<void> {
    switch (process.env.BDSX_SKIP_GIT_CHECK?.toLowerCase()) {
    case 'y': case 'yes': case 'true': return;
    }
    if (git.version() === null) {
        warn('GIT not found');
        warn('We recommend using GIT for the BDSX project');
        return;
    }
    if (!git.isRepository()) {
        warn('The project is not a git repository');
        warn('We recommend using GIT for the BDSX project');
        return;
    }

    let upstream = git.upstream();
    if (upstream === null) {
        warn('The project has no upstream branch');
        const branchName = git.currentBranch();
        if (branchName === null) {
            warn('The branch not found');
            return;
        } else if (branchName === 'master') {
            if (git.remoteBranches().indexOf('origin/master') === -1) {
                return; // no origin
            }
            upstream = 'origin/master';
        } else {
            return;
        }
    }

    git.remoteUpdate(upstream.split('/')[0]);
    const mergeBase = git.mergeBaseSha1(upstream);
    if (mergeBase === '') {
        warn('Unrelated histories with upstream');
    } else {
        const remote = git.remoteSha1(upstream);
        if (mergeBase !== remote) {
            warn('The project is not up-to-date');
            warn("Use 'git pull' to update the project");
        }
    }
}
