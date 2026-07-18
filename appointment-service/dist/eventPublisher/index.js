"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventPublisher = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const utils_1 = require("@medibook/utils");
const logger = (0, utils_1.createLogger)('event-publisher');
class EventPublisher {
    publisher;
    channel;
    constructor() {
        this.publisher = new ioredis_1.default(config_1.config.redis.url);
        this.channel = config_1.config.redis.channel;
        this.publisher.on('connect', () => {
            logger.info('Connected to Redis');
        });
        this.publisher.on('error', (error) => {
            logger.error('Redis connection error', { error: error.message });
        });
    }
    async publishAppointmentCreated(appointment) {
        await this.publish('appointment_created', {
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
            reason: appointment.reason,
        });
    }
    async publishAppointmentUpdated(appointment, oldStatus) {
        const eventType = this.getEventType(appointment.status);
        await this.publish(eventType, {
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            date: appointment.date,
            startTime: appointment.startTime,
            oldStatus,
            newStatus: appointment.status,
        });
    }
    async publish(eventType, data) {
        try {
            const message = JSON.stringify({
                type: eventType,
                data,
                timestamp: new Date().toISOString(),
            });
            await this.publisher.publish(this.channel, message);
            logger.info(`Event published: ${eventType}`, { eventType, appointmentId: data.appointmentId });
        }
        catch (error) {
            logger.error(`Failed to publish event: ${eventType}`, { error });
        }
    }
    getEventType(status) {
        switch (status) {
            case 'confirmed':
                return 'appointment_confirmed';
            case 'cancelled':
                return 'appointment_cancelled';
            case 'completed':
                return 'appointment_completed';
            default:
                return 'appointment_updated';
        }
    }
    async disconnect() {
        await this.publisher.quit();
        logger.info('Redis publisher disconnected');
    }
}
exports.eventPublisher = new EventPublisher();
//# sourceMappingURL=index.js.map