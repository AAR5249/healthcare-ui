export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MediBook Auth Service API',
    version: '1.0.0',
    description: 'Authentication and user management service for MediBook Healthcare System',
  },
  servers: [
    { url: 'http://localhost:8001', description: 'Development server' },
    { url: 'http://auth-service:8001', description: 'Docker network' },
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
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['patient', 'doctor', 'admin'] },
          phone: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
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
