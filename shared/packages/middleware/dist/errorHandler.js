"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const utils_1 = require("@medibook/utils");
const logger = (0, utils_1.createLogger)('error-handler');
const errorHandler = (err, req, res, _next) => {
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    if (err instanceof zod_1.ZodError) {
        (0, utils_1.sendError)(res, 400, 'VALIDATION_ERROR', err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        (0, utils_1.sendError)(res, 401, 'INVALID_TOKEN', 'Invalid token');
        return;
    }
    if (err.name === 'TokenExpiredError') {
        (0, utils_1.sendError)(res, 401, 'TOKEN_EXPIRED', 'Token expired');
        return;
    }
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;
    (0, utils_1.sendError)(res, statusCode, err.code || 'SERVER_ERROR', message);
};
exports.errorHandler = errorHandler;
