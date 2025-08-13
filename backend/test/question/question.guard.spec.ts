import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { QuestionGuard } from "../../src/question/guards/question.guard";
import { TranslationService } from "../../src/translation/translation.service";
import { Question } from "../../src/question/question.entity";
import { IRequestWithParamQuestion } from "../../src/question/types/IRequestWithParamQuestion";

describe("QuestionGuard", () => {
  let guard: QuestionGuard;
  let questionRepository: jest.Mocked<Repository<Question>>;
  let translationService: jest.Mocked<TranslationService>;

  const mockQuestion = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Test Question",
    questionType: "MULTIPLE_CHOICES",
    quizz: { id: "quiz-id" },
    choices: [],
    games: [],
    responses: [],
    order: 1,
    creationDate: new Date(),
  };

  beforeEach(async () => {
    const mockQuestionRepository = {
      findOne: jest.fn(),
    };

    const mockTranslationService = {
      translate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionGuard,
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    guard = module.get<QuestionGuard>(QuestionGuard);
    questionRepository = module.get(getRepositoryToken(Question));
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

    it("should return true when question exists and ID is valid", async () => {
      const context = createMockContext({
        questionId: "123e4567-e89b-12d3-a456-426614174000",
      });

      questionRepository.findOne.mockResolvedValue(mockQuestion as any);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it("should throw HttpException when questionId is missing", async () => {
      const context = createMockContext({});

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when questionId is not a valid UUID", async () => {
      const context = createMockContext({ questionId: "invalid-uuid" });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when questionId is null", async () => {
      const context = createMockContext({ questionId: null });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when questionId is undefined", async () => {
      const context = createMockContext({ questionId: undefined });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw HttpException when question is not found", async () => {
      const context = createMockContext({
        questionId: "123e4567-e89b-12d3-a456-426614174000",
      });

      questionRepository.findOne.mockResolvedValue(null);
      translationService.translate.mockResolvedValue("Question not found");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Question not found", HttpStatus.NOT_FOUND),
      );
    });

    it("should set question in request when found", async () => {
      const mockRequest: any = {
        params: { questionId: "123e4567-e89b-12d3-a456-426614174000" },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      };

      questionRepository.findOne.mockResolvedValue(mockQuestion as any);

      await guard.canActivate(context as any);

      expect(mockRequest.question).toEqual(mockQuestion);
    });

    it("should handle empty string questionId", async () => {
      const context = createMockContext({ questionId: "" });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should handle malformed UUID", async () => {
      const context = createMockContext({
        questionId: "123e4567-e89b-12d3-a456",
      });

      translationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });
  });
});
