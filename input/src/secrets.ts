import { SecretRef } from './config.js';

export function getSecret(ref: SecretRef): string {
    switch (ref.type) {
        case 'env': {
            const value = process.env[ref.var];
            if (value === undefined) {
                throw new Error(`missing env secret: ${ref.var}`);
            }
            return value;
        }

        default: {
            const notHandled: never = ref.type;
            throw new Error(`unhandled secret ref type: ${notHandled}`);
        }
    }
}
