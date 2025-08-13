import { Test, TestingModule } from "@nestjs/testing";
import { GameService, generateCode } from "@/game/service/game.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Game } from "@/game/game.entity";
import { TranslationService } from "@/translation/translation.service";
import { GameUserService } from "@/gameUser/service/gameUser.service";
import { UserService } from "@/user/service/user.service";
import { GameResponseService } from "@/gameResponses/services/gameResponse.service";
import { IGameStatus } from "@/game/types/IGameStatus";
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { NotFoundException } from "@nestjs/common";
import { QuestionType } from "@/question/types/questionType";

describe("GameService", () => {
  let service: GameService;
  let mockGameRepository: any;
  let mockTranslationService: any;
  let mockGameUserService: any;
  let mockUserService: any;
  let mockGameResponseService: any;

  beforeEach(async () => {
    mockGameRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("translated message"),
    };

    mockGameUserService = {
      updateSocketId: jest.fn(),
      getOneUser: jest.fn(),
      create: jest.fn(),
      addPoints: jest.fn(),
      getGameUsersByGameId: jest.fn(),
    };

    mockUserService = {
      findOneUser: jest.fn(),
    };

    mockGameResponseService = {
      hasUserAnswered: jest.fn(),
      createResponse: jest.fn(),
      getResponsesByQuestionAndGame: jest.fn(),
      findByGameId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getRepositoryToken(Game),
          useValue: mockGameRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
        {
          provide: GameUserService,
          useValue: mockGameUserService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: GameResponseService,
          useValue: mockGameResponseService,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateCode", () => {
    it("should generate a code with default length 6", () => {
      const code = generateCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z]{6}$/);
    });

    it("should generate a code with specified length", () => {
      const code = generateCode(4);

      expect(code).toHaveLength(4);
      expect(code).toMatch(/^[A-Z]{4}$/);
    });

    it("should generate different codes on multiple calls", () => {
      const codes = new Set();

      for (let i = 0; i < 100; i++) {
        codes.add(generateCode());
      }
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe("create", () => {
    it("should create a game with generated code", async () => {
      const mockQuizz = {
        id: "quizz-id",
        questions: [{ id: "q1", order: 1 }],
      };
      const mockUser = { id: "user-id" };
      const mockGame = { id: "game-id", code: "ABCDEF" };

      mockGameRepository.exists.mockResolvedValue(false);
      mockGameRepository.create.mockReturnValue(mockGame);
      mockGameRepository.save.mockResolvedValue(mockGame);

      const result = await service.create(mockQuizz as any, mockUser as any);

      expect(mockGameRepository.create).toHaveBeenCalled();
      expect(mockGameRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockGame);
    });

    it("should generate new code if first one exists", async () => {
      const mockQuizz = {
        id: "quizz-id",
        questions: [{ id: "q1", order: 1 }],
      };
      const mockUser = { id: "user-id" };
      const mockGame = { id: "game-id", code: "ABCDEF" };

      mockGameRepository.exists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockGameRepository.create.mockReturnValue(mockGame);
      mockGameRepository.save.mockResolvedValue(mockGame);

      const result = await service.create(mockQuizz as any, mockUser as any);

      expect(mockGameRepository.exists).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockGame);
    });
  });

  describe("exists", () => {
    it("should return true if game exists", async () => {
      mockGameRepository.exists.mockResolvedValue(true);

      const result = await service.exists("ABCDEF");

      expect(mockGameRepository.exists).toHaveBeenCalledWith({
        where: { code: "ABCDEF" },
      });
      expect(result).toBe(true);
    });

    it("should return false if game does not exist", async () => {
      mockGameRepository.exists.mockResolvedValue(false);

      const result = await service.exists("ABCDEF");

      expect(result).toBe(false);
    });
  });

  describe("getGame", () => {
    const mockSocket = {
      data: { code: "ABCDEF" },
    };

    it("should return game with all relations", async () => {
      const mockGame = {
        id: "game-id",
        code: "ABCDEF",
        status: IGameStatus.NOT_STARTED,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockGame),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getGame(mockSocket as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith("game.code = :code", {
        code: "ABCDEF",
      });
      expect(result).toEqual(mockGame);
    });

    it("should throw error if game not found", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.getGame(mockSocket as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.GAME_NOT_FOUND");
    });
  });

  describe("start", () => {
    const mockSocket = {
      data: {
        code: "ABCDEF",
        user: { externalId: "author-id" },
      },
    };

    beforeEach(() => {
      jest.spyOn(service, "getGame").mockResolvedValue({
        id: "game-id",
        author: { id: "author-id" },
        status: IGameStatus.NOT_STARTED,
      } as any);
    });

    it("should start game if user is author", async () => {
      await service.start(mockSocket as any);

      expect(mockGameRepository.update).toHaveBeenCalledWith(
        { code: "ABCDEF" },
        { status: IGameStatus.DISPLAY_QUESTION },
      );
    });

    it("should throw error if user is not author", async () => {
      const unauthorizedSocket = {
        data: {
          code: "ABCDEF",
          user: { externalId: "other-user-id" },
        },
      };

      await expect(service.start(unauthorizedSocket as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.NOT_AUTHOR");
    });
  });

  describe("getCurrentQuestion", () => {
    const mockSocket = {
      data: { code: "ABCDEF" },
    };

    it("should return null if no current question", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({
        currentQuestion: null,
      } as any);

      const result = await service.getCurrentQuestion(mockSocket as any);

      expect(result).toBeNull();
    });

    it("should return choice question with only id and text", async () => {
      const mockChoiceQuestion = new ChoiceQuestion();

      Object.assign(mockChoiceQuestion, {
        id: "question-id",
        title: "Test Question",
        questionType: "MULTIPLE_CHOICES",
        choices: [
          { id: "choice-1", text: "Choice 1", isCorrect: true },
          { id: "choice-2", text: "Choice 2", isCorrect: false },
        ],
      });

      jest.spyOn(service, "getGame").mockResolvedValue({
        currentQuestion: mockChoiceQuestion,
      } as any);

      const result = await service.getCurrentQuestion(mockSocket as any);

      expect(result).toBeDefined();
      expect((result as any).choices).toEqual([
        { id: "choice-1", text: "Choice 1" },
        { id: "choice-2", text: "Choice 2" },
      ]);
    });

    it("should return non-choice question as is", async () => {
      const mockQuestion = {
        id: "question-id",
        title: "Test Question",
        questionType: "WORD_CLOUD",
      };

      jest.spyOn(service, "getGame").mockResolvedValue({
        currentQuestion: mockQuestion,
      } as any);

      const result = await service.getCurrentQuestion(mockSocket as any);

      expect(result).toEqual(mockQuestion);
    });
  });

  describe("getStatus", () => {
    const mockSocket = {
      data: { code: "ABCDEF" },
    };

    it("should return game status", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({
        status: IGameStatus.DISPLAY_QUESTION,
      } as any);

      const result = await service.getStatus(mockSocket as any);

      expect(result).toBe(IGameStatus.DISPLAY_QUESTION);
    });
  });

  describe("submitAnswer", () => {
    const mockSocket = {
      data: {
        code: "ABCDEF",
        user: { userId: "user-id" },
      },
    };

    const mockGame = {
      id: "game-id",
      currentQuestion: {
        id: "question-id",
        choices: [
          { id: "choice-1", isCorrect: true },
          { id: "choice-2", isCorrect: false },
        ],
      },
    };

    const mockGameUser = {
      id: "user-id",
      isAuthor: false,
    };

    beforeEach(() => {
      jest.spyOn(service, "getGame").mockResolvedValue(mockGame as any);
      mockGameUserService.getOneUser.mockResolvedValue(mockGameUser);
      mockGameResponseService.hasUserAnswered.mockResolvedValue(false);
    });

    it("should throw error if user not found", async () => {
      const socketWithoutUser = {
        data: {
          code: "ABCDEF",
          user: { userId: null },
        },
      };

      await expect(
        service.submitAnswer(socketWithoutUser as any, {
          type: QuestionType.UNIQUE_CHOICES,
          answer: "choice-1",
        }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.USER_NOT_FOUND");
    });

    it("should throw error if game user not found", async () => {
      mockGameUserService.getOneUser.mockResolvedValue(null);

      await expect(
        service.submitAnswer(mockSocket as any, {
          type: QuestionType.UNIQUE_CHOICES,
          answer: "choice-1",
        }),
      ).rejects.toThrow();
    });

    it("should throw error if no current question", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({
        currentQuestion: null,
      } as any);

      await expect(
        service.submitAnswer(mockSocket as any, {
          type: QuestionType.UNIQUE_CHOICES,
          answer: "choice-1",
        }),
      ).rejects.toThrow();
    });

    it("should throw error if user is author", async () => {
      mockGameUserService.getOneUser.mockResolvedValue({
        ...mockGameUser,
        isAuthor: true,
      });

      await expect(
        service.submitAnswer(mockSocket as any, {
          type: QuestionType.UNIQUE_CHOICES,
          answer: "choice-1",
        }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.AUTHOR_CANNOT_ANSWER");
    });

    it("should throw error if user already answered", async () => {
      mockGameResponseService.hasUserAnswered.mockResolvedValue(true);

      await expect(
        service.submitAnswer(mockSocket as any, {
          type: QuestionType.UNIQUE_CHOICES,
          answer: "choice-1",
        }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.ALREADY_ANSWERED");
    });

    it("should submit unique choice answer", async () => {
      jest.spyOn(service as any, "submitUniqueChoiceAnswer").mockResolvedValue({ allAnswered: false });

      const result = await service.submitAnswer(mockSocket as any, {
        type: QuestionType.UNIQUE_CHOICES,
        answer: "choice-1",
      });

      expect(service["submitUniqueChoiceAnswer"]).toHaveBeenCalledWith(mockGame, mockGameUser, "choice-1");
      expect(result).toEqual({ allAnswered: false });
    });

    it("should submit multiple choice answer", async () => {
      jest.spyOn(service as any, "submitMultipleChoiceAnswer").mockResolvedValue({ allAnswered: true });

      const result = await service.submitAnswer(mockSocket as any, {
        type: QuestionType.MULTIPLE_CHOICES,
        answer: ["choice-1"],
      });

      expect(service["submitMultipleChoiceAnswer"]).toHaveBeenCalledWith(mockGame, mockGameUser, ["choice-1"]);
      expect(result).toEqual({ allAnswered: true });
    });

    it("should throw error for invalid question type", async () => {
      await expect(
        service.submitAnswer(mockSocket as any, {
          type: "INVALID_TYPE" as any,
          answer: "choice-1",
        }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_QUESTION_TYPE");
    });
  });

  describe("createGameUser", () => {
    const mockGame = {
      id: "game-id",
      code: "ABCDEF",
      author: { id: "author-id" },
      users: [],
    };

    beforeEach(() => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockGame),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it("should create new game user", async () => {
      const createGameUserDto = {
        name: "Test User",
        avatar: "avatar-url",
        externalId: "external-id",
      };

      const mockCreatedUser = {
        id: "new-user-id",
        name: "Test User",
      };

      mockUserService.findOneUser.mockResolvedValue({ id: "external-id" });
      mockGameUserService.create.mockResolvedValue(mockCreatedUser);

      const result = await service.createGameUser("ABCDEF", createGameUserDto as any);

      expect(mockGameUserService.create).toHaveBeenCalledWith({
        game: mockGame,
        socketId: "",
        name: "Test User",
        isAuthor: false,
        avatar: "avatar-url",
        user: { id: "external-id" },
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it("should return existing user if found", async () => {
      const gameWithUsers = {
        ...mockGame,
        users: [
          {
            id: "existing-user-id",
            user: { id: "external-id" },
            name: "Test User",
          },
        ],
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(gameWithUsers),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const createGameUserDto = {
        name: "Test User",
        externalId: "external-id",
      };

      const result = await service.createGameUser("ABCDEF", createGameUserDto as any);

      expect(result).toEqual(gameWithUsers.users[0]);
      expect(mockGameUserService.create).not.toHaveBeenCalled();
    });

    it("should throw error if game not found", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.createGameUser("INVALID", {} as any)).rejects.toThrow(NotFoundException);
    });
  });
});
