import { Response } from 'express';
export declare const sendResponse: <T>(res: Response, statusCode: number, data?: T, message?: string) => void;
export declare const sendError: (res: Response, statusCode: number, error: string, message?: string) => void;
