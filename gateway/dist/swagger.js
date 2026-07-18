"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MediBook Healthcare API Gateway',
            version: '1.0.0',
            description: 'Central API Gateway for MediBook Healthcare Appointment System',
            contact: {
                name: 'MediBook Team',
                email: 'support@medibook.com',
            },
        },
        servers: [
            { url: 'http://localhost:8000', description: 'Development server' },
            { url: 'http://gateway:8000', description: 'Docker network' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token obtained from /auth/login',
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
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        message: { type: 'string' },
                        error: { type: 'string' },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Appointments', description: 'Appointment management' },
            { name: 'Notifications', description: 'Notification management' },
            { name: 'Health', description: 'Health check endpoints' },
        ],
    },
    apis: [],
};
exports.swaggerSpec = swaggerJsdoc(options);
//# sourceMappingURL=swagger.js.map