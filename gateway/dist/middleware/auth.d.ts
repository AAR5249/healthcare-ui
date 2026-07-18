import { Request, Response, NextFunction } from 'express';
export declare const isPublicPath: (path: string) => boolean;
export declare const jwtMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map