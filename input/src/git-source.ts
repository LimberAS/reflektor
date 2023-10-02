import { existsSync, mkdirSync, rmSync } from 'fs';

import { CheckRepoActions, CleanOptions, SimpleGit, simpleGit } from 'simple-git';

import { GitSource } from './config.js';
import { getSecret } from './secrets.js';
import { Source } from './source.js';

export class Git implements Source {
    private git: SimpleGit | undefined;

    constructor(readonly config: GitSource) {}

    async copyContent(destinationPath: string) {
        if (this.git !== undefined) {
            await this.git.pull();
        } else {
            const repository = this.config.authorization
                ? `https://${getSecret(this.config.authorization.username)}:${getSecret(
                      this.config.authorization.password
                  )}@${this.config.repository}`
                : `https://${this.config.repository}`;

            if (existsSync(destinationPath)) {
                const git = simpleGit({ baseDir: destinationPath });
                const exists = await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);
                if (exists) {
                    const remotes = await git.getRemotes(true);
                    const remoteRepository = remotes[0]?.refs.fetch;
                    if (remoteRepository === repository) {
                        this.git = git;
                        await this.git.clean(
                            CleanOptions.FORCE +
                                CleanOptions.RECURSIVE +
                                CleanOptions.QUIET +
                                CleanOptions.IGNORED_INCLUDED
                        );
                        await this.git.pull();
                    }
                }
            }

            if (this.git === undefined) {
                rmSync(destinationPath, { recursive: true, force: true });
                mkdirSync(destinationPath);

                const git = simpleGit();
                await git.clone(repository, destinationPath, {
                    '--branch': this.config.branch,
                    '--depth': '1',
                });
                git.cwd({ path: destinationPath, root: true });
                this.git = git;
            }
        }
    }
}
