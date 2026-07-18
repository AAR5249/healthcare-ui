"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const uuid_1 = require("uuid");
const utils_1 = require("@medibook/utils");
const email_service_1 = require("./email.service");
const logger = (0, utils_1.createLogger)('notification-service');
class NotificationService {
    static async createNotification(data) {
        const notification = await prisma_1.default.notification.create({
            data: {
                id: (0, uuid_1.v4)(),
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
                await prisma_1.default.notification.update({
                    where: { id: notification.id },
                    data: { emailSent: true },
                });
            }
        }
        logger.info('Notification created', { notificationId: notification.id, userId: data.userId });
        return notification;
    }
    static async getNotificationsByUser(userId) {
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return notifications;
    }
    static async getNotificationById(id) {
        const notification = await prisma_1.default.notification.findUnique({
            where: { id },
        });
        return notification;
    }
    static async markAsRead(id) {
        try {
            const notification = await prisma_1.default.notification.update({
                where: { id },
                data: { isRead: true },
            });
            return notification;
        }
        catch (error) {
            return null;
        }
    }
    static async markAllAsRead(userId) {
        const result = await prisma_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return result.count;
    }
    static async deleteNotification(id) {
        try {
            await prisma_1.default.notification.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static async sendEmailNotification(to, type, data) {
        switch (type) {
            case 'appointment_created':
            case 'appointment_confirmed':
                return email_service_1.emailService.sendAppointmentConfirmation(to, {
                    date: data.date,
                    startTime: data.startTime,
                    endTime: data.endTime || '',
                    doctorId: data.doctorId || '',
                    patientId: data.patientId || '',
                });
            case 'appointment_cancelled':
                return email_service_1.emailService.sendAppointmentCancellation(to, {
                    date: data.date,
                    startTime: data.startTime,
                    doctorId: data.doctorId || '',
                });
            case 'appointment_reminder':
                return email_service_1.emailService.sendAppointmentReminder(to, {
                    date: data.date,
                    startTime: data.startTime,
                    endTime: data.endTime || '',
                });
            default:
                return false;
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map