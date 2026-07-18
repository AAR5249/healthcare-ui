"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardRateLimiter = exports.strictRateLimiter = exports.createRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};
exports.createRateLimiter = createRateLimiter;
exports.strictRateLimiter = (0, exports.createRateLimiter)(15 * 60 * 1000, 10);
exports.standardRateLimiter = (0, exports.createRateLimiter)(15 * 60 * 1000, 100);
