import { configureLog } from '@limberas/reflektor-logger/configure.js';

import { Config, SrcDestPair } from './config.js';
import { Git } from './git-source.js';
import { getSecret } from './secrets.js';
import type { Source } from './source.js';
import { WebTriggerConfig, startWebTriggers } from './web-trigger.js';

const log = configureLog('pairs');

export class Pairs {
    constructor(private readonly config: Config) {}

    private createTriggerCallback(pair: SrcDestPair): () => Promise<void> {
        let source: Source;

        switch (pair.source.type) {
            case 'git-https': {
                source = new Git(pair.source);
                break;
            }

            default: {
                const notHandled: never = pair.source.type;
                throw new Error(`unhandled source: ${notHandled}`);
            }
        }

        let copyInProgress = false;

        type Waiter = (outcome: Error | true) => void;
        let waiters: Waiter[] = [];

        return async () => {
            if (copyInProgress) {
                log.info({
                    copy: 'inProgress',
                    path: pair.destination.path,
                    waiters: waiters.length + 1,
                });
                return new Promise<void>((resolve, reject) => {
                    waiters.push((outcome: Error | true) => {
                        if (outcome instanceof Error) {
                            console.log('ere');
                            reject(outcome.message);
                        } else {
                            resolve();
                        }
                    });
                });
            } else {
                copyInProgress = true;
                const needsNotifying: Waiter[] = [];
                let outcome: Error | true;

                try {
                    let copyUpdated = false;
                    while (!copyUpdated) {
                        log.info({ copy: 'start', path: pair.destination.path });
                        await source.copyContent(pair.destination.path);
                        const triggeredDuringCopy = [...waiters];
                        needsNotifying.push(...triggeredDuringCopy);
                        waiters = [];
                        if (triggeredDuringCopy.length === 0) {
                            copyUpdated = true;
                            log.info({
                                copy: 'complete',
                                path: pair.destination.path,
                            });
                        } else {
                            log.info({
                                copy: 'newTriggers',
                                path: pair.destination.path,
                                waiting: needsNotifying.length + 1,
                            });
                        }
                    }
                    outcome = true;
                } catch (err) {
                    outcome = err;
                }

                copyInProgress = false;
                for (const waiter of needsNotifying) {
                    waiter(outcome);
                }

                if (outcome instanceof Error) {
                    throw outcome;
                }
            }
        };
    }

    async start(): Promise<void> {
        const webTriggers: WebTriggerConfig[] = [];
        const configuredOutputPaths = new Set<string>();

        for (const pair of this.config) {
            if (configuredOutputPaths.has(pair.destination.path)) {
                throw new Error(`output path already configured: ${pair.destination.path}`);
            } else {
                configuredOutputPaths.add(pair.destination.path);
            }

            const cb = this.createTriggerCallback(pair);

            for (const trigger of pair.source.refreshTriggers) {
                switch (trigger.type) {
                    case 'web': {
                        webTriggers.push({
                            relatedOutputPath: pair.destination.path,
                            cb,
                            path: `/triggers/${webTriggers.length}`,
                            token: getSecret(trigger.authorization.bearer),
                        });
                        break;
                    }

                    default: {
                        const notHandled: never = trigger.type;
                        throw new Error(`unhandled trigger: ${JSON.stringify(notHandled)}`);
                    }
                }
            }

            await cb();
        }

        await startWebTriggers(webTriggers);
    }
}
