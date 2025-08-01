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

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    mockQuizzRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

    it("should throw if quizz not found", async () => {
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValueOnce(null);

      const context = {
        switchToHttp: () => ({ getRequest: () => ({ params: { quizzId: "uuid" } }) }),
      } as ExecutionContext;

      mockQueryBuilder.getOne.mockResolvedValueOnce(null);
      mockTranslationService.translate = jest
        .fn()
        .mockResolvedValueOnce("Not found");
      await expect(quizzGuard.canActivate(context))
        .rejects.toThrow(new HttpException("Not found", HttpStatus.NOT_FOUND));
    });
  });
});
