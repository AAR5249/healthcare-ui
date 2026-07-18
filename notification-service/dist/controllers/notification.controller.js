"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const utils_1 = require("@medibook/utils");
class NotificationController {
    static async getByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const notifications = await notification_service_1.NotificationService.getNotificationsByUser(userId);
            (0, utils_1.sendResponse)(res, 200, notifications);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const notification = await notification_service_1.NotificationService.getNotificationById(id);
            if (!notification) {
                (0, utils_1.sendError)(res, 404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
                return;
            }
            (0, utils_1.sendResponse)(res, 200, notification);
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const notification = await notification_service_1.NotificationService.markAsRead(id);
            if (!notification) {
                (0, utils_1.sendError)(res, 404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
                return;
            }
            (0, utils_1.sendResponse)(res, 200, notification, 'Notification marked as read');
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            const { userId } = req.params;
            const count = await notification_service_1.NotificationService.markAllAsRead(userId);
            (0, utils_1.sendResponse)(res, 200, { count }, `${count} notifications marked as read`);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await notification_service_1.NotificationService.deleteNotification(id);
            if (!deleted) {
                (0, utils_1.sendError)(res, 404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
                return;
            }
            (0, utils_1.sendResponse)(res, 200, null, 'Notification deleted');
        }
        catch (error) {
            next(error);
        }
    }
    static async health(req, res) {
        res.json({
            status: 'ok',
            service: 'notification-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map