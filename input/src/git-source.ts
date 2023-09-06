import { mkdirSync, rmSync } from 'fs';

import { SimpleGit, simpleGit } from 'simple-git';

import { GitSource } from './config.js';
import { getSecret } from './secrets.js';
import { Source } from './source.js';

export class Git implements Source {
    private git: SimpleGit;
    private cloned: boolean;

    constructor(readonly config: GitSource) {}

    async copyContent(destinationPath: string) {
        if (this.cloned) {
            await this.git.pull();
        } else {
            rmSync(destinationPath, { recursive: true, force: true });
            mkdirSync(destinationPath);
            const repository = this.config.authorization
                ? `https://${getSecret(this.config.authorization.username)}:${getSecret(
                      this.config.authorization.password
                  )}@${this.config.repository}`
                : `https://${this.config.repository}`;
            this.git = simpleGit({
                baseDir: destinationPath,
            });
            await this.git.clone(repository, {
                '--branch': this.config.branch,
                '--depth': '1',
            });
            this.cloned = true;
        }
    }
}
