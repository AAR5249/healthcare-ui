import { Request, Response, NextFunction } from 'express';
import { JwtPayload, UserRole } from '@medibook/types';
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (...allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
