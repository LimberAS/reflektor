#!/usr/bin/env node

import { build } from 'esbuild';

/**
 * @type import('esbuild').build
 */
await build({
    entryPoints: ['./src/bin.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['node20'],
    outfile: `./dist/bin.js`,
    platform: 'node',
    format: 'esm',
    treeShaking: true,
    banner: {
        js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
    },
});
