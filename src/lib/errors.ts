export class ApplicationError extends Error {
    public id: string;
    public error: any;
    public typ: string;

    override name = "ApplicationError";

    constructor(typ: string, error?: any) {
        const id = crypto.randomUUID();
        const errorMessage = JSON.stringify({
            id,
            origin,
            typ,
            trace: error instanceof Error ? error.stack || error.message : (error || null)
        });

        super(errorMessage, { cause: error });

        this.id = id;
        this.error = error;
        this.typ = typ;

        Object.setPrototypeOf(this, new.target.prototype);

        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, new.target);
        }
    }
}

export class TokenMalformedError extends ApplicationError {
    override name = "TokenMalformedError";
    constructor(error?: any) {
        super("TOKEN_MALFORMED", error);
    }
}

export class UnexpectedRequestError extends ApplicationError {
    public expected = {};
    public recived = {};

    override name = "UnexpectedReqestError";
    constructor(expected: Record<string, string>, received: Record<string, string>, error?: any) {
        super("UNEXPECTED_ERROR", error);

        this.expected = expected;
        this.recived = received;
    }
}

export class TokenTimedoutError extends ApplicationError {
    override name = "TokenTimedoutError";
    constructor(error?: any) {
        super("TOKEN_TIMEDOUT", error);
    }
}

export class TokenRevokedError extends ApplicationError {
    override name = "TokenRevokedError";
    constructor(error?: any) {
        super("TOKEN_REVOKED", error);
    }
}
export class RecordConflictError extends ApplicationError {
    override name = "RecordConflictError";
    constructor(error?: any) {
        super("RECORD_CONFLICT", error);
    }
}

export class RecordNotFoundError extends ApplicationError {
    override name = "RecordNotFoundError";
    constructor(error?: any) {
        super("RECORD_NOT_FOUND", error);
    }
}