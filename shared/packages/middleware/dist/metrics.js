"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsEndpoint = exports.metricsMiddleware = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const collectDefaultMetrics = prom_client_1.default.collectDefaultMetrics;
const httpRequestDuration = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});
const httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});
collectDefaultMetrics();
const pathToRoute = (path) => {
    return path
        .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/:id')
        .replace(/\/\d+/g, '/:id');
};
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    const route = pathToRoute(req.path);
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode.toString(),
        };
        httpRequestDuration.observe(labels, duration);
        httpRequestsTotal.inc(labels);
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
const metricsEndpoint = async (req, res) => {
    res.set('Content-Type', prom_client_1.default.register.contentType);
    res.send(await prom_client_1.default.register.metrics());
};
exports.metricsEndpoint = metricsEndpoint;
