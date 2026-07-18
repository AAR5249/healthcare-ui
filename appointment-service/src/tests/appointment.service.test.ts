import { AppointmentService } from '../services/appointment.service';
import prisma from '../config/prisma';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    appointment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

jest.mock('../eventPublisher', () => ({
  eventPublisher: {
    publishAppointmentCreated: jest.fn(),
    publishAppointmentUpdated: jest.fn(),
    disconnect: jest.fn(),
  },
}));

describe('AppointmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create a new appointment successfully', async () => {
      const mockData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        date: '2026-01-15',
        startTime: '09:00',
        endTime: '09:30',
        reason: 'Checkup',
      };

      const mockAppointment = {
        id: 'appt-789',
        ...mockData,
        date: new Date(mockData.date),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment);

      const result = await AppointmentService.createAppointment(mockData);

      expect(prisma.appointment.findFirst).toHaveBeenCalled();
      expect(prisma.appointment.create).toHaveBeenCalled();
      expect(result.id).toBe('appt-789');
    });

    it('should throw error if slot already booked', async () => {
      const mockData = {
        patientId: 'patient-123',
        doctorId: 'doctor-456',
        date: '2026-01-15',
        startTime: '09:00',
        endTime: '09:30',
      };

      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-appointment' });

      await expect(AppointmentService.createAppointment(mockData)).rejects.toMatchObject({
        statusCode: 409,
        code: 'SLOT_BOOKED',
      });
    });
  });

  describe('getAppointments', () => {
    it('should return appointments with filters', async () => {
      const mockAppointments = [
        { id: 'appt-1', patientId: 'patient-1', status: 'confirmed' },
        { id: 'appt-2', patientId: 'patient-2', status: 'pending' },
      ];

      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(mockAppointments);

      const result = await AppointmentService.getAppointments({ patientId: 'patient-1' });

      expect(result).toHaveLength(2);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-1' },
        orderBy: expect.any(Array),
      });
    });
  });

  describe('getAppointmentById', () => {
    it('should return appointment by id', async () => {
      const mockAppointment = {
        id: 'appt-123',
        patientId: 'patient-123',
        status: 'confirmed',
      };

      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);

      const result = await AppointmentService.getAppointmentById('appt-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('appt-123');
    });

    it('should return null for non-existent appointment', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await AppointmentService.getAppointmentById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment status', async () => {
      const mockExisting = {
        id: 'appt-123',
        status: 'pending',
      };

      const mockUpdated = {
        id: 'appt-123',
        status: 'confirmed',
      };

      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockExisting);
      (prisma.appointment.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await AppointmentService.updateAppointment('appt-123', { status: 'confirmed' });

      expect(result.status).toBe('confirmed');
    });

    it('should throw error if appointment not found', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        AppointmentService.updateAppointment('non-existent', { status: 'confirmed' })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'APPOINTMENT_NOT_FOUND',
      });
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available slots for a doctor', async () => {
      const mockBooked = [
        { startTime: '09:00', endTime: '09:30' },
        { startTime: '10:00', endTime: '10:30' },
      ];

      (prisma.appointment.findMany as jest.Mock).mockResolvedValue(mockBooked);

      const result = await AppointmentService.getAvailableSlots('doctor-123', '2026-01-15');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const bookedSlot = result.find(s => s.startTime === '09:00');
      expect(bookedSlot?.isAvailable).toBe(false);

      const availableSlot = result.find(s => s.startTime === '09:30');
      expect(availableSlot?.isAvailable).toBe(true);
    });
  });

  describe('isSlotAvailable', () => {
    it('should return true for available slot', async () => {
      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await AppointmentService.isSlotAvailable(
        'doctor-123',
        '2026-01-15',
        '09:00',
        '09:30'
      );

      expect(result).toBe(true);
    });

    it('should return false for booked slot', async () => {
      (prisma.appointment.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

      const result = await AppointmentService.isSlotAvailable(
        'doctor-123',
        '2026-01-15',
        '09:00',
        '09:30'
      );

      expect(result).toBe(false);
    });
  });
});
