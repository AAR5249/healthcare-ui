"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const middleware_1 = require("@medibook/middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/:userId', middleware_1.authMiddleware, middleware_1.standardRateLimiter, notification_controller_1.NotificationController.getByUser);
/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', middleware_1.authMiddleware, middleware_1.standardRateLimiter, notification_controller_1.NotificationController.markAsRead);
/**
 * @swagger
 * /notifications/{userId}/read-all:
 *   patch:
 *     summary: Mark all notifications as read for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/:userId/read-all', middleware_1.authMiddleware, middleware_1.standardRateLimiter, notification_controller_1.NotificationController.markAllAsRead);
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', middleware_1.authMiddleware, middleware_1.standardRateLimiter, notification_controller_1.NotificationController.delete);
/**
 * @swagger
 * /notifications/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', notification_controller_1.NotificationController.health);
exports.default = router;
//# sourceMappingURL=index.js.map