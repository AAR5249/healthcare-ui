import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}
export declare const errorHandler: (err: AppError, req: Request, res: Response, _next: NextFunction) => void;
