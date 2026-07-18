import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './swagger';
import { jwtMiddleware, errorHandler } from './middleware/auth';
import { createLogger } from './utils/logger';

const logger = createLogger('api-gateway');
const app = express();

app.use(morgan('combined'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.use(jwtMiddleware);

const createProxyConfig = (target: string) => ({
  target,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
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
    proxyRes: (proxyRes: any, req: any) => {
      logger.info('Response received', {
        statusCode: proxyRes.statusCode,
        path: req.path,
      });
    },
    error: (err: Error, req: any) => {
      logger.error('Proxy error', {
        error: err.message,
        path: req.path,
        target,
      });
    },
  },
});

app.use('/auth', createProxyMiddleware({
  ...createProxyConfig(config.services.auth),
  pathRewrite: { '^/auth': '/auth' },
}));

app.use('/appointments', createProxyMiddleware({
  ...createProxyConfig(config.services.appointment),
  pathRewrite: { '^/appointments': '/appointments' },
}));

app.use('/notifications', createProxyMiddleware({
  ...createProxyConfig(config.services.notification),
  pathRewrite: { '^/notifications': '/notifications' },
}));

app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Route not found',
  });
});

const server = app.listen(config.port, () => {
  logger.info(`API Gateway running on port ${config.port}`, {
    port: config.port,
    environment: config.nodeEnv,
    services: {
      auth: config.services.auth,
      appointment: config.services.appointment,
      notification: config.services.notification,
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

export default app;
