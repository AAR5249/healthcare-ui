import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { config } from '../config';
import { User, AuthTokens, CreateUserDto, LoginDto, JwtPayload } from '@medibook/types';
import { createLogger } from '@medibook/utils';

const logger = createLogger('auth-service');

export class AuthService {
  private static readonly SALT_ROUNDS = config.bcrypt.saltRounds;

  static async register(data: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw Object.assign(new Error('User with this email already exists'), {
        statusCode: 409,
        code: 'USER_EXISTS',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
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
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  static async login(data: LoginDto): Promise<AuthTokens & { user: Omit<User, 'passwordHash'> }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

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
      user: userWithoutPassword as Omit<User, 'passwordHash'>,
    };
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw Object.assign(new Error('Invalid or expired refresh token'), {
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    const tokens = await this.generateTokens(storedToken.user);

    logger.info(`Token refreshed for user: ${storedToken.user.id}`);

    return tokens;
  }

  static async logout(userId: string, accessToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    const decoded = jwt.decode(accessToken) as JwtPayload;

    if (decoded) {
      await prisma.blacklistedToken.create({
        data: {
          token: accessToken,
          expiresAt: new Date(decoded.exp * 1000),
        },
      });
    }

    logger.info(`User logged out: ${userId}`);
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    });
    return !!blacklisted;
  }

  static async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  static async validateUser(userId: string, role?: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;
    if (role && user.role !== role) return false;
    return true;
  }

  private static async generateTokens(user: { id: string; email: string; role: string }): Promise<AuthTokens> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });

    return { accessToken, refreshToken };
  }
}
