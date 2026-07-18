import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware, standardRateLimiter } from '@medibook/middleware';

const router = Router();

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
router.get('/:userId', authMiddleware, standardRateLimiter, NotificationController.getByUser);

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
router.patch('/:id/read', authMiddleware, standardRateLimiter, NotificationController.markAsRead);

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
router.patch('/:userId/read-all', authMiddleware, standardRateLimiter, NotificationController.markAllAsRead);

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
router.delete('/:id', authMiddleware, standardRateLimiter, NotificationController.delete);

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
router.get('/health', NotificationController.health);

export default router;
