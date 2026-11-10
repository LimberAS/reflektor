import { existsSync, mkdirSync, rmSync } from 'fs';

import { CheckRepoActions, CleanOptions, simpleGit } from 'simple-git';

import { GitSource } from './config.js';
import { GithubAppToken } from './github-app.js';
import { getSecret } from './secrets.js';
import { Source } from './source.js';

export class Git implements Source {
    private initialized = false;
    private readonly githubAppToken: GithubAppToken | undefined;

    constructor(readonly config: GitSource) {
        if (config.authorization?.type === 'github-app') {
            this.githubAppToken = new GithubAppToken(config.authorization);
        }
    }

    // Credentials are passed per command as an http.extraHeader so they are never
    // written to the remote url in .git/config of the (served) destination.
    private async gitConfig(): Promise<string[]> {
        const auth = this.config.authorization;
        if (auth === undefined) {
            return [];
        }

        let credentials: string;
        switch (auth.type) {
            case undefined:
            case 'basic': {
                credentials = `${getSecret(auth.username)}:${getSecret(auth.password)}`;
                break;
            }

            case 'github-app': {
                credentials = `x-access-token:${await this.githubAppToken!.get()}`;
                break;
            }

            default: {
                const notHandled: never = auth;
                throw new Error(`unhandled git authorization: ${JSON.stringify(notHandled)}`);
            }
        }

        const encoded = Buffer.from(credentials).toString('base64');
        return [`http.extraHeader=Authorization: Basic ${encoded}`];
    }

    async copyContent(destinationPath: string) {
        const config = await this.gitConfig();

        if (this.initialized) {
            await simpleGit({ baseDir: destinationPath, config }).pull();
            return;
        }

        const repository = `https://${this.config.repository}`;

        if (existsSync(destinationPath)) {
            const git = simpleGit({ baseDir: destinationPath, config });
            const exists = await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);
            if (exists) {
                const remotes = await git.getRemotes(true);
                const remoteRepository = remotes[0]?.refs.fetch;
                if (remoteRepository === repository) {
                    await git.clean(
                        CleanOptions.FORCE +
                            CleanOptions.RECURSIVE +
                            CleanOptions.QUIET +
                            CleanOptions.IGNORED_INCLUDED
                    );
                    await git.pull();
                    this.initialized = true;
                }
            }
        }

        if (!this.initialized) {
            rmSync(destinationPath, { recursive: true, force: true });
            mkdirSync(destinationPath);

            await simpleGit({ config }).clone(repository, destinationPath, {
                '--branch': this.config.branch,
                '--depth': '1',
            });
            this.initialized = true;
        }
    }
}
