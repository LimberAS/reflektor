import { sign } from 'node:crypto';

import { configureLog } from '@limberas/reflektor-logger/configure.js';

import { GithubAppAuthorization } from './config.js';
import { getSecret, getValueOrSecret } from './secrets.js';

const log = configureLog('github-app');

const DEFAULT_API_URL = 'https://api.github.com';
// Fetch a new installation token when the current one has less than this left.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

function base64url(value: string | Buffer): string {
    return Buffer.from(value).toString('base64url');
}

// RS256 JWT identifying the app, see
// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
function createAppJwt(appId: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    // iat is backdated to allow for clock drift; GitHub allows at most 10 minutes lifetime.
    const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }));
    const signature = sign('sha256', Buffer.from(`${header}.${payload}`), privateKey);
    return `${header}.${payload}.${base64url(signature)}`;
}

export class GithubAppToken {
    private cached: { token: string; expiresAt: number } | undefined;

    constructor(private readonly config: GithubAppAuthorization) {}

    async get(): Promise<string> {
        if (this.cached && this.cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
            return this.cached.token;
        }

        const appId = getValueOrSecret(this.config.appId);
        const installationId = getValueOrSecret(this.config.installationId);
        // Allow keys stored on a single line with literal "\n" separators.
        const privateKey = getSecret(this.config.privateKey).replace(/\\n/g, '\n');
        const apiUrl = (this.config.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '');

        const response = await fetch(
            `${apiUrl}/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${createAppJwt(appId, privateKey)}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'reflektor',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                body: JSON.stringify({ permissions: { contents: 'read' } }),
            }
        );

        if (!response.ok) {
            const message = await response.text();
            log.error({ githubAppTokenError: response.status, installationId, message });
            throw new Error(`github app token request failed with status ${response.status}`);
        }

        const body = (await response.json()) as { token: string; expires_at: string };
        this.cached = { token: body.token, expiresAt: Date.parse(body.expires_at) };
        log.info({ githubAppToken: 'refreshed', installationId, expiresAt: body.expires_at });
        return body.token;
    }
}
