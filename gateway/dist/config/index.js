"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
    },
    services: {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
        appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:8002',
        notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8003',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
};
//# sourceMappingURL=index.js.map