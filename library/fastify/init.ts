import type { Server as HttpServer } from 'http';

import { configureLog } from '@limberas/reflektor-logger/configure.js';
import fastify, {
    FastifyInstance,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
} from 'fastify';

const log = configureLog('web');

export type CreatedFastifyInstance = FastifyInstance<
    HttpServer,
    RawRequestDefaultExpression<HttpServer>,
    RawReplyDefaultExpression<HttpServer>
>;

export async function createFastifyServer(): Promise<CreatedFastifyInstance> {
    const server = await fastify<
        HttpServer,
        RawRequestDefaultExpression<HttpServer>,
        RawReplyDefaultExpression<HttpServer>
    >({
        logger: log,
    });

    server.setNotFoundHandler((request, reply) => {
        reply.code(404).send({ error: 'unknown endpoint' });
    });

    server.setErrorHandler((error, request, reply) => {
        log.error({ error });
        reply.code(400).send({ error: 'that is just wrong' });
    });

    return server;
}
