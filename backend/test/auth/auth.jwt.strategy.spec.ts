import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy } from "@/auth/strategies/jwt.strategy";
import { Request } from "express";
import { Role } from "@/user/role.enum";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should throw error if JWT_SECRET is not defined", () => {
      delete process.env.JWT_SECRET;
      expect(() => new JwtStrategy()).toThrow(
        "JWT_SECRET environment variable is not defined",
      );
    });

    it("should create strategy instance when JWT_SECRET is defined", () => {
      expect(() => new JwtStrategy()).not.toThrow();
    });
  });

  describe("extractJWT", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [JwtStrategy],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it("should extract JWT from cookies when present", () => {
      const mockRequest = {
        cookies: {
          access_token: "valid-token",
        },
      } as unknown as Request;

      type ExtractJwtFunction = (request: Request) => string | null;
      const extractJWT = (
        JwtStrategy as unknown as { extractJWT: ExtractJwtFunction }
      ).extractJWT;

      const result = extractJWT(mockRequest);

      expect(result).toBe("valid-token");
    });

    it("should return null when no access_token in cookies", () => {
      const mockRequest = {
        cookies: {},
      } as Request;

      type ExtractJwtFunction = (request: Request) => string | null;
      const extractJWT = (
        JwtStrategy as unknown as { extractJWT: ExtractJwtFunction }
      ).extractJWT;

      const result = extractJWT(mockRequest);

      expect(result).toBeNull();
    });

    it("should return null when access_token is empty string", () => {
      const mockRequest = {
        cookies: {
          access_token: "",
        },
      } as unknown as Request;

      type ExtractJwtFunction = (request: Request) => string | null;
      const extractJWT = (
        JwtStrategy as unknown as { extractJWT: ExtractJwtFunction }
      ).extractJWT;

      const result = extractJWT(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe("validate", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [JwtStrategy],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it("should return user payload", () => {
      const payload = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        role: Role.Customer,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      });
    });

    it("should handle all user roles", () => {
      const payload = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        role: Role.Admin,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      });
    });

    it("should return exactly the required fields", () => {
      const payload = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        role: Role.Customer,
        extraField: "should not be included",
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      });
      expect(result).not.toHaveProperty("extraField");
    });
  });
});
