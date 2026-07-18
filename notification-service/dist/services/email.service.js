"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const utils_1 = require("@medibook/utils");
const logger = (0, utils_1.createLogger)('email-service');
class EmailService {
    transporter = null;
    constructor() {
        if (config_1.config.email.host && config_1.config.email.user) {
            this.transporter = nodemailer_1.default.createTransport({
                host: config_1.config.email.host,
                port: config_1.config.email.port,
                secure: config_1.config.email.secure,
                auth: {
                    user: config_1.config.email.user,
                    pass: config_1.config.email.pass,
                },
            });
        }
        else {
            logger.warn('Email service not configured. Notifications will not be sent via email.');
        }
    }
    async sendAppointmentConfirmation(to, data) {
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
    async sendAppointmentCancellation(to, data) {
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
    async sendAppointmentReminder(to, data) {
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
    async sendEmail(to, subject, html) {
        if (!this.transporter) {
            logger.warn('Email transporter not configured. Skipping email send.', { to, subject });
            return false;
        }
        try {
            await this.transporter.sendMail({
                from: config_1.config.email.from,
                to,
                subject,
                html,
            });
            logger.info('Email sent successfully', { to, subject });
            return true;
        }
        catch (error) {
            logger.error('Failed to send email', { error, to, subject });
            return false;
        }
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map