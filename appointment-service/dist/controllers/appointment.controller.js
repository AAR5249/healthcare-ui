"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
const utils_1 = require("@medibook/utils");
const utils_2 = require("@medibook/utils");
class AppointmentController {
    static async create(req, res, next) {
        try {
            const validatedData = utils_2.createAppointmentSchema.parse(req.body);
            const appointment = await appointment_service_1.AppointmentService.createAppointment(validatedData);
            (0, utils_1.sendResponse)(res, 201, appointment, 'Appointment created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const filter = utils_2.appointmentFilterSchema.parse(req.query);
            const appointments = await appointment_service_1.AppointmentService.getAppointments(filter);
            (0, utils_1.sendResponse)(res, 200, appointments);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const appointment = await appointment_service_1.AppointmentService.getAppointmentById(id);
            if (!appointment) {
                (0, utils_1.sendError)(res, 404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
                return;
            }
            (0, utils_1.sendResponse)(res, 200, appointment);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = utils_2.updateAppointmentSchema.parse(req.body);
            const appointment = await appointment_service_1.AppointmentService.updateAppointment(id, validatedData);
            (0, utils_1.sendResponse)(res, 200, appointment, 'Appointment updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            await appointment_service_1.AppointmentService.deleteAppointment(id);
            (0, utils_1.sendResponse)(res, 200, null, 'Appointment deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getAvailableSlots(req, res, next) {
        try {
            const { doctorId } = req.params;
            const { date } = utils_2.dateQuerySchema.parse(req.query);
            const slots = await appointment_service_1.AppointmentService.getAvailableSlots(doctorId, date);
            (0, utils_1.sendResponse)(res, 200, slots);
        }
        catch (error) {
            next(error);
        }
    }
    static async health(req, res) {
        res.json({
            status: 'ok',
            service: 'appointment-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    }
}
exports.AppointmentController = AppointmentController;
//# sourceMappingURL=appointment.controller.js.map