import { Request, Response, NextFunction } from 'express';
export declare const metricsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const metricsEndpoint: (req: Request, res: Response) => Promise<void>;
