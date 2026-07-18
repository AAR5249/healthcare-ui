import nodemailer from 'nodemailer';
import { config } from '../config';
import { createLogger } from '@medibook/utils';

const logger = createLogger('email-service');

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (config.email.host && config.email.user) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    } else {
      logger.warn('Email service not configured. Notifications will not be sent via email.');
    }
  }

  async sendAppointmentConfirmation(
    to: string,
    data: {
      date: string;
      startTime: string;
      endTime: string;
      doctorId: string;
      patientId: string;
    }
  ): Promise<boolean> {
    const subject = 'Appointment Confirmation - MediBook';
    const html = `
      <h2>Appointment Confirmed</h2>
      <p>Your appointment has been scheduled.</p>
      <ul>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Time:</strong> ${data.startTime} - ${data.endTime}</li>
      </ul>
      <p>Please arrive 10 minutes early.</p>
      <br>
      <p>Best regards,<br>MediBook Healthcare Team</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendAppointmentCancellation(
    to: string,
    data: {
      date: string;
      startTime: string;
      doctorId: string;
    }
  ): Promise<boolean> {
    const subject = 'Appointment Cancelled - MediBook';
    const html = `
      <h2>Appointment Cancelled</h2>
      <p>Your appointment on ${data.date} at ${data.startTime} has been cancelled.</p>
      <p>If you need to reschedule, please visit our booking system.</p>
      <br>
      <p>Best regards,<br>MediBook Healthcare Team</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendAppointmentReminder(
    to: string,
    data: {
      date: string;
      startTime: string;
      endTime: string;
    }
  ): Promise<boolean> {
    const subject = 'Appointment Reminder - MediBook';
    const html = `
      <h2>Appointment Reminder</h2>
      <p>This is a reminder for your upcoming appointment.</p>
      <ul>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Time:</strong> ${data.startTime} - ${data.endTime}</li>
      </ul>
      <br>
      <p>Best regards,<br>MediBook Healthcare Team</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not configured. Skipping email send.', { to, subject });
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });

      logger.info('Email sent successfully', { to, subject });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { error, to, subject });
      return false;
    }
  }
}

export const emailService = new EmailService();
