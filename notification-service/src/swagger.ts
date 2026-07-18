export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MediBook Notification Service API',
    version: '1.0.0',
    description: 'Notification management service for MediBook Healthcare System',
  },
  servers: [
    { url: 'http://localhost:8003', description: 'Development server' },
    { url: 'http://notification-service:8003', description: 'Docker network' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['appointment_created', 'appointment_confirmed', 'appointment_cancelled', 'appointment_reminder'] },
          title: { type: 'string' },
          message: { type: 'string' },
          appointmentId: { type: 'string', format: 'uuid' },
          emailSent: { type: 'boolean' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};
