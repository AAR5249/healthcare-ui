"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("@medibook/utils");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, utils_1.sendError)(res, 401, 'UNAUTHORIZED', 'No token provided');
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch (error) {
        (0, utils_1.sendError)(res, 401, 'INVALID_TOKEN', 'Invalid or expired token');
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            (0, utils_1.sendError)(res, 403, 'FORBIDDEN', 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
