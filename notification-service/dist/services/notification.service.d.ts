import { Notification, NotificationType } from '@medibook/types';
export declare class NotificationService {
    static createNotification(data: {
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
    }): Promise<Notification>;
    static getNotificationsByUser(userId: string): Promise<Notification[]>;
    static getNotificationById(id: string): Promise<Notification | null>;
    static markAsRead(id: string): Promise<Notification | null>;
    static markAllAsRead(userId: string): Promise<number>;
    static deleteNotification(id: string): Promise<boolean>;
    private static sendEmailNotification;
}
//# sourceMappingURL=notification.service.d.ts.map