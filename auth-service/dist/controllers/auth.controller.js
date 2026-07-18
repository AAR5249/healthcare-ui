"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const utils_1 = require("@medibook/utils");
const utils_2 = require("@medibook/utils");
class AuthController {
    static async register(req, res, next) {
        try {
            const validatedData = utils_2.registerSchema.parse(req.body);
            const user = await auth_service_1.AuthService.register(validatedData);
            (0, utils_1.sendResponse)(res, 201, user, 'User registered successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const validatedData = utils_2.loginSchema.parse(req.body);
            const result = await auth_service_1.AuthService.login(validatedData);
            (0, utils_1.sendResponse)(res, 200, result, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const validatedData = utils_2.refreshTokenSchema.parse(req.body);
            const tokens = await auth_service_1.AuthService.refreshToken(validatedData.refreshToken);
            (0, utils_1.sendResponse)(res, 200, tokens, 'Token refreshed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const authReq = req;
            const user = authReq.user;
            const authHeader = req.headers.authorization;
            const accessToken = authHeader?.split(' ')[1];
            if (!accessToken) {
                (0, utils_1.sendError)(res, 400, 'MISSING_TOKEN', 'Access token required');
                return;
            }
            await auth_service_1.AuthService.logout(user.userId, accessToken);
            (0, utils_1.sendResponse)(res, 200, null, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            const authReq = req;
            const user = authReq.user;
            const userData = await auth_service_1.AuthService.getUserById(user.userId);
            if (!userData) {
                (0, utils_1.sendError)(res, 404, 'USER_NOT_FOUND', 'User not found');
                return;
            }
            (0, utils_1.sendResponse)(res, 200, userData);
        }
        catch (error) {
            next(error);
        }
    }
    static async health(req, res) {
        res.json({
            status: 'ok',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map