import { Test, TestingModule } from "@nestjs/testing";
import {
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { TranslationService } from "@/translation/translation.service";
import { UserService } from "@/user/service/user.service";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";

describe("UserAuthGuard", () => {
  let guard: UserAuthGuard;
  let mockTranslationService: Partial<TranslationService>;
  let mockUserService: Partial<UserService>;

  beforeEach(async () => {
    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated error message"),
    };

    mockUserService = {
      findOneUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthGuard,
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<UserAuthGuard>(UserAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("canActivate", () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: "1" },
          }),
        }),
      } as unknown as ExecutionContext;

      // Mock la méthode canActivate du JwtAuthGuard parent
      jest.spyOn(JwtAuthGuard.prototype, "canActivate").mockResolvedValue(true);
    });

    it("should return true when authentication and user validation are successful", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@yopmail.com",
        password: "password",
        role: Role.Customer,
      } as User;

      jest.spyOn(mockUserService, "findOneUser").mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockUserService.findOneUser).toHaveBeenCalledWith("1");
    });

    it("should return false when JwtAuthGuard returns false", async () => {
      jest
        .spyOn(JwtAuthGuard.prototype, "canActivate")
        .mockResolvedValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it("should throw BadRequestException when user is not in request", async () => {
      const contextWithoutUser = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(contextWithoutUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "error.USER_NOT_FOUND",
      );
    });

    it("should throw NotFoundException when user is not found in database", async () => {
      jest.spyOn(mockUserService, "findOneUser").mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "error.USER_NOT_FOUND",
      );
    });
  });
});
