
import * as child_process from 'child_process';
import * as colors from 'colors';
import * as path from 'path';
import { fsutil } from '../fsutil';

export async function gitCheck():Promise<void> {
    if (!await fsutil.exists(path.join(fsutil.projectPath, '.git'))) {
        console.error(colors.yellow('[BDSX] .git does not found'));
        console.error(colors.yellow('[BDSX] We recommend using GIT for BDSX project'));
    } else {
        const opts = {cwd:fsutil.projectPath, encoding:'ascii' as const};
        const branchName = child_process.execSync('git rev-parse --abbrev-ref HEAD', opts).trim();
        if (branchName === 'master') { // check only for the master branch
            child_process.execSync('git remote update origin', {cwd:fsutil.projectPath, stdio:'inherit'});
            const mergeBase = child_process.execSync('git merge-base @ origin', opts).trim();
            const remote = child_process.execSync('git rev-parse origin', opts).trim();
            if (mergeBase !== remote) {
                console.error(colors.yellow("[BDSX] This project is not up-to-date"));
                console.error(colors.yellow("[BDSX] Use 'git pull' to update your project"));
            }
        }
    }
}
