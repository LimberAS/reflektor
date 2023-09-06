import { readFileSync } from 'fs';

import { configureLog } from '@limberas/reflektor-logger/configure.js';

import { Config, configParser } from './config.js';
import { Pairs } from './pairs.js';

const log = configureLog('start');

export async function start(configFilePath: string) {
    let config: Config;

    try {
        const configRaw = JSON.parse(readFileSync(configFilePath, 'utf-8'));
        config = configParser.parse(configRaw);
    } catch (err) {
        log.error({ configReadError: err });
        throw new Error(`config read error`);
    }

    const pairs = new Pairs(config);
    return pairs.start();
}
