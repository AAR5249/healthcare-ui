import { User, AuthTokens, CreateUserDto, LoginDto } from '@medibook/types';
export declare class AuthService {
    private static readonly SALT_ROUNDS;
    static register(data: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
    static login(data: LoginDto): Promise<AuthTokens & {
        user: Omit<User, 'passwordHash'>;
    }>;
    static refreshToken(refreshToken: string): Promise<AuthTokens>;
    static logout(userId: string, accessToken: string): Promise<void>;
    static isTokenBlacklisted(token: string): Promise<boolean>;
    static getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null>;
    static validateUser(userId: string, role?: string): Promise<boolean>;
    private static generateTokens;
}
//# sourceMappingURL=auth.service.d.ts.map