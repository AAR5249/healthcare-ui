import Redis from 'ioredis';
import { config } from '../config';
import { createLogger } from '@medibook/utils';
import { NotificationService } from '../services/notification.service';

const logger = createLogger('event-listener');

class EventListener {
  private subscriber: Redis;
  private channel: string;

  constructor() {
    this.subscriber = new Redis(config.redis.url);
    this.channel = config.redis.channel;

    this.subscriber.on('connect', () => {
      logger.info('Redis subscriber connected');
    });

    this.subscriber.on('error', (error) => {
      logger.error('Redis subscriber error', { error: error.message });
    });

    this.subscribe();
  }

  private async subscribe(): Promise<void> {
    await this.subscriber.subscribe(this.channel, (err) => {
      if (err) {
        logger.error('Failed to subscribe to channel', { channel: this.channel, error: err });
      } else {
        logger.info(`Subscribed to channel: ${this.channel}`);
      }
    });

    this.subscriber.on('message', async (channel, message) => {
      if (channel !== this.channel) return;

      try {
        const event = JSON.parse(message);
        logger.info('Event received', { eventType: event.type });

        await this.handleEvent(event);
      } catch (error) {
        logger.error('Failed to process event', { error, message });
      }
    });
  }

  private async handleEvent(event: { type: string; data: any; timestamp: string }): Promise<void> {
    const { type, data } = event;

    const notifications: Array<{
      userId: string;
      type: any;
      title: string;
      message: string;
      appointmentId: string;
    }> = [];

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
        await NotificationService.createNotification({
          ...notification,
          sendEmail: false,
        });
      } catch (error) {
        logger.error('Failed to create notification', { error, notification });
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.subscriber.unsubscribe();
    await this.subscriber.quit();
    logger.info('Redis subscriber disconnected');
  }
}

export const eventListener = new EventListener();
