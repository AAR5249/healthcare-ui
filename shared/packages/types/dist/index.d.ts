export type UserRole = 'patient' | 'doctor' | 'admin';
export interface User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
}
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    reason?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateAppointmentDto {
    patientId: string;
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
}
export interface UpdateAppointmentDto {
    status?: AppointmentStatus;
    notes?: string;
}
export interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}
export interface AppointmentFilter {
    patientId?: string;
    doctorId?: string;
    date?: string;
    status?: AppointmentStatus;
}
export type NotificationType = 'appointment_created' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder';
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    appointmentId?: string;
    isRead: boolean;
    createdAt: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface HealthCheckResponse {
    status: 'ok' | 'error';
    service: string;
    timestamp: string;
    uptime: number;
}
