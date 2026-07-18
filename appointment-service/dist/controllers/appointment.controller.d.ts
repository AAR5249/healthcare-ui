import { Request, Response, NextFunction } from 'express';
export declare class AppointmentController {
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void>;
    static health(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=appointment.controller.d.ts.map