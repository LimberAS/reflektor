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

const valueOrSecretRef = z.union([z.string(), z.number().int().transform(String), secretRef]);

const basicAuthorization = z.object({
    type: z.optional(z.literal('basic')),
    username: secretRef,
    password: secretRef,
});

const githubAppAuthorization = z.object({
    type: z.literal('github-app'),
    appId: valueOrSecretRef,
    installationId: valueOrSecretRef,
    privateKey: secretRef,
    apiUrl: z.optional(z.string().url()),
});

const gitSource = z.object({
    type: z.enum(['git-https']),
    authorization: z.optional(z.union([githubAppAuthorization, basicAuthorization])),
    repository: z.string(),
    branch: z.string(),
    refreshTriggers: z.array(refreshTrigger),
});

const srcDestPair = z.object({
    id: z
        .string()
        .regex(/[A-Za-z0-9]+/)
        .max(100),
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

export type ValueOrSecretRef = z.infer<typeof valueOrSecretRef>;

export type GithubAppAuthorization = z.infer<typeof githubAppAuthorization>;
