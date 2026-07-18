declare class EmailService {
    private transporter;
    constructor();
    sendAppointmentConfirmation(to: string, data: {
        date: string;
        startTime: string;
        endTime: string;
        doctorId: string;
        patientId: string;
    }): Promise<boolean>;
    sendAppointmentCancellation(to: string, data: {
        date: string;
        startTime: string;
        doctorId: string;
    }): Promise<boolean>;
    sendAppointmentReminder(to: string, data: {
        date: string;
        startTime: string;
        endTime: string;
    }): Promise<boolean>;
    private sendEmail;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=email.service.d.ts.map