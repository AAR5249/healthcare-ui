"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventListener = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const utils_1 = require("@medibook/utils");
const notification_service_1 = require("../services/notification.service");
const logger = (0, utils_1.createLogger)('event-listener');
class EventListener {
    subscriber;
    channel;
    constructor() {
        this.subscriber = new ioredis_1.default(config_1.config.redis.url);
        this.channel = config_1.config.redis.channel;
        this.subscriber.on('connect', () => {
            logger.info('Redis subscriber connected');
        });
        this.subscriber.on('error', (error) => {
            logger.error('Redis subscriber error', { error: error.message });
        });
        this.subscribe();
    }
    async subscribe() {
        await this.subscriber.subscribe(this.channel, (err) => {
            if (err) {
                logger.error('Failed to subscribe to channel', { channel: this.channel, error: err });
            }
            else {
                logger.info(`Subscribed to channel: ${this.channel}`);
            }
        });
        this.subscriber.on('message', async (channel, message) => {
            if (channel !== this.channel)
                return;
            try {
                const event = JSON.parse(message);
                logger.info('Event received', { eventType: event.type });
                await this.handleEvent(event);
            }
            catch (error) {
                logger.error('Failed to process event', { error, message });
            }
        });
    }
    async handleEvent(event) {
        const { type, data } = event;
        const notifications = [];
        switch (type) {
            case 'appointment_created':
                notifications.push({
                    userId: data.patientId,
                    type: 'appointment_created',
                    title: 'Appointment Scheduled',
                    message: `Your appointment has been scheduled for ${data.date} at ${data.startTime}.`,
                    appointmentId: data.appointmentId,
                });
                break;
            case 'appointment_confirmed':
                notifications.push({
                    userId: data.patientId,
                    type: 'appointment_confirmed',
                    title: 'Appointment Confirmed',
                    message: `Your appointment on ${data.date} at ${data.startTime} has been confirmed.`,
                    appointmentId: data.appointmentId,
                });
                break;
            case 'appointment_cancelled':
                notifications.push({
                    userId: data.patientId,
                    type: 'appointment_cancelled',
                    title: 'Appointment Cancelled',
                    message: `Your appointment on ${data.date} at ${data.startTime} has been cancelled.`,
                    appointmentId: data.appointmentId,
                });
                break;
            case 'appointment_completed':
                notifications.push({
                    userId: data.patientId,
                    type: 'appointment_reminder',
                    title: 'Appointment Completed',
                    message: `Your appointment on ${data.date} has been completed. Thank you for visiting.`,
                    appointmentId: data.appointmentId,
                });
                break;
        }
        for (const notification of notifications) {
            try {
                await notification_service_1.NotificationService.createNotification({
                    ...notification,
                    sendEmail: false,
                });
            }
            catch (error) {
                logger.error('Failed to create notification', { error, notification });
            }
        }
    }
    async disconnect() {
        await this.subscriber.unsubscribe();
        await this.subscriber.quit();
        logger.info('Redis subscriber disconnected');
    }
}
exports.eventListener = new EventListener();
//# sourceMappingURL=index.js.map