#!/usr/bin/env node

import { program } from 'commander';

import { start } from './start.js';

declare global {
    namespace NodeJS {
        interface Global {
            appResources: unknown;
        }
    }
}

process.on('SIGTERM', () => {
    process.exit(0);
});
process.on('SIGINT', () => {
    process.exit(0);
});

program
    .command('start')
    .description('start the service')
    .requiredOption(
        '-f, --config-file <path>',
        'path to json config file specifying how service is to be run'
    )
    .action(async (options: { configFile: string }) => {
        global.appResources = await start(options.configFile);
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
