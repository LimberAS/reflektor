import { symlinkSync, rmSync } from "fs";

rmSync('.git/hooks', { force: true, recursive: true });
symlinkSync(`../.hooks`, `.git/hooks`, 'dir');

console.log('Hooks installed');