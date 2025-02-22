import { Test, TestingModule } from "@nestjs/testing";
import { UserGuard } from "@/user/guards/user.guard"; // Chemin vers votre UserGuard
import { TranslationService } from "@/translation/translation.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@/user/user.entity";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";

describe("UserGuard", () => {
  let userGuard: UserGuard;
  let mockUserRepository: Partial<Repository<User>>;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated error message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGuard,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    userGuard = module.get<UserGuard>(UserGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("canActivate", () => {
    it("should throw HttpException if userId is invalid", async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { userId: "invalid-uuid" },
          }),
        }),
      } as ExecutionContext;

      mockTranslationService.translate = jest
        .fn()
        .mockResolvedValue("Invalid ID");

      await expect(userGuard.canActivate(context)).rejects.toThrow(
        HttpException,
      );
      await expect(userGuard.canActivate(context)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException if user is not found", async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { userId: "e85f5bda-8b7c-4dad-b6e5-56dddbcdad54" },
          }),
        }),
      } as ExecutionContext;

      mockUserRepository.findOne = jest.fn().mockResolvedValue(null);
      mockTranslationService.translate = jest
        .fn()
        .mockResolvedValue("User not found");

      await expect(userGuard.canActivate(context)).rejects.toThrow(
        HttpException,
      );
      await expect(userGuard.canActivate(context)).rejects.toThrow(
        new HttpException("User not found", HttpStatus.NOT_FOUND),
      );
    });

    it("should successfully activate if user is found", async () => {
      const mockUser = { id: "e85f5bda-8b7c-4dad-b6e5-56dddbcdad54" };
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { userId: mockUser.id },
            user: undefined,
          }),
        }),
      } as ExecutionContext;

      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      await expect(userGuard.canActivate(context)).resolves.toEqual(true);
    });
  });
});
