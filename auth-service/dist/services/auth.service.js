"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const prisma_1 = __importDefault(require("../config/prisma"));
const config_1 = require("../config");
const utils_1 = require("@medibook/utils");
const logger = (0, utils_1.createLogger)('auth-service');
class AuthService {
    static SALT_ROUNDS = config_1.config.bcrypt.saltRounds;
    static async register(data) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw Object.assign(new Error('User with this email already exists'), {
                statusCode: 409,
                code: 'USER_EXISTS',
            });
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, this.SALT_ROUNDS);
        const user = await prisma_1.default.user.create({
            data: {
                id: (0, uuid_1.v4)(),
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                phone: data.phone,
            },
        });
        logger.info(`User registered: ${user.id}`, { userId: user.id, email: user.email });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    static async login(data) {
        const user = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw Object.assign(new Error('Invalid email or password'), {
                statusCode: 401,
                code: 'INVALID_CREDENTIALS',
            });
        }
        const isValidPassword = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw Object.assign(new Error('Invalid email or password'), {
                statusCode: 401,
                code: 'INVALID_CREDENTIALS',
            });
        }
        const tokens = await this.generateTokens(user);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            ...tokens,
            user: userWithoutPassword,
        };
    }
    static async refreshToken(refreshToken) {
        const storedToken = await prisma_1.default.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw Object.assign(new Error('Invalid or expired refresh token'), {
                statusCode: 401,
                code: 'INVALID_REFRESH_TOKEN',
            });
        }
        await prisma_1.default.refreshToken.delete({
            where: { token: refreshToken },
        });
        const tokens = await this.generateTokens(storedToken.user);
        logger.info(`Token refreshed for user: ${storedToken.user.id}`);
        return tokens;
    }
    static async logout(userId, accessToken) {
        await prisma_1.default.refreshToken.deleteMany({
            where: { userId },
        });
        const decoded = jsonwebtoken_1.default.decode(accessToken);
        if (decoded) {
            await prisma_1.default.blacklistedToken.create({
                data: {
                    token: accessToken,
                    expiresAt: new Date(decoded.exp * 1000),
                },
            });
        }
        logger.info(`User logged out: ${userId}`);
    }
    static async isTokenBlacklisted(token) {
        const blacklisted = await prisma_1.default.blacklistedToken.findUnique({
            where: { token },
        });
        return !!blacklisted;
    }
    static async getUserById(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            return null;
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    static async validateUser(userId, role) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            return false;
        if (role && user.role !== role)
            return false;
        return true;
    }
    static async generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'refresh' }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.refreshExpiresIn });
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
        await prisma_1.default.refreshToken.create({
            data: {
                id: (0, uuid_1.v4)(),
                userId: user.id,
                token: refreshToken,
                expiresAt: refreshTokenExpiry,
            },
        });
        return { accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map