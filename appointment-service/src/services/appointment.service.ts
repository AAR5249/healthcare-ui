import prisma from '../config/prisma';
import { config } from '../config';
import { eventPublisher } from '../eventPublisher';
import { Appointment, TimeSlot, CreateAppointmentDto, UpdateAppointmentDto, AppointmentFilter } from '@medibook/types';
import { createLogger } from '@medibook/utils';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('appointment-service');

// Helper function to convert Prisma appointment to API response format
const formatAppointment = (appointment: any): Appointment => ({
  ...appointment,
  date: appointment.date instanceof Date ? appointment.date.toISOString().split('T')[0] : appointment.date,
});

export class AppointmentService {
  static async createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
    const existingAppointment = await prisma.appointment.findFirst({
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

    const appointment = await prisma.appointment.create({
      data: {
        id: uuidv4(),
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'pending',
        reason: data.reason,
      },
    });

    await eventPublisher.publishAppointmentCreated(formatAppointment(appointment));
    logger.info(`Appointment created: ${appointment.id}`, { appointmentId: appointment.id });

    return formatAppointment(appointment);
  }

  static async getAppointments(filter: AppointmentFilter): Promise<Appointment[]> {
    const where: any = {};

    if (filter.patientId) where.patientId = filter.patientId;
    if (filter.doctorId) where.doctorId = filter.doctorId;
    if (filter.date) where.date = new Date(filter.date);
    if (filter.status) where.status = filter.status;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return appointments.map(formatAppointment);
  }

  static async getAppointmentById(id: string): Promise<Appointment | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    return appointment ? formatAppointment(appointment) : null;
  }

  static async updateAppointment(id: string, data: UpdateAppointmentDto): Promise<Appointment> {
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      throw Object.assign(new Error('Appointment not found'), {
        statusCode: 404,
        code: 'APPOINTMENT_NOT_FOUND',
      });
    }

    const oldStatus = existingAppointment.status as any;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
      },
    });

    if (data.status && data.status !== oldStatus) {
      await eventPublisher.publishAppointmentUpdated(formatAppointment(appointment), oldStatus);
    }

    logger.info(`Appointment updated: ${id}`, { appointmentId: id, data });

    return formatAppointment(appointment);
  }

  static async deleteAppointment(id: string): Promise<void> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw Object.assign(new Error('Appointment not found'), {
        statusCode: 404,
        code: 'APPOINTMENT_NOT_FOUND',
      });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    logger.info(`Appointment deleted: ${id}`);
  }

  static async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const targetDate = new Date(date);
    const slots: TimeSlot[] = [];

    const { workingHoursStart, workingHoursEnd, slotDurationMinutes } = config.appointment;

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

    const bookedAppointments = await prisma.appointment.findMany({
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

    const bookedSlots = new Set(
      bookedAppointments.map(a => `${a.startTime}-${a.endTime}`)
    );

    return slots.map(slot => ({
      ...slot,
      isAvailable: !bookedSlots.has(`${slot.startTime}-${slot.endTime}`),
    }));
  }

  static async isSlotAvailable(
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const existing = await prisma.appointment.findFirst({
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
