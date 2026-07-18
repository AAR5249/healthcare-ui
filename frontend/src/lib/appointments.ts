import api from './api';
import { Appointment, TimeSlot } from '@/types';

export const appointmentService = {
  async getAppointments(filters?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
    status?: string;
  }): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: filters });
    return response.data.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data;
  },

  async createAppointment(data: {
    patientId: string;
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
  }): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data.data;
  },

  async updateAppointment(id: string, data: { status?: string; notes?: string }): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}`, data);
    return response.data.data;
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const response = await api.get(`/appointments/slots/${doctorId}`, {
      params: { date },
    });
    return response.data.data;
  },
};
