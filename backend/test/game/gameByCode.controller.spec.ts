import { Test, TestingModule } from "@nestjs/testing";
import { GameByCodeController } from "@/game/controller/gameByCode.controller";
import { GameService } from "@/game/service/game.service";
import { TranslationService } from "@/translation/translation.service";
import { BadRequestException } from "@nestjs/common";

describe("GameByCodeController", () => {
  let controller: GameByCodeController;
  let mockGameService: any;
  let mockTranslationService: any;

  beforeEach(async () => {
    mockGameService = {
      createGameUser: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Game code is required"),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameByCodeController],
      providers: [
        {
          provide: GameService,
          useValue: mockGameService,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    controller = module.get<GameByCodeController>(GameByCodeController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createGameUser", () => {
    const mockCreateGameUserDto = {
      name: "Test User",
      avatar: "avatar-url",
      externalId: "external-id",
    };

    it("should create game user successfully", async () => {
      const mockGameUser = {
        id: "user-id",
        name: "Test User",
        avatar: "avatar-url",
      };

      mockGameService.createGameUser.mockResolvedValue(mockGameUser);

      const result = await controller.createGameUser("ABCDEF", mockCreateGameUserDto);

      expect(mockGameService.createGameUser).toHaveBeenCalledWith("ABCDEF", mockCreateGameUserDto);
      expect(result).toEqual(mockGameUser);
    });

    it("should throw BadRequestException if code is empty", async () => {
      await expect(controller.createGameUser("", mockCreateGameUserDto)).rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.GAME_CODE_REQUIRED");
      expect(mockGameService.createGameUser).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if code is null", async () => {
      await expect(controller.createGameUser(null as any, mockCreateGameUserDto)).rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.GAME_CODE_REQUIRED");
      expect(mockGameService.createGameUser).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if code is undefined", async () => {
      await expect(controller.createGameUser(undefined as any, mockCreateGameUserDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.GAME_CODE_REQUIRED");
      expect(mockGameService.createGameUser).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      const serviceError = new Error("Game not found");

      mockGameService.createGameUser.mockRejectedValue(serviceError);

      await expect(controller.createGameUser("ABCDEF", mockCreateGameUserDto)).rejects.toThrow(serviceError);

      expect(mockGameService.createGameUser).toHaveBeenCalledWith("ABCDEF", mockCreateGameUserDto);
    });
  });
});
