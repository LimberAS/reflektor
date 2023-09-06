import pino from 'pino';

// https://getpino.io/#/docs/help?id=multiple
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const PinoLevelToSeverityLookup: Record<string, string> = {
    trace: 'DEBUG',
    debug: 'DEBUG',
    info: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
    fatal: 'CRITICAL',
};

export const options: pino.LoggerOptions = {
    messageKey: 'message',
    formatters: {
        bindings: () => ({}),
        level: (label, number) => {
            return {
                severity: PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup['info'],
                level: number,
            };
        },
    },
    serializers: {
        req: function asReqValue(req) {
            return {
                method: req.method,
                url: req.url,
            };
        },
        err: pino.stdSerializers.err,
        res: function asResValue(reply) {
            return {
                statusCode: reply.statusCode,
            };
        },
    },
    timestamp: false,
};
