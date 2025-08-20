import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "@/auth/service/auth.service";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";

describe("AuthService", () => {
  let authService: AuthService;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue("mock-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("login", () => {
    it("should create a JWT token with the correct payload", () => {
      const mockUser: User = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
        role: Role.Student,
        creationDate: new Date(),
      };

      const result = authService.login(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          username: mockUser.username,
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      );

      expect(result).toEqual({
        accessToken: "mock-token",
      });
    });

    it("should handle different user roles correctly", () => {
      const mockAdminUser: User = {
        id: "2",
        username: "admin",
        email: "admin@example.com",
        password: "hashedpassword",
        role: Role.Admin,
        creationDate: new Date(),
      };

      const result = authService.login(mockAdminUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          username: mockAdminUser.username,
          id: mockAdminUser.id,
          email: mockAdminUser.email,
          role: mockAdminUser.role,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      );

      expect(result).toEqual({
        accessToken: "mock-token",
      });
    });

    it("should create a token with all required payload properties", () => {
      const mockUser: User = {
        id: "3",
        username: "complete",
        email: "complete@example.com",
        password: "hashedpassword",
        role: Role.Student,
        creationDate: new Date(),
      };

      authService.login(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          username: mockUser.username,
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      );
    });
  });
});
