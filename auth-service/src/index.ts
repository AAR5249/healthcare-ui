import express from 'express';
import { config } from './config';
import { createLogger } from '@medibook/utils';
import { errorHandler, metricsMiddleware, metricsEndpoint } from '@medibook/middleware';
import authRoutes from './routes';
import prisma from './config/prisma';

const logger = createLogger('auth-service');
const app = express();

app.use(express.json());
app.use(metricsMiddleware);

app.use('/auth', authRoutes);
app.get('/metrics', metricsEndpoint);
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Route not found',
  });
});

const server = app.listen(config.port, () => {
  logger.info(`Auth service running on port ${config.port}`, {
    port: config.port,
    environment: config.nodeEnv,
  });
});

const gracefulShutdown = async () => {
  logger.info('Received shutdown signal. Closing connections...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
