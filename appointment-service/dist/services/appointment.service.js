"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const config_1 = require("../config");
const eventPublisher_1 = require("../eventPublisher");
const utils_1 = require("@medibook/utils");
const uuid_1 = require("uuid");
const logger = (0, utils_1.createLogger)('appointment-service');
// Helper function to convert Prisma appointment to API response format
const formatAppointment = (appointment) => ({
    ...appointment,
    date: appointment.date instanceof Date ? appointment.date.toISOString().split('T')[0] : appointment.date,
});
class AppointmentService {
    static async createAppointment(data) {
        const existingAppointment = await prisma_1.default.appointment.findFirst({
            where: {
                doctorId: data.doctorId,
                date: new Date(data.date),
                startTime: data.startTime,
                status: { notIn: ['cancelled', 'completed'] },
            },
        });
        if (existingAppointment) {
            throw Object.assign(new Error('Time slot already booked'), {
                statusCode: 409,
                code: 'SLOT_BOOKED',
            });
        }
        const appointment = await prisma_1.default.appointment.create({
            data: {
                id: (0, uuid_1.v4)(),
                patientId: data.patientId,
                doctorId: data.doctorId,
                date: new Date(data.date),
                startTime: data.startTime,
                endTime: data.endTime,
                status: 'pending',
                reason: data.reason,
            },
        });
        await eventPublisher_1.eventPublisher.publishAppointmentCreated(formatAppointment(appointment));
        logger.info(`Appointment created: ${appointment.id}`, { appointmentId: appointment.id });
        return formatAppointment(appointment);
    }
    static async getAppointments(filter) {
        const where = {};
        if (filter.patientId)
            where.patientId = filter.patientId;
        if (filter.doctorId)
            where.doctorId = filter.doctorId;
        if (filter.date)
            where.date = new Date(filter.date);
        if (filter.status)
            where.status = filter.status;
        const appointments = await prisma_1.default.appointment.findMany({
            where,
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
        return appointments.map(formatAppointment);
    }
    static async getAppointmentById(id) {
        const appointment = await prisma_1.default.appointment.findUnique({
            where: { id },
        });
        return appointment ? formatAppointment(appointment) : null;
    }
    static async updateAppointment(id, data) {
        const existingAppointment = await prisma_1.default.appointment.findUnique({
            where: { id },
        });
        if (!existingAppointment) {
            throw Object.assign(new Error('Appointment not found'), {
                statusCode: 404,
                code: 'APPOINTMENT_NOT_FOUND',
            });
        }
        const oldStatus = existingAppointment.status;
        const appointment = await prisma_1.default.appointment.update({
            where: { id },
            data: {
                status: data.status,
                notes: data.notes,
            },
        });
        if (data.status && data.status !== oldStatus) {
            await eventPublisher_1.eventPublisher.publishAppointmentUpdated(formatAppointment(appointment), oldStatus);
        }
        logger.info(`Appointment updated: ${id}`, { appointmentId: id, data });
        return formatAppointment(appointment);
    }
    static async deleteAppointment(id) {
        const appointment = await prisma_1.default.appointment.findUnique({
            where: { id },
        });
        if (!appointment) {
            throw Object.assign(new Error('Appointment not found'), {
                statusCode: 404,
                code: 'APPOINTMENT_NOT_FOUND',
            });
        }
        await prisma_1.default.appointment.delete({
            where: { id },
        });
        logger.info(`Appointment deleted: ${id}`);
    }
    static async getAvailableSlots(doctorId, date) {
        const targetDate = new Date(date);
        const slots = [];
        const { workingHoursStart, workingHoursEnd, slotDurationMinutes } = config_1.config.appointment;
        for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
            for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
                const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const endHour = minute + slotDurationMinutes >= 60 ? hour + 1 : hour;
                const endMinute = (minute + slotDurationMinutes) % 60;
                const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
                slots.push({
                    startTime,
                    endTime,
                    isAvailable: true,
                });
            }
        }
        const bookedAppointments = await prisma_1.default.appointment.findMany({
            where: {
                doctorId,
                date: targetDate,
                status: { notIn: ['cancelled', 'completed'] },
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });
        const bookedSlots = new Set(bookedAppointments.map(a => `${a.startTime}-${a.endTime}`));
        return slots.map(slot => ({
            ...slot,
            isAvailable: !bookedSlots.has(`${slot.startTime}-${slot.endTime}`),
        }));
    }
    static async isSlotAvailable(doctorId, date, startTime, endTime) {
        const existing = await prisma_1.default.appointment.findFirst({
            where: {
                doctorId,
                date: new Date(date),
                startTime,
                status: { notIn: ['cancelled', 'completed'] },
            },
        });
        return !existing;
    }
}
exports.AppointmentService = AppointmentService;
//# sourceMappingURL=appointment.service.js.map