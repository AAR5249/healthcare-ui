import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medibook',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    channel: process.env.NOTIFICATION_CHANNEL || 'appointment_events',
  },
  appointment: {
    workingHoursStart: 9,
    workingHoursEnd: 17,
    slotDurationMinutes: 30,
  },
};
