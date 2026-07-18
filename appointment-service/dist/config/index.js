"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '8002', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medibook',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        channel: process.env.NOTIFICATION_CHANNEL || 'appointment_events',
    },
    appointment: {
        workingHoursStart: 9,
        workingHoursEnd: 17,
        slotDurationMinutes: 30,
    },
};
//# sourceMappingURL=index.js.map