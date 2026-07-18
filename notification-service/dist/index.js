"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const utils_1 = require("@medibook/utils");
const middleware_1 = require("@medibook/middleware");
const routes_1 = __importDefault(require("./routes"));
const prisma_1 = __importDefault(require("./config/prisma"));
const eventListener_1 = require("./eventListener");
const logger = (0, utils_1.createLogger)('notification-service');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(middleware_1.metricsMiddleware);
app.use('/notifications', routes_1.default);
app.get('/metrics', middleware_1.metricsEndpoint);
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'notification-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
app.use(middleware_1.errorHandler);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Route not found',
    });
});
const server = app.listen(config_1.config.port, () => {
    logger.info(`Notification service running on port ${config_1.config.port}`, {
        port: config_1.config.port,
        environment: config_1.config.nodeEnv,
    });
});
const gracefulShutdown = async () => {
    logger.info('Received shutdown signal. Closing connections...');
    await eventListener_1.eventListener.disconnect();
    await prisma_1.default.$disconnect();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
exports.default = app;
//# sourceMappingURL=index.js.map