import { createFastifyServer } from '@limberas/reflektor-fastify/init.js';
import { configureLog } from '@limberas/reflektor-logger/configure.js';

const log = configureLog('webtriggers');

export type WebTriggerConfig = {
    relatedOutputPath: string;
    path: string;
    token: string;
    cb: () => Promise<void>;
};

export async function startWebTriggers(triggers: WebTriggerConfig[]): Promise<void> {
    if (triggers.length < 1) {
        return Promise.resolve();
    }

    const fastify = await createFastifyServer();

    for (const [index, trigger] of triggers.entries()) {
        log.info({ configureWebTrigger: index, outputPath: trigger.relatedOutputPath });
        fastify.post(trigger.path, async (request, reply) => {
            if (request.headers.authorization !== `Bearer ${trigger.token}`) {
                reply.code(403).send({ error: 'forbidden' });
            } else {
                await trigger.cb();
                reply.code(200).send({ success: true });
            }
        });
    }

    await fastify.listen({ host: '0.0.0.0', port: 9095 });
}
