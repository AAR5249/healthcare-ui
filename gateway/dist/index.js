"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("./config");
const swagger_1 = require("./swagger");
const auth_1 = require("./middleware/auth");
const logger_1 = require("./utils/logger");
const logger = (0, logger_1.createLogger)('api-gateway');
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.max,
    message: {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('# Gateway metrics endpoint\n# Metrics are collected from individual services\n');
});
app.use(auth_1.jwtMiddleware);
const createProxyConfig = (target) => ({
    target,
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req) => {
            logger.info('Proxying request', {
                method: req.method,
                path: req.path,
                target,
            });
            if (req.user) {
                proxyReq.setHeader('X-User-Id', req.user.userId);
                proxyReq.setHeader('X-User-Email', req.user.email);
                proxyReq.setHeader('X-User-Role', req.user.role);
            }
        },
        proxyRes: (proxyRes, req) => {
            logger.info('Response received', {
                statusCode: proxyRes.statusCode,
                path: req.path,
            });
        },
        error: (err, req) => {
            logger.error('Proxy error', {
                error: err.message,
                path: req.path,
                target,
            });
        },
    },
});
app.use('/auth', (0, http_proxy_middleware_1.createProxyMiddleware)({
    ...createProxyConfig(config_1.config.services.auth),
    pathRewrite: { '^/auth': '/auth' },
}));
app.use('/appointments', (0, http_proxy_middleware_1.createProxyMiddleware)({
    ...createProxyConfig(config_1.config.services.appointment),
    pathRewrite: { '^/appointments': '/appointments' },
}));
app.use('/notifications', (0, http_proxy_middleware_1.createProxyMiddleware)({
    ...createProxyConfig(config_1.config.services.notification),
    pathRewrite: { '^/notifications': '/notifications' },
}));
app.use(auth_1.errorHandler);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Route not found',
    });
});
const server = app.listen(config_1.config.port, () => {
    logger.info(`API Gateway running on port ${config_1.config.port}`, {
        port: config_1.config.port,
        environment: config_1.config.nodeEnv,
        services: {
            auth: config_1.config.services.auth,
            appointment: config_1.config.services.appointment,
            notification: config_1.config.services.notification,
        },
    });
});
const gracefulShutdown = () => {
    logger.info('Received shutdown signal. Closing server...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
exports.default = app;
//# sourceMappingURL=index.js.map