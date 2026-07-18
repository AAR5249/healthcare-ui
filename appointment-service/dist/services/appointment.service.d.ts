import { Appointment, TimeSlot, CreateAppointmentDto, UpdateAppointmentDto, AppointmentFilter } from '@medibook/types';
export declare class AppointmentService {
    static createAppointment(data: CreateAppointmentDto): Promise<Appointment>;
    static getAppointments(filter: AppointmentFilter): Promise<Appointment[]>;
    static getAppointmentById(id: string): Promise<Appointment | null>;
    static updateAppointment(id: string, data: UpdateAppointmentDto): Promise<Appointment>;
    static deleteAppointment(id: string): Promise<void>;
    static getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]>;
    static isSlotAvailable(doctorId: string, date: string, startTime: string, endTime: string): Promise<boolean>;
}
//# sourceMappingURL=appointment.service.d.ts.map