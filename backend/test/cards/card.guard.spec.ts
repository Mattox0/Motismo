import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CardGuard } from "@/cards/guards/card.guard";
import { Card } from "@/cards/card.entity";
import { TranslationService } from "@/translation/translation.service";
import { HttpException, ExecutionContext } from "@nestjs/common";
import { Repository } from "typeorm";
import { Quizz } from "@/quizz/quizz.entity";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { IQuizzType } from "@/quizz/types/IQuizzType";

describe("CardGuard", () => {
  let guard: CardGuard;
  let mockCardRepository: Partial<Repository<Card>>;
  let mockTranslationService: Partial<TranslationService>;

  const mockUser: User = {
    id: "user-id",
    username: "testuser",
    email: "test@example.com",
    password: "hashed-password",
    creationDate: new Date(),
    role: Role.Student,
  };

  const mockQuizz: Quizz = {
    id: "quizz-id",
    title: "Quizz title",
    author: mockUser,
    creationDate: new Date(),
    quizzType: IQuizzType.QUESTIONS,
    games: [],
    image: "image.jpg",
    questions: [],
    cards: [],
    classes: [],
  };

  const mockCard: Card = {
    id: "card-id",
    rectoText: "Recto text",
    versoText: "Verso text",
    order: 1,
    quizz: mockQuizz,
  };

  beforeEach(async () => {
    mockCardRepository = {
      findOne: jest.fn().mockResolvedValue(mockCard),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated error message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardGuard,
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    guard = module.get<CardGuard>(CardGuard);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow access when card exists", async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: {
            cardId: "47200885-1787-4374-bc51-fd6de934ec26",
          },
        }),
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockCardRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: "47200885-1787-4374-bc51-fd6de934ec26",
      },
      relations: {
        quizz: true,
      },
    });
  });

  it("should throw HttpException when cardId is invalid", async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: {
            cardId: "invalid-id",
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    expect(mockTranslationService.translate).toHaveBeenCalledWith("error.ID_INVALID");
  });

  it("should throw HttpException when card is not found", async () => {
    mockCardRepository.findOne = jest.fn().mockResolvedValue(null);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: {
            cardId: "c6ab54f5-2943-4ee2-96ee-73582ef5f8db",
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    expect(mockTranslationService.translate).toHaveBeenCalledWith("error.CARD_NOT_FOUND");
  });

  it("should throw HttpException when cardId is missing", async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: {},
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    expect(mockTranslationService.translate).toHaveBeenCalledWith("error.ID_INVALID");
  });
});
