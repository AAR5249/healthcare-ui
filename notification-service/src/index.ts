import express from 'express';
import { config } from './config';
import { createLogger } from '@medibook/utils';
import { errorHandler, metricsMiddleware, metricsEndpoint } from '@medibook/middleware';
import notificationRoutes from './routes';
import prisma from './config/prisma';
import { eventListener } from './eventListener';

const logger = createLogger('notification-service');
const app = express();

app.use(express.json());
app.use(metricsMiddleware);

app.use('/notifications', notificationRoutes);
app.get('/metrics', metricsEndpoint);
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
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
  logger.info(`Notification service running on port ${config.port}`, {
    port: config.port,
    environment: config.nodeEnv,
  });
});

const gracefulShutdown = async () => {
  logger.info('Received shutdown signal. Closing connections...');
  await eventListener.disconnect();
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
