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
      findBySocketId: jest.fn(),
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
        { provide: getRepositoryToken(Game), useValue: mockGameRepository },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: GameUserService, useValue: mockGameUserService },
        { provide: UserService, useValue: mockUserService },
        { provide: GameResponseService, useValue: mockGameResponseService },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateCode", () => {
    it("default length", () => {
      const code = generateCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z]{6}$/);
    });
    it("custom length", () => {
      const code = generateCode(4);

      expect(code).toHaveLength(4);
      expect(code).toMatch(/^[A-Z]{4}$/);
    });
    it("varies", () => {
      const codes = new Set<string>();

      for (let i = 0; i < 50; i++) {
        codes.add(generateCode());
      }
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe("create", () => {
    it("creates with unique code", async () => {
      const mockQuizz = { id: "qz", questions: [{ id: "q1", order: 1 }], classes: [] };
      const mockUser = { id: "u1", classes: [] };
      const mockGame = { id: "g1", code: "ABCDEF" };

      mockGameRepository.exists.mockResolvedValue(false);
      mockGameRepository.create.mockReturnValue(mockGame);
      mockGameRepository.save.mockResolvedValue(mockGame);
      const res = await service.create(mockQuizz as any, mockUser as any);

      expect(mockGameRepository.create).toHaveBeenCalled();
      expect(mockGameRepository.save).toHaveBeenCalled();
      expect(res).toEqual(mockGame);
    });
    it("regenerates if code exists", async () => {
      const mockQuizz = { id: "qz", questions: [{ id: "q1", order: 1 }], classes: [] };
      const mockUser = { id: "u1", classes: [] };
      const mockGame = { id: "g1", code: "ABCDEF" };

      mockGameRepository.exists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockGameRepository.create.mockReturnValue(mockGame);
      mockGameRepository.save.mockResolvedValue(mockGame);
      const res = await service.create(mockQuizz as any, mockUser as any);

      expect(mockGameRepository.exists).toHaveBeenCalledTimes(2);
      expect(res).toEqual(mockGame);
    });
  });

  describe("exists", () => {
    it("true", async () => {
      mockGameRepository.exists.mockResolvedValue(true);
      const res = await service.exists("ABCDEF");

      expect(mockGameRepository.exists).toHaveBeenCalledWith({ where: { code: "ABCDEF" } });
      expect(res).toBe(true);
    });
    it("false", async () => {
      mockGameRepository.exists.mockResolvedValue(false);
      const res = await service.exists("ABCDEF");

      expect(res).toBe(false);
    });
  });

  describe("getGame", () => {
    const socket = { data: { code: "CODE1" } };

    it("returns game", async () => {
      const mockGame = { id: "g1", code: "CODE1", status: IGameStatus.NOT_STARTED };
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockGame),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(qb);
      const res = await service.getGame(socket as any);

      expect(qb.where).toHaveBeenCalledWith("game.code = :code", { code: "CODE1" });
      expect(res).toEqual(mockGame);
    });
    it("throws when not found", async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(qb);
      await expect(service.getGame(socket as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.GAME_NOT_FOUND");
    });
  });

  describe("join", () => {
    const baseGame = {
      id: "g",
      author: { id: "author" },
      users: [],
      quizz: {},
    };

    it("reconnects existing by userId", async () => {
      const game = { ...baseGame, users: [{ id: "GU1" }] };

      jest.spyOn(service, "getGame").mockResolvedValue(game as any);
      mockGameUserService.updateSocketId.mockResolvedValue(undefined);
      mockGameUserService.getOneUser.mockResolvedValue({ id: "GU1" });
      const socket = { data: { code: "C", user: { userId: "GU1" } } };
      const res = await service.join(socket as any);

      expect(mockGameUserService.updateSocketId).toHaveBeenCalled();
      expect(res).toEqual({ id: "GU1" });
    });
    it("throws if userId not found", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue(baseGame as any);
      const socket = { data: { code: "C", user: { userId: "X" } } };

      await expect(service.join(socket as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.GAME_USER_NOT_FOUND");
    });
    it("reuses anonymous by same name", async () => {
      const game = { ...baseGame, users: [{ id: "A1", name: "Anon", user: null }] };

      jest.spyOn(service, "getGame").mockResolvedValue(game as any);
      mockGameUserService.updateSocketId.mockResolvedValue(undefined);
      mockGameUserService.getOneUser.mockResolvedValue({ id: "A1" });
      const socket = { data: { code: "C", user: { name: "Anon", socketId: "S1", externalId: null, avatar: "" } } };
      const res = await service.join(socket as any);

      expect(mockGameUserService.updateSocketId).toHaveBeenCalled();
      expect(res).toEqual({ id: "A1" });
    });
    it("creates new user with external link and author flag", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({ ...baseGame, author: { id: "U42" }, users: [] } as any);
      mockUserService.findOneUser.mockResolvedValue({ id: "U42" });
      mockGameUserService.create.mockResolvedValue({ id: "NU1" });
      mockGameUserService.getOneUser.mockResolvedValue({ id: "NU1" });
      const socket = { data: { code: "C", user: { name: "Alice", socketId: "S", externalId: "U42", avatar: "A" } } };
      const res = await service.join(socket as any);

      expect(mockGameUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({ isAuthor: true, user: { id: "U42" } }),
      );
      expect(res).toEqual({ id: "NU1" });
    });
    it("creates new anonymous user", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue(baseGame as any);
      mockGameUserService.create.mockResolvedValue({ id: "NU2" });
      mockGameUserService.getOneUser.mockResolvedValue({ id: "NU2" });
      const socket = { data: { code: "C", user: { name: "Bob", socketId: "S2", externalId: null, avatar: "B" } } };
      const res = await service.join(socket as any);

      expect(mockGameUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Bob", isAuthor: false }),
      );
      expect(res).toEqual({ id: "NU2" });
    });
  });

  describe("start", () => {
    const socket = { data: { code: "ABC", user: { externalId: "auth" } } };

    beforeEach(() => {
      jest.spyOn(service, "getGame").mockResolvedValue({
        id: "g1",
        author: { id: "auth" },
        status: IGameStatus.NOT_STARTED,
      } as any);
    });
    it("ok for author", async () => {
      await service.start(socket as any);
      expect(mockGameRepository.update).toHaveBeenCalledWith(
        { code: "ABC" },
        expect.objectContaining({
          status: IGameStatus.DISPLAY_QUESTION,
          questionStartTime: expect.any(Date),
        }),
      );
    });
    it("rejects non-author", async () => {
      await expect(service.start({ data: { code: "ABC", user: { externalId: "x" } } } as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.NOT_AUTHOR");
    });
  });

  describe("getCurrentQuestion", () => {
    const socket = { data: { code: "C" } };

    it("null when none", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({ currentQuestion: null } as any);
      expect(await service.getCurrentQuestion(socket as any)).toBeNull();
    });
    it("choice question stripped choices", async () => {
      const cq = new ChoiceQuestion();

      Object.assign(cq, {
        id: "Q1",
        title: "T",
        questionType: "MULTIPLE_CHOICES",
        choices: [
          { id: "c1", text: "A", isCorrect: true },
          { id: "c2", text: "B", isCorrect: false },
        ],
      });
      jest.spyOn(service, "getGame").mockResolvedValue({ currentQuestion: cq } as any);
      const res = await service.getCurrentQuestion(socket as any);

      expect((res as any).choices).toEqual([
        { id: "c1", text: "A" },
        { id: "c2", text: "B" },
      ]);
    });
    it("non-choice passthrough", async () => {
      const q = { id: "Q2", title: "W", questionType: "WORD_CLOUD" };

      jest.spyOn(service, "getGame").mockResolvedValue({ currentQuestion: q } as any);
      expect(await service.getCurrentQuestion(socket as any)).toEqual(q);
    });
  });

  describe("getStatus", () => {
    it("returns status", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({ status: IGameStatus.DISPLAY_QUESTION } as any);
      const res = await service.getStatus({ data: { code: "C" } } as any);

      expect(res).toBe(IGameStatus.DISPLAY_QUESTION);
    });
  });

  describe("submitAnswer flows", () => {
    const socket = { data: { code: "C", user: { userId: "U1" } } };
    let cq: ChoiceQuestion;
    let game: any;
    const user = { id: "U1", isAuthor: false };

    beforeEach(() => {
      cq = new ChoiceQuestion();
      Object.assign(cq, {
        id: "Q1",
        choices: [
          { id: "c1", isCorrect: true },
          { id: "c2", isCorrect: false },
          { id: "c3", isCorrect: true },
        ],
      });
      game = { id: "G", currentQuestion: cq };
      jest.spyOn(service, "getGame").mockResolvedValue(game);
      mockGameUserService.getOneUser.mockResolvedValue(user);
      mockGameResponseService.hasUserAnswered.mockResolvedValue(false);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([{ id: "U1" }]);
      mockGameResponseService.getResponsesByQuestionAndGame.mockResolvedValue([]);
    });

    it("rejects missing userId", async () => {
      await expect(
        service.submitAnswer({ data: { code: "C", user: { userId: null } } } as any, {
          type: QuestionType.UNIQUE_CHOICES,
          answer: "c1",
        }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.USER_NOT_FOUND");
    });

    it("rejects when game user not found", async () => {
      mockGameUserService.getOneUser.mockResolvedValue(null);
      await expect(
        service.submitAnswer(socket as any, { type: QuestionType.UNIQUE_CHOICES, answer: "c1" }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.USER_NOT_FOUND");
    });

    it("rejects when no current question (submitAnswer pre-check)", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({ id: "G", currentQuestion: null } as any);
      await expect(
        service.submitAnswer(socket as any, { type: QuestionType.UNIQUE_CHOICES, answer: "c1" }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.NO_CURRENT_QUESTION");
    });

    it("unique correct adds points and all answered", async () => {
      mockGameResponseService.getResponsesByQuestionAndGame.mockResolvedValue([{ id: "r1" }]);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([{ id: "U1" }]);
      const res = await service.submitAnswer(socket as any, {
        type: QuestionType.UNIQUE_CHOICES,
        answer: "c1",
      });

      expect(mockGameResponseService.createResponse).toHaveBeenCalled();
      expect(mockGameUserService.addPoints).toHaveBeenCalledWith("U1", 100);
      expect(res).toEqual({ allAnswered: true });
    });

    it("multiple choice correct", async () => {
      mockGameResponseService.getResponsesByQuestionAndGame.mockResolvedValue([{ id: "r1" }]);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([{ id: "U1" }]);
      const res = await service.submitAnswer(socket as any, {
        type: QuestionType.MULTIPLE_CHOICES,
        answer: ["c1", "c3"],
      });

      expect(mockGameUserService.addPoints).toHaveBeenCalledWith("U1", 100);
      expect(res).toEqual({ allAnswered: true });
    });

    it("multiple choice incorrect no points", async () => {
      await service.submitAnswer(socket as any, {
        type: QuestionType.MULTIPLE_CHOICES,
        answer: ["c1"],
      });
      expect(mockGameUserService.addPoints).not.toHaveBeenCalled();
    });

    it("boolean path no points", async () => {
      mockGameResponseService.getResponsesByQuestionAndGame.mockResolvedValue([]);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([{ id: "U1" }, { id: "U2" }]);
      const res = await service.submitAnswer(socket as any, {
        type: QuestionType.BOOLEAN_CHOICES,
        answer: "c2",
      });

      expect(mockGameResponseService.createResponse).toHaveBeenCalled();
      expect(mockGameUserService.addPoints).not.toHaveBeenCalled();
      expect(res).toBeUndefined();
    });

    it("boolean path adds points when correct", async () => {
      mockGameResponseService.getResponsesByQuestionAndGame.mockResolvedValue([]);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([{ id: "U1" }, { id: "U2" }]);
      await service.submitAnswer(socket as any, {
        type: QuestionType.BOOLEAN_CHOICES,
        answer: "c1",
      });
      expect(mockGameUserService.addPoints).toHaveBeenCalledWith("U1", 100);
    });

    it("matching path", async () => {
      const res = await service.submitAnswer({ data: { code: "C", user: { userId: "U1" } } } as any, {
        type: QuestionType.MATCHING,
        answer: ["a->b"] as any,
      });

      expect(mockGameResponseService.createResponse).toHaveBeenCalled();
      expect(res).toBeUndefined();
    });

    it("word cloud path", async () => {
      const res = await service.submitAnswer({ data: { code: "C", user: { userId: "U1" } } } as any, {
        type: QuestionType.WORD_CLOUD,
        answer: "hello",
      });

      expect(mockGameResponseService.createResponse).toHaveBeenCalled();
      expect(res).toBeUndefined();
    });

    it("rejects author answering", async () => {
      mockGameUserService.getOneUser.mockResolvedValue({ id: "U1", isAuthor: true });
      await expect(
        service.submitAnswer(socket as any, { type: QuestionType.UNIQUE_CHOICES, answer: "c1" }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.AUTHOR_CANNOT_ANSWER");
    });

    it("rejects already answered", async () => {
      mockGameResponseService.hasUserAnswered.mockResolvedValue(true);
      await expect(
        service.submitAnswer(socket as any, { type: QuestionType.UNIQUE_CHOICES, answer: "c1" }),
      ).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.ALREADY_ANSWERED");
    });

    it("invalid type", async () => {
      await expect(service.submitAnswer(socket as any, { type: "X" as any, answer: "c1" })).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_QUESTION_TYPE");
    });
  });

  describe("private guards and branches", () => {
    it("submitMultipleChoiceAnswer throws when invalid question type", async () => {
      const game = { id: "G", currentQuestion: {} } as any;
      const user = { id: "U1" } as any;

      await expect((service as any).submitMultipleChoiceAnswer(game, user, ["a"])).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_QUESTION_TYPE");
    });

    it("submitUniqueChoiceAnswer throws when invalid question type", async () => {
      const game = { id: "G", currentQuestion: {} } as any;
      const user = { id: "U1" } as any;

      await expect((service as any).submitUniqueChoiceAnswer(game, user, "a")).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_QUESTION_TYPE");
    });

    it("submitBooleanChoiceAnswer throws when invalid question type", async () => {
      const game = { id: "G", currentQuestion: {} } as any;
      const user = { id: "U1" } as any;

      await expect((service as any).submitBooleanChoiceAnswer(game, user, "a")).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_QUESTION_TYPE");
    });

    it("submitMatchingAnswer throws when no current question", async () => {
      const game = { id: "G", currentQuestion: null } as any;
      const user = { id: "U1" } as any;

      await expect((service as any).submitMatchingAnswer(game, user, ["a"])).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.NO_CURRENT_QUESTION");
    });

    it("submitWordCloudAnswer throws when no current question", async () => {
      const game = { id: "G", currentQuestion: null } as any;
      const user = { id: "U1" } as any;

      await expect((service as any).submitWordCloudAnswer(game, user, "word")).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.NO_CURRENT_QUESTION");
    });

    it("checkAllPlayersAnswered throws when no current question", async () => {
      const game = { id: "G", currentQuestion: null } as any;

      await expect((service as any).checkAllPlayersAnswered(game)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.NO_CURRENT_QUESTION");
    });
  });

  describe("displayAnswers", () => {
    const socket = { data: { code: "C" } };

    it("computes stats for choice question", async () => {
      const cq = new ChoiceQuestion();

      Object.assign(cq, {
        id: "Q1",
        title: "Q",
        choices: [
          { id: "c1", text: "A", isCorrect: true },
          { id: "c2", text: "B", isCorrect: false },
        ],
      });
      const game = { id: "G", status: IGameStatus.DISPLAY_QUESTION, currentQuestion: cq };

      jest.spyOn(service, "getGame").mockResolvedValue(game as any);
      mockGameRepository.save.mockResolvedValue(undefined);
      mockGameResponseService.getResponsesByQuestionAndGame.mockResolvedValue([
        { user: { id: "u1", name: "N1", avatar: "A1" }, answer: ["c1"], answeredAt: new Date() },
        { user: { id: "u2", name: "N2", avatar: "A2" }, answer: ["c1"], answeredAt: new Date() },
      ]);
      const res = await service.displayAnswers(socket as any);

      expect(res.totalResponses).toBe(2);
      expect(res.choices.find((c) => c.choiceId === "c1")?.count).toBe(2);
      expect(res.choices.find((c) => c.choiceId === "c2")?.count).toBe(0);
      expect(res.choices[0].percentage).toBe(100);
    });
    it("throws for non-choice question", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({
        id: "G",
        currentQuestion: { id: "Q", title: "T" },
      } as any);
      await expect(service.displayAnswers({ data: { code: "C" } } as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.INVALID_QUESTION_TYPE");
    });
    it("throws when no current question", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({ id: "G", currentQuestion: null } as any);
      await expect(service.displayAnswers({ data: { code: "C" } } as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.NO_CURRENT_QUESTION");
    });
  });

  describe("displayRanking", () => {
    it("saves status and computes fastest + ranks", async () => {
      const socket = { data: { code: "C" } };
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);
      const game = { id: "G", status: IGameStatus.DISPLAY_QUESTION } as any;

      jest.spyOn(service, "getGame").mockResolvedValue(game);
      mockGameRepository.save.mockResolvedValue(undefined);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([
        { id: "u1", name: "A", avatar: "a", points: 50, isAuthor: false },
        { id: "u2", name: "B", avatar: "b", points: 100, isAuthor: false },
      ]);
      mockGameResponseService.findByGameId.mockResolvedValue([
        { user: { id: "u1" }, answeredAt: now },
        { user: { id: "u2" }, answeredAt: earlier },
      ]);
      const res = await service.displayRanking(socket as any);

      expect(res.totalPlayers).toBe(2);
      expect(res.ranking[0].id).toBe("u2");
      expect(res.ranking.find((r) => r.id === "u2")?.isFastest).toBe(true);
      expect(game.status).toBe(IGameStatus.DISPLAY_RANKING);
    });
    it("handles no responses", async () => {
      const socket = { data: { code: "C" } };
      const game = { id: "G", status: IGameStatus.DISPLAY_QUESTION } as any;

      jest.spyOn(service, "getGame").mockResolvedValue(game);
      mockGameRepository.save.mockResolvedValue(undefined);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([
        { id: "u1", name: "A", avatar: "a", points: 10, isAuthor: false },
      ]);
      mockGameResponseService.findByGameId.mockResolvedValue([]);
      const res = await service.displayRanking(socket as any);

      expect(res.ranking[0].isFastest).toBe(false);
    });
  });

  describe("nextQuestion", () => {
    it("moves to next question", async () => {
      const game = {
        id: "G",
        quizz: {
          questions: [
            { id: "q1", order: 1 },
            { id: "q2", order: 2 },
          ],
        },
        currentQuestion: { id: "q1", order: 1 },
        status: IGameStatus.DISPLAY_QUESTION,
      } as any;

      jest.spyOn(service, "getGame").mockResolvedValue(game);
      await service.nextQuestion({ data: { code: "C" } } as any);
      expect(game.currentQuestion.id).toBe("q2");
      expect(game.status).toBe(IGameStatus.DISPLAY_QUESTION);
      expect(mockGameRepository.save).toHaveBeenCalledWith(game);
    });
    it("finishes when no next", async () => {
      const game = {
        id: "G",
        quizz: { questions: [{ id: "q1", order: 1 }] },
        currentQuestion: { id: "q1", order: 1 },
        status: IGameStatus.DISPLAY_QUESTION,
      } as any;

      jest.spyOn(service, "getGame").mockResolvedValue(game);
      await service.nextQuestion({ data: { code: "C" } } as any);
      expect(game.status).toBe(IGameStatus.FINISHED);
    });
    it("throws when no quizz", async () => {
      const game = { id: "G", quizz: null } as any;

      jest.spyOn(service, "getGame").mockResolvedValue(game);
      await expect(service.nextQuestion({ data: { code: "C" } } as any)).rejects.toThrow();
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.GAME_NOT_FOUND");
    });
  });

  describe("getAnswerCount", () => {
    it("returns zeros when no current", async () => {
      jest.spyOn(service, "getGame").mockResolvedValue({ currentQuestion: null } as any);
      const res = await service.getAnswerCount({ data: { code: "C" } } as any);

      expect(res).toEqual({ answered: 0, total: 0 });
    });
    it("returns counts", async () => {
      const game = { id: "G", currentQuestion: { id: "Q" } } as any;

      jest.spyOn(service, "getGame").mockResolvedValue(game);
      mockGameUserService.getGameUsersByGameId.mockResolvedValue([{ id: "u1" }, { id: "u2" }]);
      mockGameResponseService.getResponsesByQuestionAndGame.mockResolvedValue([{ id: "r1" }]);
      const res = await service.getAnswerCount({ data: { code: "C" } } as any);

      expect(res).toEqual({ answered: 1, total: 2 });
    });
  });

  describe("createGameUser", () => {
    const baseGame = { id: "G", code: "C", author: { id: "auth" }, users: [] };

    beforeEach(() => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(baseGame),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(qb);
    });
    it("creates with external user and author flag", async () => {
      mockUserService.findOneUser.mockResolvedValue({ id: "auth" });
      mockGameUserService.create.mockResolvedValue({ id: "GU1" });
      const dto = { name: "A", avatar: "X", externalId: "auth" };
      const res = await service.createGameUser("C", dto as any);

      expect(mockGameUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: { id: "auth" }, isAuthor: true }),
      );
      expect(res).toEqual({ id: "GU1" });
    });
    it("creates anonymous when no external", async () => {
      mockGameUserService.create.mockResolvedValue({ id: "GU2" });
      const dto = { name: "B", avatar: "Y" };
      const res = await service.createGameUser("C", dto as any);

      expect(mockGameUserService.create).toHaveBeenCalledWith(expect.objectContaining({ name: "B", isAuthor: false }));
      expect(res).toEqual({ id: "GU2" });
    });
    it("returns existing when found", async () => {
      const gameWithUsers = { ...baseGame, users: [{ id: "E1", user: { id: "ext" }, name: "N" }] };
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(gameWithUsers),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(qb);
      const res = await service.createGameUser("C", { name: "N", externalId: "ext" } as any);

      expect(res).toEqual(gameWithUsers.users[0]);
    });
    it("throws when game not found", async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockGameRepository.createQueryBuilder.mockReturnValue(qb);
      await expect(service.createGameUser("BAD", { name: "X" } as any)).rejects.toThrow(NotFoundException);
    });
  });
});
