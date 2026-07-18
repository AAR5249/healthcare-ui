import Redis from 'ioredis';
import { config } from '../config';
import { createLogger } from '@medibook/utils';
import { Appointment, AppointmentStatus } from '@medibook/types';

const logger = createLogger('event-publisher');

class EventPublisher {
  private publisher: Redis;
  private channel: string;

  constructor() {
    this.publisher = new Redis(config.redis.url);
    this.channel = config.redis.channel;

    this.publisher.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.publisher.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message });
    });
  }

  async publishAppointmentCreated(appointment: Appointment): Promise<void> {
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

  async publishAppointmentUpdated(appointment: Appointment, oldStatus: AppointmentStatus): Promise<void> {
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

  private async publish(eventType: string, data: any): Promise<void> {
    try {
      const message = JSON.stringify({
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
      });

      await this.publisher.publish(this.channel, message);
      logger.info(`Event published: ${eventType}`, { eventType, appointmentId: data.appointmentId });
    } catch (error) {
      logger.error(`Failed to publish event: ${eventType}`, { error });
    }
  }

  private getEventType(status: AppointmentStatus): string {
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

  async disconnect(): Promise<void> {
    await this.publisher.quit();
    logger.info('Redis publisher disconnected');
  }
}

export const eventPublisher = new EventPublisher();
