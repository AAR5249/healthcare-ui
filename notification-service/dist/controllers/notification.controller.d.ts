import { Request, Response, NextFunction } from 'express';
export declare class NotificationController {
    static getByUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static health(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=notification.controller.d.ts.map