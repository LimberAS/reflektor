import { z } from 'zod';

const secretRef = z.object({
    type: z.enum(['env']),
    var: z.string(),
});

const refreshTrigger = z.object({
    type: z.enum(['web']),
    authorization: z.object({
        bearer: secretRef,
    }),
});

const gitSource = z.object({
    type: z.enum(['git-https']),
    authorization: z.optional(
        z.object({
            username: secretRef,
            password: secretRef,
        })
    ),
    repository: z.string(),
    branch: z.string(),
    refreshTriggers: z.array(refreshTrigger),
});

const srcDestPair = z.object({
    source: gitSource, // .or more types here
    destination: z.object({
        path: z.string(),
    }),
});

export const configParser = z.array(srcDestPair).min(1);

export type SrcDestPair = z.infer<typeof srcDestPair>;

export type Config = z.infer<typeof configParser>;

export type SecretRef = z.infer<typeof secretRef>;

export type GitSource = z.infer<typeof gitSource>;
