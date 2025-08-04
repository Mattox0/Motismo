import { Test, TestingModule } from "@nestjs/testing";
import { ChoiceService } from "@/choice/service/choice.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Choice } from "@/choice/choice.entity";
import { TranslationService } from "@/translation/translation.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("ChoiceService", () => {
  let service: ChoiceService;
  let mockChoiceRepository: any;
  let mockTranslationService: any;

  beforeEach(async () => {
    mockChoiceRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("translated message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChoiceService,
        {
          provide: getRepositoryToken(Choice),
          useValue: mockChoiceRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    service = module.get<ChoiceService>(ChoiceService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createChoice", () => {
    it("should create and save a choice", async () => {
      const choiceDto = { text: "Test choice", isCorrect: true };
      const mockQuestion = { id: "question-id" };
      const mockChoice = { id: "choice-id", ...choiceDto };

      mockChoiceRepository.create.mockReturnValue(mockChoice);
      mockChoiceRepository.save.mockResolvedValue(mockChoice);

      const result = await service.createChoice(choiceDto as any, mockQuestion as any);

      expect(mockChoiceRepository.create).toHaveBeenCalledWith(choiceDto);
      expect(mockChoiceRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockChoice);
    });
  });

  describe("createChoice", () => {
    it("should create and save a choice", async () => {
      const choiceDto = { text: "Test choice", isCorrect: true };
      const mockQuestion = { id: "question-id" };
      const mockChoice = { id: "choice-id", ...choiceDto };

      mockChoiceRepository.create.mockReturnValue(mockChoice);
      mockChoiceRepository.save.mockResolvedValue(mockChoice);

      const result = await service.createChoice(choiceDto as any, mockQuestion as any);

      expect(mockChoiceRepository.create).toHaveBeenCalledWith(choiceDto);
      expect(mockChoiceRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockChoice);
    });

    it("should throw BadRequestException if choice creation fails", async () => {
      const choiceDto = { text: "Test choice", isCorrect: true };
      const mockQuestion = { id: "question-id" };

      mockChoiceRepository.create.mockReturnValue(null);

      await expect(service.createChoice(choiceDto as any, mockQuestion as any)).rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.FAILED_TO_CREATE_CHOICE");
    });

    it("should assign question to choice", async () => {
      const choiceDto = { text: "Test choice", isCorrect: true };
      const mockQuestion = { id: "question-id" };
      const mockChoice = { id: "choice-id", ...choiceDto, question: undefined };

      mockChoiceRepository.create.mockReturnValue(mockChoice);
      mockChoiceRepository.save.mockImplementation((choice) => {
        return Promise.resolve({ ...choice, question: mockQuestion });
      });

      const result = await service.createChoice(choiceDto as any, mockQuestion as any);

      expect(mockChoice.question).toEqual(mockQuestion);
      expect(result.question).toEqual(mockQuestion);
    });
  });

  describe("getChoices", () => {
    it("should return choices for a question", async () => {
      const mockQuestion = { id: "question-id" };
      const mockChoices = [{ id: "choice-1" }, { id: "choice-2" }];

      mockChoiceRepository.find.mockResolvedValue(mockChoices);

      const result = await service.getChoices(mockQuestion as any);

      expect(mockChoiceRepository.find).toHaveBeenCalledWith({
        where: { question: mockQuestion },
      });
      expect(result).toEqual(mockChoices);
    });
  });

  describe("updateChoices", () => {
    it("should delete old choices and create new ones", async () => {
      const mockQuestion = { id: "question-id" };
      const newChoices = [
        { text: "New Choice 1", isCorrect: true },
        { text: "New Choice 2", isCorrect: false },
      ];

      const mockCreatedChoice1 = { id: "choice-1", ...newChoices[0] };
      const mockCreatedChoice2 = { id: "choice-2", ...newChoices[1] };

      mockChoiceRepository.create.mockReturnValueOnce(mockCreatedChoice1).mockReturnValueOnce(mockCreatedChoice2);
      mockChoiceRepository.save.mockResolvedValueOnce(mockCreatedChoice1).mockResolvedValueOnce(mockCreatedChoice2);

      await service.updateChoices(mockQuestion as any, newChoices as any);

      expect(mockChoiceRepository.delete).toHaveBeenCalledWith({
        question: { id: "question-id" },
      });
      expect(mockChoiceRepository.create).toHaveBeenCalledTimes(2);
      expect(mockChoiceRepository.save).toHaveBeenCalledTimes(2);
    });

    it("should handle empty choices array", async () => {
      const mockQuestion = { id: "question-id" };
      const newChoices: any[] = [];

      await service.updateChoices(mockQuestion as any, newChoices);

      expect(mockChoiceRepository.delete).toHaveBeenCalledWith({
        question: { id: "question-id" },
      });
      expect(mockChoiceRepository.create).not.toHaveBeenCalled();
      expect(mockChoiceRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("getChoice", () => {
    it("should return choice by id", async () => {
      const mockChoice = { id: "choice-id", text: "Test Choice" };

      mockChoiceRepository.findOne.mockResolvedValue(mockChoice);

      const result = await service.getChoice("choice-id");

      expect(mockChoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: "choice-id" },
      });
      expect(result).toEqual(mockChoice);
    });

    it("should throw NotFoundException if choice not found", async () => {
      mockChoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.getChoice("invalid-id")).rejects.toThrow(NotFoundException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.CHOICE_NOT_FOUND");
    });
  });
});
