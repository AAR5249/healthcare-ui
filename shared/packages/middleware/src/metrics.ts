import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

collectDefaultMetrics();

const pathToRoute = (path: string): string => {
  return path
    .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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

export const metricsEndpoint = async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
};
