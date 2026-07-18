import request from 'supertest';
import express from 'express';
import authRoutes from '../routes';
import { AuthService } from '../services/auth.service';

jest.mock('../services/auth.service');
jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: { $connect: jest.fn() },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        createdAt: new Date(),
      };

      (AuthService.register as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'patient',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'uuid-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      (AuthService.login as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_CREDENTIALS';

      (AuthService.login as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/auth/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('auth-service');
    });
  });
});
