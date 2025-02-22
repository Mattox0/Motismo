import { Test, TestingModule } from "@nestjs/testing";
import { AdminGuard } from "@/auth/guards/admin.guard"; // Chemin vers votre AdminGuard
import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { TranslationService } from "@/translation/translation.service";
import { UserService } from "@/user/service/user.service";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Role } from "@/user/role.enum";

describe("AdminGuard", () => {
  let adminGuard: AdminGuard;
  let mockUserService: Partial<UserService>;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(async () => {
    mockUserService = {};

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated error message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    adminGuard = module.get<AdminGuard>(AdminGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("canActivate", () => {
    it("should successfully activate for an admin user", async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: Role.Admin },
          }),
        }),
      } as ExecutionContext;

      jest
        .spyOn(UserAuthGuard.prototype, "canActivate")
        .mockResolvedValue(true);

      await expect(adminGuard.canActivate(context)).resolves.toEqual(true);
    });

    it("should throw ForbiddenException if user is not admin", async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: Role.Customer },
          }),
        }),
      } as ExecutionContext;

      jest
        .spyOn(UserAuthGuard.prototype, "canActivate")
        .mockResolvedValue(true);

      await expect(adminGuard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(adminGuard.canActivate(context)).rejects.toThrow(
        new ForbiddenException("Translated error message"),
      );
    });

    it("should return false if the user is not authenticated", async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: null,
          }),
        }),
      } as ExecutionContext;

      jest
        .spyOn(UserAuthGuard.prototype, "canActivate")
        .mockResolvedValue(false);

      await expect(adminGuard.canActivate(context)).resolves.toEqual(false);
    });
  });
});
