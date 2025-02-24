import { Test, TestingModule } from "@nestjs/testing";
import { QuizzGuard } from "@/quizz/guards/quizz.guard";
import { TranslationService } from "@/translation/translation.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Quizz } from "@/quizz/quizz.entity";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";

describe("QuizzGuard", () => {
  let quizzGuard: QuizzGuard;
  let mockQuizzRepository: Partial<Repository<Quizz>>;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(async () => {
    mockQuizzRepository = {
      findOne: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated error message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzGuard,
        {
          provide: getRepositoryToken(Quizz),
          useValue: mockQuizzRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    quizzGuard = module.get<QuizzGuard>(QuizzGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("canActivate", () => {
    it("should throw HttpException if quizzId is invalid", async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { quizzId: "invalid-uuid" },
          }),
        }),
      } as ExecutionContext;

      mockTranslationService.translate = jest
        .fn()
        .mockResolvedValue("Invalid ID");

      await expect(quizzGuard.canActivate(context)).rejects.toThrow(
        HttpException,
      );
      await expect(quizzGuard.canActivate(context)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException if quizz is not found", async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { quizzId: "e85f5bda-8b7c-4dad-b6e5-56dddbcdad54" },
          }),
        }),
      } as ExecutionContext;

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(null);
      mockTranslationService.translate = jest
        .fn()
        .mockResolvedValue("Quizz not found");

      await expect(quizzGuard.canActivate(context)).rejects.toThrow(
        HttpException,
      );
      await expect(quizzGuard.canActivate(context)).rejects.toThrow(
        new HttpException("Quizz not found", HttpStatus.NOT_FOUND),
      );
    });

    it("should successfully activate if quizz is found", async () => {
      const mockQuizz = { id: "e85f5bda-8b7c-4dad-b6e5-56dddbcdad54" };
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { quizzId: mockQuizz.id },
          }),
        }),
      } as ExecutionContext;

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(mockQuizz);

      await expect(quizzGuard.canActivate(context)).resolves.toEqual(true);
    });

    it("should set quizz on request if quizz is found", async () => {
      const mockQuizz = { id: "e85f5bda-8b7c-4dad-b6e5-56dddbcdad54" };
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { quizzId: mockQuizz.id },
            quizz: undefined,
          }),
        }),
      } as ExecutionContext;

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(mockQuizz);

      await expect(quizzGuard.canActivate(context)).resolves.toEqual(true);
    });
  });
});
