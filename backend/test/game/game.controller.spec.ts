import { GameController } from "@/game/controller/game.controller";
import { GameService } from "@/game/service/game.service";
import { TranslationService } from "@/translation/translation.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { IQuizzType } from "@/quizz/types/IQuizzType";

describe("GameController", () => {
  let controller: GameController;
  let mockGameService: Partial<GameService>;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(() => {
    mockGameService = {
      create: jest.fn().mockResolvedValue({ id: "game-id", code: "ABCDEF" }),
    };

    mockTranslationService = {
      translate: jest.fn().mockImplementation((key) => Promise.resolve(key)),
    };

    controller = new GameController(
      mockGameService as GameService,
      mockTranslationService as TranslationService
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createGame", () => {
    const mockUser = { id: "user-id" };
    const mockQuizz = {
      id: "quizz-id",
      quizzType: IQuizzType.QUESTIONS,
      questions: [{ id: "q1" }],
      author: { id: "user-id" },
    };

    it("should create a game successfully", async () => {
      const result = await controller.createGame(mockQuizz as any, mockUser as any);

      expect(mockGameService.create).toHaveBeenCalledWith(mockQuizz, mockUser);
      expect(result).toEqual({ id: "game-id", code: "ABCDEF" });
    });

    it("should throw BadRequestException for non-question quizz type", async () => {
      const invalidQuizz = { ...mockQuizz, quizzType: IQuizzType.CARDS };

      await expect(
        controller.createGame(invalidQuizz as any, mockUser as any)
      ).rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.QUIZZ_TYPE");
    });

    it("should throw BadRequestException for quizz without questions", async () => {
      const invalidQuizz = { ...mockQuizz, questions: [] };

      await expect(
        controller.createGame(invalidQuizz as any, mockUser as any)
      ).rejects.toThrow(BadRequestException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.ANY_QUESTIONS");
    });

    it("should throw UnauthorizedException if user is not the author", async () => {
      const invalidQuizz = { ...mockQuizz, author: { id: "other-user-id" } };

      await expect(
        controller.createGame(invalidQuizz as any, mockUser as any)
      ).rejects.toThrow(UnauthorizedException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.PERMISSION_DENIED");
    });
  });
});