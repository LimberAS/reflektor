import pino from 'pino';

import { options as gkeOptions } from './gke.js';

const loggerMode = process.env['REFLEKTOR_LOGGER_MODE'];

let logger: pino.Logger;

if (loggerMode === 'gke') {
    logger = pino(gkeOptions);
} else {
    logger = pino(
        {
            level: 'info',
            formatters: {
                bindings: (b) => ({
                    pid: b.pid,
                }),
            },

            timestamp: true,
        },
        process.stderr
    );
}

export function configureLog(name: string, options?: { logLevel?: pino.Level }) {
    return logger.child(
        { src: name },
        {
            level: options?.logLevel || process.env['LOG_LEVEL'] || logger.level,
        }
    );
}
