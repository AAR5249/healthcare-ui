import { Appointment, AppointmentStatus } from '@medibook/types';
declare class EventPublisher {
    private publisher;
    private channel;
    constructor();
    publishAppointmentCreated(appointment: Appointment): Promise<void>;
    publishAppointmentUpdated(appointment: Appointment, oldStatus: AppointmentStatus): Promise<void>;
    private publish;
    private getEventType;
    disconnect(): Promise<void>;
}
export declare const eventPublisher: EventPublisher;
export {};
//# sourceMappingURL=index.d.ts.map