import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { sendResponse, sendError } from '@medibook/utils';
import { createAppointmentSchema, updateAppointmentSchema, appointmentFilterSchema, dateQuerySchema } from '@medibook/utils';
import { AuthenticatedRequest } from '@medibook/middleware';

export class AppointmentController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createAppointmentSchema.parse(req.body);
      const appointment = await AppointmentService.createAppointment(validatedData);
      sendResponse(res, 201, appointment, 'Appointment created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter = appointmentFilterSchema.parse(req.query);
      const appointments = await AppointmentService.getAppointments(filter);
      sendResponse(res, 200, appointments);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const appointment = await AppointmentService.getAppointmentById(id);

      if (!appointment) {
        sendError(res, 404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
        return;
      }

      sendResponse(res, 200, appointment);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateAppointmentSchema.parse(req.body);
      const appointment = await AppointmentService.updateAppointment(id, validatedData);
      sendResponse(res, 200, appointment, 'Appointment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await AppointmentService.deleteAppointment(id);
      sendResponse(res, 200, null, 'Appointment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId } = req.params;
      const { date } = dateQuerySchema.parse(req.query);
      const slots = await AppointmentService.getAvailableSlots(doctorId, date);
      sendResponse(res, 200, slots);
    } catch (error) {
      next(error);
    }
  }

  static async health(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'ok',
      service: 'appointment-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
