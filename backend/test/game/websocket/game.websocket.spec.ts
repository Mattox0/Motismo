import { Test, TestingModule } from "@nestjs/testing";
import { RoomWebsocketGateway } from "@/game/websocket/game.websocket";
import { GameService } from "@/game/service/game.service";
import { GameUserService } from "@/gameUser/service/gameUser.service";
import { TranslationService } from "@/translation/translation.service";
import { IWebsocketType } from "@/game/types/IWebsocketType";
import { IGameStatus } from "@/game/types/IGameStatus";

describe("RoomWebsocketGateway", () => {
  let errorSpy: jest.SpyInstance;
  let gateway: RoomWebsocketGateway;
  let gameService: jest.Mocked<GameService>;
  let gameUserService: jest.Mocked<GameUserService>;
  let translationService: jest.Mocked<TranslationService>;

  const makeEmitter = () => ({ emit: jest.fn() });
  const roomEmitter = makeEmitter();
  const userEmitter = makeEmitter();
  const timerEmitter = makeEmitter();
  const resultsEmitter = makeEmitter();
  const rankingEmitter = makeEmitter();

  const serverMock = {
    to: jest.fn().mockImplementation((target: string) => {
      if (target === "ROOMCODE") {
        return roomEmitter;
      }
      if (target === "timer") {
        return timerEmitter;
      }
      if (target === "results") {
        return resultsEmitter;
      }
      if (target === "ranking") {
        return rankingEmitter;
      }

      return userEmitter;
    }),
  } as any;

  const baseSocket = () =>
    ({
      id: "SOCKET1",
      data: { user: { socketId: "SOCKET1" }, code: "ROOMCODE" },
      handshake: { query: {} as any },
      join: jest.fn().mockResolvedValue(undefined),
    }) as any;

  beforeEach(async () => {
    jest.useFakeTimers();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomWebsocketGateway,
        {
          provide: GameService,
          useValue: {
            exists: jest.fn(),
            join: jest.fn(),
            getStatus: jest.fn(),
            start: jest.fn(),
            submitAnswer: jest.fn(),
            getAnswerCount: jest.fn(),
            displayAnswers: jest.fn(),
            displayRanking: jest.fn(),
            nextQuestion: jest.fn(),
            getCurrentQuestion: jest.fn(),
          },
        },
        {
          provide: GameUserService,
          useValue: {
            getUsersByCode: jest.fn(),
          },
        },
        {
          provide: TranslationService,
          useValue: {
            translate: jest.fn().mockResolvedValue("translated"),
          },
        },
      ],
    }).compile();

    gateway = module.get(RoomWebsocketGateway);
    gameService = module.get(GameService);
    gameUserService = module.get(GameUserService);
    translationService = module.get(TranslationService);

    (gateway as any).server = serverMock;

    jest.spyOn(global, "setInterval");
    jest.spyOn(global, "clearInterval");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    errorSpy.mockRestore();
  });

  it("handleConnection sets parsed user and code", () => {
    const socket = baseSocket();

    socket.handshake.query = {
      userId: "undefined",
      name: "null",
      avatar: "avatar.png",
      externalId: undefined,
      code: "ROOMCODE",
    };
    gateway.handleConnection(socket);
    expect(socket.data.user.userId).toBeUndefined();
    expect(socket.data.user.name).toBeUndefined();
    expect(socket.data.user.avatar).toBe("avatar.png");
    expect(socket.data.user.externalId).toBeUndefined();
    expect(socket.data.code).toBe("ROOMCODE");
  });

  it("handleDisconnect logs warning", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const socket = baseSocket();

    gateway.handleDisconnect(socket);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  describe("handleAction", () => {
    it("runs callback when room exists", async () => {
      gameService.exists.mockResolvedValue(true);
      const socket = baseSocket();
      const cb = jest.fn().mockResolvedValue("ok");
      const res = await (gateway as any).handleAction(socket, cb);

      expect(cb).toHaveBeenCalled();
      expect(res).toBe("ok");
    });

    it("emits error when room doesn't exist", async () => {
      gameService.exists.mockResolvedValue(false);
      const socket = baseSocket();

      await (gateway as any).handleAction(socket, jest.fn());
      expect(serverMock.to).toHaveBeenCalledWith("SOCKET1");
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.ERROR, "translated");
    });

    it("catches thrown errors and emits", async () => {
      gameService.exists.mockResolvedValue(true);
      const socket = baseSocket();
      const err = new Error("boom");

      await (gateway as any).handleAction(socket, () => {
        throw err;
      });
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.ERROR, "boom");
    });
  });

  describe("emitUpdate", () => {
    it("emits members and status", async () => {
      gameUserService.getUsersByCode.mockResolvedValue([{ id: 1 } as any]);
      gameService.getStatus.mockResolvedValue(IGameStatus.NOT_STARTED);
      const socket = baseSocket();

      await gateway.emitUpdate(socket);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.MEMBERS, [{ id: 1 }]);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.STATUS, IGameStatus.NOT_STARTED);
    });
  });

  describe("emitQuestionData", () => {
    it("emits when question exists", async () => {
      const socket = baseSocket();

      gameService.getCurrentQuestion.mockResolvedValue({ id: "Q1" } as any);
      await (gateway as any).emitQuestionData(socket);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.QUESTION_DATA, { id: "Q1" });
    });

    it("skips when no question", async () => {
      const socket = baseSocket();

      gameService.getCurrentQuestion.mockResolvedValue(null);
      await (gateway as any).emitQuestionData(socket);
      expect(roomEmitter.emit).not.toHaveBeenCalledWith(IWebsocketType.QUESTION_DATA, expect.anything());
    });
  });

  describe("@JOIN", () => {
    it("joins, emits JOIN and handles status DISPLAY_ANSWERS", async () => {
      const socket = baseSocket();

      socket.data.user.socketId = "SOCKET1";
      gameService.exists.mockResolvedValue(true);
      const user = { socketId: "SOCKET1" } as any;

      gameService.join.mockResolvedValue(user);
      gameService.getStatus.mockResolvedValue(IGameStatus.DISPLAY_ANSWERS);
      gameService.displayAnswers.mockResolvedValue({ stats: true } as any);
      gameUserService.getUsersByCode.mockResolvedValue([]);
      await gateway.join(socket);
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.JOIN, user);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.MEMBERS, []);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.STATUS, IGameStatus.DISPLAY_ANSWERS);
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.RESULTS, { stats: true });
    });

    it("handles DISPLAY_RANKING", async () => {
      const socket = baseSocket();

      socket.data.user.socketId = "SOCKET1";
      gameService.exists.mockResolvedValue(true);
      const user = { socketId: "SOCKET1" } as any;

      gameService.join.mockResolvedValue(user);
      gameService.getStatus.mockResolvedValue(IGameStatus.DISPLAY_RANKING);
      gameService.displayRanking.mockResolvedValue({ rk: true } as any);
      gameUserService.getUsersByCode.mockResolvedValue([]);
      await gateway.join(socket);
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.RANKING, { rk: true });
    });

    it("handles FINISHED", async () => {
      const socket = baseSocket();

      gameService.exists.mockResolvedValue(true);
      const user = { socketId: "SOCKET1" } as any;

      gameService.join.mockResolvedValue(user);
      gameService.getStatus.mockResolvedValue(IGameStatus.FINISHED);
      gameService.displayRanking.mockResolvedValue({ rk: "done" } as any);
      gameUserService.getUsersByCode.mockResolvedValue([]);
      await gateway.join(socket);
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.RANKING, { rk: "done" });
    });
  });

  describe("@START", () => {
    it("starts, emits updates, question data and starts timer", async () => {
      const socket = baseSocket();

      gameService.exists.mockResolvedValue(true);
      gameUserService.getUsersByCode.mockResolvedValue([{ id: 1 } as any]);
      gameService.getStatus.mockResolvedValue(IGameStatus.DISPLAY_QUESTION);
      gameService.getCurrentQuestion.mockResolvedValue({ id: "Q1" } as any);
      await gateway.start(socket);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.MEMBERS, [{ id: 1 }]);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.STATUS, IGameStatus.DISPLAY_QUESTION);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.QUESTION_DATA, { id: "Q1" });
      expect(setInterval).toHaveBeenCalled();
    });
  });

  describe("@ANSWER", () => {
    it("emits success and handles allAnswered true (clears timer and emits finished)", async () => {
      const socket = baseSocket();

      gameService.exists.mockResolvedValue(true);
      gameService.submitAnswer.mockResolvedValue({ allAnswered: true });
      (gateway as any).gameTimers.set("ROOMCODE", 1234 as unknown as NodeJS.Timeout);
      gameService.getAnswerCount.mockResolvedValue({ answered: 3, total: 4 });
      await gateway.answer(socket, { type: "UNIQUE_CHOICES", answer: "a" } as any);
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.ANSWER, { success: true });
      expect(clearInterval).toHaveBeenCalled();
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.TIMER, {
        timeLeft: 0,
        type: "question",
        finished: true,
        allAnswered: true,
        answered: 3,
        total: 4,
      });
    });

    it("emits success when not all answered", async () => {
      const socket = baseSocket();

      gameService.exists.mockResolvedValue(true);
      gameService.submitAnswer.mockResolvedValue(undefined);
      await gateway.answer(socket, { type: "UNIQUE_CHOICES", answer: "a" } as any);
      expect(userEmitter.emit).toHaveBeenCalledWith(IWebsocketType.ANSWER, { success: true });
    });
  });

  describe("@DISPLAY_ANSWER", () => {
    it("emits results and updates", async () => {
      const socket = baseSocket();

      gameService.exists.mockResolvedValue(true);
      gameService.displayAnswers.mockResolvedValue({ s: 1 } as any);
      gameUserService.getUsersByCode.mockResolvedValue([{ id: 2 } as any]);
      gameService.getStatus.mockResolvedValue(IGameStatus.DISPLAY_ANSWERS);
      await gateway.displayAnswer(socket);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.RESULTS, { s: 1 });
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.MEMBERS, [{ id: 2 }]);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.STATUS, IGameStatus.DISPLAY_ANSWERS);
    });
  });

  describe("@DISPLAY_RANKING", () => {
    it("emits ranking and updates", async () => {
      const socket = baseSocket();

      gameService.exists.mockResolvedValue(true);
      gameService.displayRanking.mockResolvedValue({ r: 1 } as any);
      gameUserService.getUsersByCode.mockResolvedValue([{ id: 3 } as any]);
      gameService.getStatus.mockResolvedValue(IGameStatus.DISPLAY_RANKING);
      await gateway.displayRanking(socket);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.RANKING, { r: 1 });
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.MEMBERS, [{ id: 3 }]);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.STATUS, IGameStatus.DISPLAY_RANKING);
    });
  });

  describe("@NEXT_QUESTION", () => {
    it("calls nextQuestion then updates", async () => {
      const socket = baseSocket();

      const nextQuestionSpy = jest.spyOn(gameService, "nextQuestion");

      gameService.exists.mockResolvedValue(true);
      gameUserService.getUsersByCode.mockResolvedValue([{ id: 4 } as any]);
      gameService.getStatus.mockResolvedValue(IGameStatus.DISPLAY_QUESTION);

      await gateway.nextQuestion(socket);

      expect(nextQuestionSpy).toHaveBeenCalled();
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.MEMBERS, [{ id: 4 }]);
      expect(roomEmitter.emit).toHaveBeenCalledWith(IWebsocketType.STATUS, IGameStatus.DISPLAY_QUESTION);
    });
  });

  describe("startQuestionTimer", () => {
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
      jest.useRealTimers();
      errorSpy.mockRestore();
    });

    it("emits ticks and finishes at zero", async () => {
      const socket = baseSocket();

      gameService.getAnswerCount.mockResolvedValue({ answered: 1, total: 5 });

      gateway["startQuestionTimer"](socket);

      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(roomEmitter.emit).toHaveBeenCalledWith(
        "TIMER",
        expect.objectContaining({ answered: 1, total: 5, type: "question" }),
      );

      jest.advanceTimersByTime(30000);
      await Promise.resolve();

      expect(roomEmitter.emit).toHaveBeenCalledWith("TIMER", expect.objectContaining({ timeLeft: 0, finished: true }));
    });

    it("replaces existing timer", () => {
      const socket = baseSocket();

      gameService.getAnswerCount.mockResolvedValue({ answered: 0, total: 0 });

      gateway["startQuestionTimer"](socket);
      const firstTimer = gateway["gameTimers"].get(socket.data.code);

      gateway["startQuestionTimer"](socket);
      const secondTimer = gateway["gameTimers"].get(socket.data.code);

      expect(firstTimer).not.toBe(secondTimer);
    });

    it("handles error path", async () => {
      const socket = baseSocket();

      gameService.getAnswerCount.mockRejectedValue(new Error("boom"));

      (gateway as any).startQuestionTimer(socket);

      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();

      expect(console.error).toHaveBeenCalled();
    });
  });
});
