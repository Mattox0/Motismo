import { Test, TestingModule } from "@nestjs/testing";
import { QuestionService } from "@/question/service/question.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Question } from "@/question/question.entity";
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { TranslationService } from "@/translation/translation.service";
import { ChoiceService } from "@/choice/service/choice.service";
import { FileUploadService } from "@/files/files.service";
import { BadRequestException } from "@nestjs/common";
import { QuestionType } from "@/question/types/questionType";

describe("QuestionService", () => {
  let service: QuestionService;
  let mockQuestionRepository: any;
  let mockChoiceQuestionRepository: any;
  let mockTranslationService: any;
  let mockChoiceService: any;
  let mockFileUploadService: any;

  beforeEach(async () => {
    mockQuestionRepository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    mockChoiceQuestionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("translated message"),
    };

    mockChoiceService = {
      createChoice: jest.fn(),
      updateChoices: jest.fn(),
    };

    mockFileUploadService = {
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: getRepositoryToken(ChoiceQuestion),
          useValue: mockChoiceQuestionRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
        {
          provide: ChoiceService,
          useValue: mockChoiceService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getQuestions", () => {
    it("should return questions for a quizz", async () => {
      const mockQuizz = { id: "quizz-id" };
      const mockQuestions = [{ id: "q1", title: "Question 1" }];

      mockQuestionRepository.find.mockResolvedValue(mockQuestions);

      const result = await service.getQuestions(mockQuizz as any);

      expect(mockQuestionRepository.find).toHaveBeenCalledWith({
        where: { quizz: { id: "quizz-id" } },
        order: { order: "ASC" },
        relations: ["choices", "quizz"],
      });
      expect(result).toEqual(mockQuestions);
    });
  });

  describe("getMaxOrder", () => {
    it("should return the number of questions in quizz", async () => {
      const mockQuestions = [
        { id: "q1", order: 1 },
        { id: "q2", order: 2 },
        { id: "q3", order: 3 },
      ];

      mockQuestionRepository.find.mockResolvedValue(mockQuestions);

      const result = await service['getMaxOrder']("quizz-id");

      expect(mockQuestionRepository.find).toHaveBeenCalledWith({
        where: { quizz: { id: "quizz-id" } },
        order: { order: "ASC" },
      });
      expect(result).toBe(3);
    });

    it("should return 0 if no questions", async () => {
      mockQuestionRepository.find.mockResolvedValue([]);

      const result = await service['getMaxOrder']("quizz-id");

      expect(result).toBe(0);
    });
  });

  describe("normalizeOrders", () => {
    it("should normalize question orders", async () => {
      const mockQuestions = [
        { id: "q1", order: 1 },
        { id: "q2", order: 3 },
        { id: "q3", order: 5 },
      ];

      mockQuestionRepository.find.mockResolvedValue(mockQuestions);

      await service['normalizeOrders']("quizz-id");

      expect(mockQuestionRepository.update).toHaveBeenCalledWith("q2", { order: 2 });
      expect(mockQuestionRepository.update).toHaveBeenCalledWith("q3", { order: 3 });
    });

    it("should not update if orders are already normalized", async () => {
      const mockQuestions = [
        { id: "q1", order: 1 },
        { id: "q2", order: 2 },
        { id: "q3", order: 3 },
      ];

      mockQuestionRepository.find.mockResolvedValue(mockQuestions);

      await service['normalizeOrders']("quizz-id");

      expect(mockQuestionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("createQuestion", () => {
    const mockQuizz = { id: "quizz-id" };

    beforeEach(() => {
      jest.spyOn(service as any, 'getMaxOrder').mockResolvedValue(2);
      jest.spyOn(service as any, 'reorderQuestions').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'normalizeOrders').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'createChoiceQuestion').mockResolvedValue(undefined);
    });

    it("should create choice question", async () => {
      const createQuestionDto = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
        ],
        order: 3,
      };

      await service.createQuestion(mockQuizz as any, createQuestionDto as any);

      expect(service['createChoiceQuestion']).toHaveBeenCalledWith(mockQuizz, {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: createQuestionDto.choices,
        order: 3,
      });
    });

    it("should throw error if choice question has no choices", async () => {
      const createQuestionDto = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [],
      };

      await expect(service.createQuestion(mockQuizz as any, createQuestionDto as any))
        .rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "error.CHOICES_REQUIRED_FOR_CHOICE_QUESTIONS"
      );
    });

    it("should create word cloud question", async () => {
      const createQuestionDto = {
        title: "Test Question",
        questionType: QuestionType.WORD_CLOUD,
        order: 2,
      };

      const mockQuestion = { id: "new-question-id" };
      mockQuestionRepository.create.mockReturnValue(mockQuestion);

      await service.createQuestion(mockQuizz as any, createQuestionDto as any);

      expect(mockQuestionRepository.create).toHaveBeenCalledWith({
        title: "Test Question",
        quizz: mockQuizz,
        questionType: QuestionType.WORD_CLOUD,
        order: 2,
      });
      expect(mockQuestionRepository.save).toHaveBeenCalledWith(mockQuestion);
    });

    it("should use max order + 1 if no order provided", async () => {
      const createQuestionDto = {
        title: "Test Question",
        questionType: QuestionType.WORD_CLOUD,
      };

      const mockQuestion = { id: "new-question-id" };
      mockQuestionRepository.create.mockReturnValue(mockQuestion);

      await service.createQuestion(mockQuizz as any, createQuestionDto as any);

      expect(mockQuestionRepository.create).toHaveBeenCalledWith({
        title: "Test Question",
        quizz: mockQuizz,
        questionType: QuestionType.WORD_CLOUD,
        order: 3,
      });
    });

    it("should throw error for invalid order", async () => {
      const createQuestionDto = {
        title: "Test Question",
        questionType: QuestionType.WORD_CLOUD,
        order: 0,
      };

      await expect(service.createQuestion(mockQuizz as any, createQuestionDto as any))
        .rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_ORDER_VALUE");
    });

    it("should throw error for unsupported question type", async () => {
      const createQuestionDto = {
        title: "Test Question",
        questionType: "UNSUPPORTED_TYPE" as any,
      };

      await expect(service.createQuestion(mockQuizz as any, createQuestionDto as any))
        .rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.UNSUPPORTED_QUESTION_TYPE");
    });
  });

  describe("createChoiceQuestion", () => {
    const mockQuizz = { id: "quizz-id" };

    beforeEach(() => {
      jest.spyOn(service as any, 'getMaxOrder').mockResolvedValue(2);
      jest.spyOn(service as any, 'reorderQuestions').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'normalizeOrders').mockResolvedValue(undefined);
    });

    it("should create choice question with choices", async () => {
      const createChoiceQuestionDto = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
        ],
        order: 2,
      };

      const mockQuestion = { id: "new-question-id" };
      mockChoiceQuestionRepository.create.mockReturnValue(mockQuestion);
      mockChoiceQuestionRepository.save.mockResolvedValue(mockQuestion);

      await service.createChoiceQuestion(mockQuizz as any, createChoiceQuestionDto as any);

      expect(mockChoiceQuestionRepository.create).toHaveBeenCalledWith({
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [
          { text: "Choice 1", isCorrect: true },
          { text: "Choice 2", isCorrect: false },
        ],
        quizz: mockQuizz,
        order: 2,
      });
      expect(mockChoiceService.createChoice).toHaveBeenCalledTimes(2);
      expect(service['normalizeOrders']).toHaveBeenCalledWith("quizz-id");
    });

    it("should throw error for invalid order", async () => {
      const createChoiceQuestionDto = {
        title: "Test Question",
        questionType: QuestionType.MULTIPLE_CHOICES,
        choices: [],
        order: 5,
      };

      await expect(service.createChoiceQuestion(mockQuizz as any, createChoiceQuestionDto as any))
        .rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_ORDER_VALUE");
    });
  });

  describe("updateQuestion", () => {
    const mockQuizz = { id: "quizz-id" };
    const mockQuestion = {
      id: "question-id",
      questionType: QuestionType.MULTIPLE_CHOICES,
      order: 2,
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'getMaxOrder').mockResolvedValue(3);
      jest.spyOn(service as any, 'reorderQuestions').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'normalizeOrders').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'updateChoiceQuestion').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'deleteUnusedImages').mockResolvedValue(undefined);
    });

    it("should update choice question", async () => {
      const choiceQuestion = Object.assign(new ChoiceQuestion(), mockQuestion);
      
      const updateQuestionDto = {
        title: "Updated Question",
        choices: [{ text: "New Choice", isCorrect: true }],
      };

      await service.updateQuestion(mockQuizz as any, choiceQuestion as any, updateQuestionDto as any);

      expect(service['updateChoiceQuestion']).toHaveBeenCalledWith(
        mockQuizz,
        choiceQuestion,
        {
          title: "Updated Question",
          questionType: QuestionType.MULTIPLE_CHOICES,
          choices: updateQuestionDto.choices,
        }
      );
    });

    it("should update non-choice question", async () => {
      const nonChoiceQuestion = {
        id: "question-id",
        questionType: QuestionType.WORD_CLOUD,
        order: 2,
      };

      const updateQuestionDto = {
        title: "Updated Question",
        order: 1,
      };

      await service.updateQuestion(mockQuizz as any, nonChoiceQuestion as any, updateQuestionDto as any);

      expect(service['reorderQuestions']).toHaveBeenCalledWith("quizz-id", 1, 2);
      expect(mockQuestionRepository.update).toHaveBeenCalledWith("question-id", {
        title: "Updated Question",
        order: 1,
      });
    });

    it("should throw error for invalid order", async () => {
      jest.spyOn(service as any, 'getMaxOrder').mockResolvedValue(3);
      
      const nonChoiceQuestion = {
        id: "question-id",
        questionType: QuestionType.WORD_CLOUD,
        order: 2,
      };
      
      const updateQuestionDto = {
        order: 5,
      };

      await expect(service.updateQuestion(mockQuizz as any, nonChoiceQuestion as any, updateQuestionDto as any))
        .rejects.toThrow(BadRequestException);
    });

    it("should throw error for unsupported question type", async () => {
      const unsupportedQuestion = {
        id: "question-id",
        questionType: "UNSUPPORTED_TYPE" as any,
        order: 2,
      };

      await expect(service.updateQuestion(mockQuizz as any, unsupportedQuestion as any, {} as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe("updateChoiceQuestion", () => {
    const mockQuizz = { id: "quizz-id" };
    const mockQuestion = {
      id: "question-id",
      questionType: QuestionType.MULTIPLE_CHOICES,
      order: 2,
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'getMaxOrder').mockResolvedValue(3);
      jest.spyOn(service as any, 'reorderQuestions').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'normalizeOrders').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'deleteUnusedImages').mockResolvedValue(undefined);
    });

    it("should update choice question", async () => {
      const updateChoiceQuestionDto = {
        title: "Updated Question",
        choices: [{ text: "New Choice", isCorrect: true }],
      };

      await service.updateChoiceQuestion(mockQuizz as any, mockQuestion as any, updateChoiceQuestionDto as any);

      expect(mockChoiceQuestionRepository.update).toHaveBeenCalledWith("question-id", {
        title: "Updated Question",
      });
      expect(mockChoiceService.updateChoices).toHaveBeenCalledWith(mockQuestion, updateChoiceQuestionDto.choices);
    });

    it("should reorder if order changed", async () => {
      const updateChoiceQuestionDto = {
        order: 1,
      };

      await service.updateChoiceQuestion(mockQuizz as any, mockQuestion as any, updateChoiceQuestionDto as any);

      expect(service['reorderQuestions']).toHaveBeenCalledWith("quizz-id", 1, 2);
    });
  });

  describe("deleteQuestion", () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'normalizeOrders').mockResolvedValue(undefined);
    });

    it("should delete question and normalize orders", async () => {
      const mockQuestion = {
        id: "question-id",
        image: "image-url",
        quizz: { id: "quizz-id" },
      };

      await service.deleteQuestion(mockQuestion as any);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith("image-url");
      expect(mockQuestionRepository.delete).toHaveBeenCalledWith("question-id");
      expect(service['normalizeOrders']).toHaveBeenCalledWith("quizz-id");
    });

    it("should not delete image if question has no image", async () => {
      const mockQuestion = {
        id: "question-id",
        image: null,
        quizz: { id: "quizz-id" },
      };

      await service.deleteQuestion(mockQuestion as any);

      expect(mockFileUploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockQuestionRepository.delete).toHaveBeenCalledWith("question-id");
      expect(service['normalizeOrders']).toHaveBeenCalledWith("quizz-id");
    });
  });

  describe("deleteUnusedImages", () => {
    it("should delete old image if new image is different", async () => {
      const mockQuestion = {
        image: "old-image-url",
      };

      const updateDto = {
        image: "new-image-url",
      };

      await service['deleteUnusedImages'](mockQuestion as any, updateDto as any);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith("old-image-url");
    });

    it("should not delete image if same", async () => {
      const mockQuestion = {
        image: "same-image-url",
      };

      const updateDto = {
        image: "same-image-url",
      };

      await service['deleteUnusedImages'](mockQuestion as any, updateDto as any);

      expect(mockFileUploadService.deleteFile).not.toHaveBeenCalled();
    });

    it("should not delete if no new image", async () => {
      const mockQuestion = {
        image: "old-image-url",
      };

      const updateDto = {};

      await service['deleteUnusedImages'](mockQuestion as any, updateDto as any);

      expect(mockFileUploadService.deleteFile).not.toHaveBeenCalled();
    });
  });
});