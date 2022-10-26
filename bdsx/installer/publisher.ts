
import * as github from '@actions/github';
import type { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import * as path from 'path';
import { fsutil } from '../fsutil';

export class GitHubClient {
    private readonly api:RestEndpointMethods;

    constructor(githubToken:string) {
        this.api = github.getOctokit(githubToken).rest;
    }

    async createRelease(owner:string, repo:string, tag_name:string):Promise<GitHubRelease> {
        const resp = await this.api.repos.createRelease({
            owner,
            repo,
            tag_name,
        });
        return new GitHubRelease(this.api, resp, owner, repo);
    }
}

export class GitHubRelease {
    constructor(
        private readonly api:RestEndpointMethods,
        private readonly release:RestEndpointMethodTypes["repos"]["createRelease"]["response"],
        public readonly owner:string,
        public readonly repo:string,
    ) {
    }

    async upload(file:string):Promise<void> {
        const content = await fsutil.readFile(file, null);
        await this.api.repos.uploadReleaseAsset({
            url: this.release.data.upload_url,
            headers: {
                'content-length': content.length,
                'content-type': 'application/octet-stream',
            },
            data: content as any,
            name: path.basename(file),
            owner: this.owner,
            repo: this.repo,
            release_id: this.release.data.id,
        });
    }
}
