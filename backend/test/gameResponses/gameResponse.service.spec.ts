import { Test, TestingModule } from "@nestjs/testing";
import { GameResponseService } from "@/gameResponses/services/gameResponse.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GameResponse } from "@/gameResponses/gameResponse.entity";
import { TranslationService } from "@/translation/translation.service";

describe("GameResponseService", () => {
  let service: GameResponseService;
  let mockGameResponseRepository: any;
  let mockTranslationService: any;

  beforeEach(async () => {
    mockGameResponseRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("translated message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameResponseService,
        {
          provide: getRepositoryToken(GameResponse),
          useValue: mockGameResponseRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    service = module.get<GameResponseService>(GameResponseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createResponse", () => {
    it("should create and save a game response", async () => {
      const mockUser = { id: "user-id", name: "Test User" };
      const mockQuestion = { id: "question-id", title: "Test Question" };
      const mockGame = { id: "game-id", code: "ABCDEF" };
      const answer = ["choice-1", "choice-2"];

      const mockGameResponse = {
        id: "response-id",
        user: mockUser,
        question: mockQuestion,
        game: mockGame,
        answer,
      };

      mockGameResponseRepository.create.mockReturnValue(mockGameResponse);
      mockGameResponseRepository.save.mockResolvedValue(mockGameResponse);

      const result = await service.createResponse(
        mockUser as any,
        mockQuestion as any,
        mockGame as any,
        answer
      );

      expect(mockGameResponseRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        question: mockQuestion,
        game: mockGame,
        answer,
      });
      expect(mockGameResponseRepository.save).toHaveBeenCalledWith(mockGameResponse);
      expect(result).toEqual(mockGameResponse);
    });

    it("should create response with string answer", async () => {
      const mockUser = { id: "user-id", name: "Test User" };
      const mockQuestion = { id: "question-id", title: "Test Question" };
      const mockGame = { id: "game-id", code: "ABCDEF" };
      const answer = "single-choice";

      const mockGameResponse = {
        id: "response-id",
        user: mockUser,
        question: mockQuestion,
        game: mockGame,
        answer,
      };

      mockGameResponseRepository.create.mockReturnValue(mockGameResponse);
      mockGameResponseRepository.save.mockResolvedValue(mockGameResponse);

      const result = await service.createResponse(
        mockUser as any,
        mockQuestion as any,
        mockGame as any,
        answer
      );

      expect(mockGameResponseRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        question: mockQuestion,
        game: mockGame,
        answer,
      });
      expect(result).toEqual(mockGameResponse);
    });

    it("should create response with array answer", async () => {
      const mockUser = { id: "user-id", name: "Test User" };
      const mockQuestion = { id: "question-id", title: "Test Question" };
      const mockGame = { id: "game-id", code: "ABCDEF" };
      const answer = ["choice-1", "choice-2", "choice-3"];

      const mockGameResponse = {
        id: "response-id",
        user: mockUser,
        question: mockQuestion,
        game: mockGame,
        answer,
      };

      mockGameResponseRepository.create.mockReturnValue(mockGameResponse);
      mockGameResponseRepository.save.mockResolvedValue(mockGameResponse);

      const result = await service.createResponse(
        mockUser as any,
        mockQuestion as any,
        mockGame as any,
        answer
      );

      expect(result.answer).toEqual(answer);
    });
  });

  describe("hasUserAnswered", () => {
    it("should return true if user has answered", async () => {
      const mockResponse = {
        id: "response-id",
        user: { id: "user-id" },
        question: { id: "question-id" },
        game: { id: "game-id" },
      };

      mockGameResponseRepository.findOne.mockResolvedValue(mockResponse);

      const result = await service.hasUserAnswered("user-id", "question-id", "game-id");

      expect(mockGameResponseRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: "user-id" },
          question: { id: "question-id" },
          game: { id: "game-id" },
        },
      });
      expect(result).toBe(true);
    });

    it("should return false if user has not answered", async () => {
      mockGameResponseRepository.findOne.mockResolvedValue(null);

      const result = await service.hasUserAnswered("user-id", "question-id", "game-id");

      expect(result).toBe(false);
    });

    it("should return false if user has answered different question", async () => {
      mockGameResponseRepository.findOne.mockResolvedValue(null);

      const result = await service.hasUserAnswered("user-id", "different-question-id", "game-id");

      expect(result).toBe(false);
    });

    it("should return false if user has answered different game", async () => {
      mockGameResponseRepository.findOne.mockResolvedValue(null);

      const result = await service.hasUserAnswered("user-id", "question-id", "different-game-id");

      expect(result).toBe(false);
    });
  });

  describe("getResponsesByQuestionAndGame", () => {
    it("should return responses for specific question and game", async () => {
      const mockResponses = [
        {
          id: "response-1",
          answer: "choice-1",
          user: { id: "user-1", name: "User 1" },
        },
        {
          id: "response-2",
          answer: "choice-2",
          user: { id: "user-2", name: "User 2" },
        },
      ];

      mockGameResponseRepository.find.mockResolvedValue(mockResponses);

      const result = await service.getResponsesByQuestionAndGame("question-id", "game-id");

      expect(mockGameResponseRepository.find).toHaveBeenCalledWith({
        where: {
          question: { id: "question-id" },
          game: { id: "game-id" },
        },
        relations: {
          user: true,
        },
      });
      expect(result).toEqual(mockResponses);
    });

    it("should return empty array if no responses found", async () => {
      mockGameResponseRepository.find.mockResolvedValue([]);

      const result = await service.getResponsesByQuestionAndGame("question-id", "game-id");

      expect(result).toEqual([]);
    });

    it("should include user relations", async () => {
      const mockResponses = [
        {
          id: "response-1",
          answer: "choice-1",
          user: { id: "user-1", name: "User 1", avatar: "avatar-1" },
        },
      ];

      mockGameResponseRepository.find.mockResolvedValue(mockResponses);

      const result = await service.getResponsesByQuestionAndGame("question-id", "game-id");

      expect(result[0].user).toBeDefined();
      expect(result[0].user.name).toBe("User 1");
      expect(result[0].user.avatar).toBe("avatar-1");
    });
  });

  describe("findByGameId", () => {
    it("should return all responses for a game", async () => {
      const mockResponses = [
        {
          id: "response-1",
          answer: "choice-1",
          user: { id: "user-1", name: "User 1" },
        },
        {
          id: "response-2",
          answer: "choice-2",
          user: { id: "user-2", name: "User 2" },
        },
        {
          id: "response-3",
          answer: "choice-1",
          user: { id: "user-1", name: "User 1" },
        },
      ];

      mockGameResponseRepository.find.mockResolvedValue(mockResponses);

      const result = await service.findByGameId("game-id");

      expect(mockGameResponseRepository.find).toHaveBeenCalledWith({
        where: {
          game: { id: "game-id" },
        },
        relations: {
          user: true,
        },
      });
      expect(result).toEqual(mockResponses);
      expect(result).toHaveLength(3);
    });

    it("should return empty array if no responses for game", async () => {
      mockGameResponseRepository.find.mockResolvedValue([]);

      const result = await service.findByGameId("non-existent-game-id");

      expect(result).toEqual([]);
    });

    it("should include user relations in game responses", async () => {
      const mockResponses = [
        {
          id: "response-1",
          answer: ["choice-1", "choice-2"],
          user: { 
            id: "user-1", 
            name: "User 1", 
            avatar: "avatar-1",
            points: 100 
          },
        },
      ];

      mockGameResponseRepository.find.mockResolvedValue(mockResponses);

      const result = await service.findByGameId("game-id");

      expect(result[0].user).toBeDefined();
      expect(result[0].user.name).toBe("User 1");
      expect(result[0].user.points).toBe(100);
    });
  });
});