export type APIResponse = {
    d: any;
    status: number;
    error: APIError;
}

export type APIError = {
    type: string;
    cause: string;
    affectedFields: string[];
}