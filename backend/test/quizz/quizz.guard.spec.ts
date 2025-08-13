import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { QuizzGuard } from "../../src/quizz/guards/quizz.guard";
import { TranslationService } from "../../src/translation/translation.service";
import { Quizz } from "../../src/quizz/quizz.entity";
import { IRequestWithParamQuizz } from "../../src/quizz/types/IRequestWithParamQuizz";

describe("QuizzGuard", () => {
  let guard: QuizzGuard;
  let quizzRepository: any;
  let translationService: jest.Mocked<TranslationService>;

  const mockQuizz = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Test Quiz",
    author: { id: "user-id", name: "Test User" },
    questions: [],
    cards: [],
    quizzType: "QUESTIONS",
    games: [],
    creationDate: new Date(),
  };

  beforeEach(async () => {
    const mockQuizzRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const mockTranslationService = {
      translate: jest.fn(),
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

    guard = module.get<QuizzGuard>(QuizzGuard);
    quizzRepository = module.get(getRepositoryToken(Quizz));
    translationService = module.get(TranslationService);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    const createMockContext = (params: any) => ({
      switchToHttp: () => ({
        getRequest: () => ({
          params,
        }),
      }),
    });

    it("should return true when quizz exists and ID is valid", async () => {
      const context = createMockContext({
        quizzId: "123e4567-e89b-12d3-a456-426614174000",
      });

      quizzRepository.getOne.mockResolvedValue(mockQuizz as any);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
      expect(quizzRepository.createQueryBuilder).toHaveBeenCalledWith("quizz");
      expect(quizzRepository.leftJoinAndSelect).toHaveBeenCalledWith("quizz.author", "author");
      expect(quizzRepository.leftJoinAndSelect).toHaveBeenCalledWith("quizz.questions", "questions");
      expect(quizzRepository.leftJoinAndSelect).toHaveBeenCalledWith("questions.choices", "choices");
      expect(quizzRepository.leftJoinAndSelect).toHaveBeenCalledWith("quizz.cards", "cards");
      expect(quizzRepository.where).toHaveBeenCalledWith("quizz.id = :quizzId", {
        quizzId: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(quizzRepository.orderBy).toHaveBeenCalledWith("questions.order", "ASC");
      expect(quizzRepository.addOrderBy).toHaveBeenCalledWith("cards.order", "ASC");
    });

    it("should throw HttpException when quizzId is missing", async () => {
      const context = createMockContext({});

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when quizzId is not a valid UUID", async () => {
      const context = createMockContext({ quizzId: "invalid-uuid" });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when quizzId is null", async () => {
      const context = createMockContext({ quizzId: null });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when quizzId is undefined", async () => {
      const context = createMockContext({ quizzId: undefined });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when quizz is not found", async () => {
      const context = createMockContext({
        quizzId: "123e4567-e89b-12d3-a456-426614174000",
      });

      quizzRepository.getOne.mockResolvedValue(null);
      translationService.translate.mockResolvedValue("Quiz not found");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Quiz not found", HttpStatus.NOT_FOUND),
      );
    });

    it("should set quizz in request when found", async () => {
      const mockRequest: any = {
        params: { quizzId: "123e4567-e89b-12d3-a456-426614174000" },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      };

      quizzRepository.getOne.mockResolvedValue(mockQuizz as any);

      await guard.canActivate(context as any);

      expect(mockRequest.quizz).toEqual(mockQuizz);
    });

    it("should handle empty string quizzId", async () => {
      const context = createMockContext({ quizzId: "" });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should handle malformed UUID", async () => {
      const context = createMockContext({ quizzId: "123e4567-e89b-12d3-a456" });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should handle quizz with questions and cards", async () => {
      const context = createMockContext({
        quizzId: "123e4567-e89b-12d3-a456-426614174000",
      });
      const quizzWithData = {
        ...mockQuizz,
        questions: [
          { id: "q1", title: "Question 1", order: 1, choices: [] },
          { id: "q2", title: "Question 2", order: 2, choices: [] },
        ],
        cards: [
          { id: "c1", rectoText: "Card 1", order: 1 },
          { id: "c2", rectoText: "Card 2", order: 2 },
        ],
      };

      quizzRepository.getOne.mockResolvedValue(quizzWithData as any);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
    });
  });
});
