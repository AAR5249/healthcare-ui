"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateQuerySchema = exports.appointmentFilterSchema = exports.updateAppointmentSchema = exports.createAppointmentSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').max(100),
    firstName: zod_1.z.string().min(1, 'First name is required').max(50),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50),
    role: zod_1.z.enum(['patient', 'doctor', 'admin']),
    phone: zod_1.z.string().regex(/^\+?[\d\s-]{10,15}$/).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.createAppointmentSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid('Invalid patient ID'),
    doctorId: zod_1.z.string().uuid('Invalid doctor ID'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
    endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
    reason: zod_1.z.string().max(500).optional(),
});
exports.updateAppointmentSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.appointmentFilterSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid().optional(),
    doctorId: zod_1.z.string().uuid().optional(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: zod_1.z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});
exports.dateQuerySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});
