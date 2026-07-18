import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["patient", "doctor", "admin"]>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "patient" | "doctor" | "admin";
    phone?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "patient" | "doctor" | "admin";
    phone?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const createAppointmentSchema: z.ZodObject<{
    patientId: z.ZodString;
    doctorId: z.ZodString;
    date: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    patientId: string;
    doctorId: string;
    startTime: string;
    endTime: string;
    reason?: string | undefined;
}, {
    date: string;
    patientId: string;
    doctorId: string;
    startTime: string;
    endTime: string;
    reason?: string | undefined;
}>;
export declare const updateAppointmentSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "cancelled", "completed"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "confirmed" | "cancelled" | "completed" | undefined;
    notes?: string | undefined;
}, {
    status?: "pending" | "confirmed" | "cancelled" | "completed" | undefined;
    notes?: string | undefined;
}>;
export declare const appointmentFilterSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    doctorId: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "cancelled", "completed"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "confirmed" | "cancelled" | "completed" | undefined;
    date?: string | undefined;
    patientId?: string | undefined;
    doctorId?: string | undefined;
}, {
    status?: "pending" | "confirmed" | "cancelled" | "completed" | undefined;
    date?: string | undefined;
    patientId?: string | undefined;
    doctorId?: string | undefined;
}>;
export declare const dateQuerySchema: z.ZodObject<{
    date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
}, {
    date: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentFilterInput = z.infer<typeof appointmentFilterSchema>;
