import type { AstroRuntimeLogger } from "astro";
import type { APIError } from ".";
import { 
    BadRequestError, 
    RecordConflictError, 
    RecordNotFoundError, 
    TokenMalformedError, 
    TokenRevokedError, 
    TokenTimedoutError, 
    ApplicationError 
} from "../lib/errors";

export function buildResponse(status: number, d: any, error: APIError | null) {
    return new Response(JSON.stringify({
        status: status,
        d: d,
        error: error,
    }), {
        status: status,
        headers: { "Content-Type": "application/json" },
    });
}

function logError(logger: AstroRuntimeLogger, error: Error) {
    let logMsg = `[${error.name}]: ${error.message}`;

    if ('typ' in error && error.typ) {
        logMsg = `(${error.typ}) ${logMsg}`;
    }
    if ('id' in error && error.id) {
        logMsg = `[ID: ${error.id}] ${logMsg}`;
    }

    if (error.stack) {
        logMsg += `\nStack Trace:\n${error.stack}`;
    }
    logger.error(logMsg);
}

export function handleErrors(logger: AstroRuntimeLogger, err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    
    logError(logger, error);

    if (error instanceof BadRequestError) {
        return buildResponse(400, null, {
            cause: error.message,
            affectedFields: error.fields,
            type: error.typ,
        });
    }

    if (error instanceof RecordConflictError) {
        return buildResponse(409, null, {
            cause: error.message,
            affectedFields: [error.field],
            type: error.typ,
        });
    }

    if (error instanceof RecordNotFoundError) {
        return buildResponse(404, null, {
            cause: error.message,
            affectedFields: [],
            type: error.typ,
        });
    }

    if (error instanceof TokenMalformedError) {
        return buildResponse(406, null, {
            cause: error.message,
            affectedFields: [],
            type: error.typ,
        });
    }

    if (error instanceof TokenTimedoutError) {
        return buildResponse(417, null, {
            cause: error.message,
            affectedFields: [],
            type: error.typ,
        });
    }

    if (error instanceof TokenRevokedError) {
        return buildResponse(403, null, {
            cause: error.message,
            affectedFields: [],
            type: error.typ,
        });
    }

    return buildResponse(500, null, {
        cause: error.message || "Internal server error",
        affectedFields: [],
        type: "INTERNAL_SERVER_ERROR",
    });
}