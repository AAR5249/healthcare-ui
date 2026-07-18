import { AuthService } from '../services/auth.service';
import prisma from '../config/prisma';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      delete: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
    },
    blacklistedToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient' as const,
      };

      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.register(mockData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockData.email },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe(mockData.email);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw error if user already exists', async () => {
      const mockData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient' as const,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

      await expect(AuthService.register(mockData)).rejects.toMatchObject({
        statusCode: 409,
        code: 'USER_EXISTS',
      });
    });
  });

  describe('login', () => {
    it('should return tokens and user on successful login', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        passwordHash: '$2b$12$validhash',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      jest.spyOn(require('bcrypt'), 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await AuthService.login(mockData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw error for invalid credentials', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login(mockData)).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const mockToken = 'valid-refresh-token';
      const mockRefreshToken = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'patient',
        },
        expiresAt: new Date(Date.now() + 86400000),
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await AuthService.refreshToken(mockToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid refresh token', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.refreshToken('invalid-token')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
      });
    });
  });

  describe('logout', () => {
    it('should delete refresh tokens and blacklist access token', async () => {
      const mockUserId = 'user-123';
      const mockAccessToken = 'access-token';

      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.blacklistedToken.create as jest.Mock).mockResolvedValue({});

      await AuthService.logout(mockUserId, mockAccessToken);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe('getUserById', () => {
    it('should return user without password hash', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.getUserById('user-123');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result?.id).toBe('user-123');
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.getUserById('non-existent');

      expect(result).toBeNull();
    });
  });
});
