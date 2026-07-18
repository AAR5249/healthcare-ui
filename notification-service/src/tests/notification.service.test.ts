import { NotificationService } from '../services/notification.service';
import prisma from '../config/prisma';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

jest.mock('../services/email.service', () => ({
  emailService: {
    sendAppointmentConfirmation: jest.fn().mockResolvedValue(true),
    sendAppointmentCancellation: jest.fn().mockResolvedValue(true),
    sendAppointmentReminder: jest.fn().mockResolvedValue(true),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const mockData = {
        userId: 'user-123',
        type: 'appointment_created' as const,
        title: 'Appointment Scheduled',
        message: 'Your appointment has been scheduled',
        appointmentId: 'appt-456',
      };

      const mockNotification = {
        id: 'notif-789',
        ...mockData,
        emailSent: false,
        isRead: false,
        createdAt: new Date(),
      };

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.createNotification(mockData);

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result.id).toBe('notif-789');
      expect(result.userId).toBe('user-123');
    });
  });

  describe('getNotificationsByUser', () => {
    it('should return notifications for a user', async () => {
      const mockNotifications = [
        { id: 'notif-1', userId: 'user-123', isRead: false },
        { id: 'notif-2', userId: 'user-123', isRead: true },
      ];

      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await NotificationService.getNotificationsByUser('user-123');

      expect(result).toHaveLength(2);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotification = {
        id: 'notif-123',
        isRead: true,
      };

      (prisma.notification.update as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.markAsRead('notif-123');

      expect(result).not.toBeNull();
      expect(result?.isRead).toBe(true);
    });

    it('should return null if notification not found', async () => {
      (prisma.notification.update as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await NotificationService.markAsRead('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const count = await NotificationService.markAllAsRead('user-123');

      expect(count).toBe(5);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      (prisma.notification.delete as jest.Mock).mockResolvedValue({ id: 'notif-123' });

      const result = await NotificationService.deleteNotification('notif-123');

      expect(result).toBe(true);
    });

    it('should return false if notification not found', async () => {
      (prisma.notification.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await NotificationService.deleteNotification('non-existent');

      expect(result).toBe(false);
    });
  });
});
