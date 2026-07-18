import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendResponse, sendError } from '@medibook/utils';
import { AuthenticatedRequest } from '@medibook/middleware';

export class NotificationController {
  static async getByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const notifications = await NotificationService.getNotificationsByUser(userId);

      sendResponse(res, 200, notifications);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await NotificationService.getNotificationById(id);

      if (!notification) {
        sendError(res, 404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
        return;
      }

      sendResponse(res, 200, notification);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id);

      if (!notification) {
        sendError(res, 404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
        return;
      }

      sendResponse(res, 200, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const count = await NotificationService.markAllAsRead(userId);

      sendResponse(res, 200, { count }, `${count} notifications marked as read`);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await NotificationService.deleteNotification(id);

      if (!deleted) {
        sendError(res, 404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
        return;
      }

      sendResponse(res, 200, null, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }

  static async health(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'ok',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
