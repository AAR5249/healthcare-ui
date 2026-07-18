"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.jwtMiddleware = exports.isPublicPath = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('gateway-middleware');
const publicPaths = [
    '/api-docs',
    '/health',
    '/metrics',
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
];
const publicPathPatterns = [
    /^\/auth\/health$/,
];
const isPublicPath = (path) => {
    if (publicPaths.some(p => path.startsWith(p)))
        return true;
    if (publicPathPatterns.some(p => p.test(path)))
        return true;
    return false;
};
exports.isPublicPath = isPublicPath;
const jwtMiddleware = (req, res, next) => {
    if ((0, exports.isPublicPath)(req.path)) {
        next();
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED',
            message: 'No token provided',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'TOKEN_EXPIRED',
                message: 'Token has expired',
            });
            return;
        }
        res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Invalid token',
        });
    }
};
exports.jwtMiddleware = jwtMiddleware;
const errorHandler = (err, req, res, _next) => {
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=auth.js.map