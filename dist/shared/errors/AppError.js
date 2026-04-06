"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(400, 'VALIDATION_ERROR', message, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message) {
        super(404, 'NOT_FOUND', message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class InternalError extends AppError {
    constructor(message, details) {
        super(500, 'INTERNAL_ERROR', message, details);
        this.name = 'InternalError';
    }
}
exports.InternalError = InternalError;
//# sourceMappingURL=AppError.js.map