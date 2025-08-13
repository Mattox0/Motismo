import { Test, TestingModule } from "@nestjs/testing";
import { RoomWebsocketGateway } from "../../../src/game/websocket/game.websocket";
import { GameService } from "../../../src/game/service/game.service";
import { GameUserService } from "../../../src/gameUser/service/gameUser.service";
import { TranslationService } from "../../../src/translation/translation.service";

describe("RoomWebsocketGateway", () => {
  let gateway: RoomWebsocketGateway;
  let gameService: jest.Mocked<GameService>;
  let gameUserService: jest.Mocked<GameUserService>;
  let translationService: jest.Mocked<TranslationService>;

  beforeEach(async () => {
    const mockGameService = {
      joinGame: jest.fn(),
      startGame: jest.fn(),
      submitAnswer: jest.fn(),
      getStatus: jest.fn(),
      getCurrentQuestion: jest.fn(),
      displayAnswers: jest.fn(),
      displayRanking: jest.fn(),
      nextQuestion: jest.fn(),
    };

    const mockGameUserService = {
      getGameUserBySocketId: jest.fn(),
    };

    const mockTranslationService = {
      translate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomWebsocketGateway,
        {
          provide: GameService,
          useValue: mockGameService,
        },
        {
          provide: GameUserService,
          useValue: mockGameUserService,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    gateway = module.get<RoomWebsocketGateway>(RoomWebsocketGateway);
    gameService = module.get(GameService);
    gameUserService = module.get(GameUserService);
    translationService = module.get(TranslationService);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });

  it("should have GameService injected", () => {
    expect(gameService).toBeDefined();
  });

  it("should have GameUserService injected", () => {
    expect(gameUserService).toBeDefined();
  });

  it("should have TranslationService injected", () => {
    expect(translationService).toBeDefined();
  });

  it("should have gameTimers property", () => {
    expect(gateway).toHaveProperty("gameTimers");
  });
});
