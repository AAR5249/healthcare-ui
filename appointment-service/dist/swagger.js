"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
exports.swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'MediBook Appointment Service API',
        version: '1.0.0',
        description: 'Appointment management service for MediBook Healthcare System',
    },
    servers: [
        { url: 'http://localhost:8002', description: 'Development server' },
        { url: 'http://appointment-service:8002', description: 'Docker network' },
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
            Appointment: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    patientId: { type: 'string', format: 'uuid' },
                    doctorId: { type: 'string', format: 'uuid' },
                    date: { type: 'string', format: 'date' },
                    startTime: { type: 'string' },
                    endTime: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
                    reason: { type: 'string' },
                    notes: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            TimeSlot: {
                type: 'object',
                properties: {
                    startTime: { type: 'string' },
                    endTime: { type: 'string' },
                    isAvailable: { type: 'boolean' },
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
//# sourceMappingURL=swagger.js.map