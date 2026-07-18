import { Response } from 'express';
import { ApiResponse } from '@medibook/types';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    data,
    message,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  error: string,
  message?: string
): void => {
  const response: ApiResponse<never> = {
    success: false,
    error,
    message,
  };
  res.status(statusCode).json(response);
};
