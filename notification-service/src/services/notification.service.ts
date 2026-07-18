import prisma from '../config/prisma';
import { Notification, NotificationType } from '@medibook/types';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@medibook/utils';
import { emailService } from './email.service';

const logger = createLogger('notification-service');

export class NotificationService {
  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    appointmentId?: string;
    sendEmail?: boolean;
    userEmail?: string;
    appointmentData?: {
      date: string;
      startTime: string;
      endTime?: string;
      doctorId?: string;
      patientId?: string;
    };
  }): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        appointmentId: data.appointmentId,
        emailSent: false,
        isRead: false,
      },
    });

    if (data.sendEmail && data.userEmail && data.appointmentData) {
      const emailSent = await this.sendEmailNotification(data.userEmail, data.type, data.appointmentData);

      if (emailSent) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { emailSent: true },
        });
      }
    }

    logger.info('Notification created', { notificationId: notification.id, userId: data.userId });

    return notification as Notification;
  }

  static async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications as Notification[];
  }

  static async getNotificationById(id: string): Promise<Notification | null> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    return notification as Notification | null;
  }

  static async markAsRead(id: string): Promise<Notification | null> {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return notification as Notification;
    } catch (error) {
      return null;
    }
  }

  static async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return result.count;
  }

  static async deleteNotification(id: string): Promise<boolean> {
    try {
      await prisma.notification.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async sendEmailNotification(
    to: string,
    type: NotificationType,
    data: {
      date: string;
      startTime: string;
      endTime?: string;
      doctorId?: string;
      patientId?: string;
    }
  ): Promise<boolean> {
    switch (type) {
      case 'appointment_created':
      case 'appointment_confirmed':
        return emailService.sendAppointmentConfirmation(to, {
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime || '',
          doctorId: data.doctorId || '',
          patientId: data.patientId || '',
        });
      case 'appointment_cancelled':
        return emailService.sendAppointmentCancellation(to, {
          date: data.date,
          startTime: data.startTime,
          doctorId: data.doctorId || '',
        });
      case 'appointment_reminder':
        return emailService.sendAppointmentReminder(to, {
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime || '',
        });
      default:
        return false;
    }
  }
}
