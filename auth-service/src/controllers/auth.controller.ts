import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse, sendError } from '@medibook/utils';
import { registerSchema, loginSchema, refreshTokenSchema } from '@medibook/utils';
import { AuthenticatedRequest } from '@medibook/middleware';
import { JwtPayload } from '@medibook/types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await AuthService.register(validatedData);
      sendResponse(res, 201, user, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      sendResponse(res, 200, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const tokens = await AuthService.refreshToken(validatedData.refreshToken);
      sendResponse(res, 200, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user as JwtPayload;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.split(' ')[1];

      if (!accessToken) {
        sendError(res, 400, 'MISSING_TOKEN', 'Access token required');
        return;
      }

      await AuthService.logout(user.userId, accessToken);
      sendResponse(res, 200, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user as JwtPayload;
      const userData = await AuthService.getUserById(user.userId);

      if (!userData) {
        sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
        return;
      }

      sendResponse(res, 200, userData);
    } catch (error) {
      next(error);
    }
  }

  static async health(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
