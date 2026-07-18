"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const middleware_1 = require("@medibook/middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments with optional filters
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           pattern: ^\d{4}-\d{2}-\d{2}$
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Unauthorized
 */
router.get('/', middleware_1.authMiddleware, middleware_1.standardRateLimiter, appointment_controller_1.AppointmentController.getAll);
/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 pattern: ^\d{4}-\d{2}-\d{2}$
 *               startTime:
 *                 type: string
 *                 pattern: ^\d{2}:\d{2}$
 *               endTime:
 *                 type: string
 *                 pattern: ^\d{2}:\d{2}$
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Time slot already booked
 */
router.post('/', middleware_1.authMiddleware, middleware_1.standardRateLimiter, appointment_controller_1.AppointmentController.create);
/**
 * @swagger
 * /appointments/slots/{doctorId}:
 *   get:
 *     summary: Get available time slots for a doctor on a specific date
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^\d{4}-\d{2}-\d{2}$
 *     responses:
 *       200:
 *         description: List of available time slots
 */
router.get('/slots/:doctorId', middleware_1.authMiddleware, middleware_1.standardRateLimiter, appointment_controller_1.AppointmentController.getAvailableSlots);
/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
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
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', middleware_1.authMiddleware, middleware_1.standardRateLimiter, appointment_controller_1.AppointmentController.getById);
/**
 * @swagger
 * /appointments/{id}:
 *   patch:
 *     summary: Update appointment status or notes
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */
router.patch('/:id', middleware_1.authMiddleware, middleware_1.standardRateLimiter, appointment_controller_1.AppointmentController.update);
/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
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
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', middleware_1.authMiddleware, middleware_1.standardRateLimiter, appointment_controller_1.AppointmentController.delete);
/**
 * @swagger
 * /appointments/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', appointment_controller_1.AppointmentController.health);
exports.default = router;
//# sourceMappingURL=index.js.map