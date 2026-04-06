export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: unknown | undefined;
    constructor(statusCode: number, code: string, message: string, details?: unknown | undefined);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: unknown);
}
export declare class NotFoundError extends AppError {
    constructor(message: string);
}
export declare class InternalError extends AppError {
    constructor(message: string, details?: unknown);
}
//# sourceMappingURL=AppError.d.ts.map