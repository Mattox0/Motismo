import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CardService } from "@/cards/service/card.service";
import { Card } from "@/cards/card.entity";
import { TranslationService } from "@/translation/translation.service";
import { FileUploadService } from "@/files/files.service";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Quizz } from "@/quizz/quizz.entity";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { IQuizzType } from "@/quizz/types/IQuizzType";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateCardDto } from "@/cards/dto/createCard.dto";
import { UpdateCardDto } from "@/cards/dto/updateCard.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

interface ISetCallArgs {
  order: () => string;
}

interface IMockQueryBuilder {
  update: jest.Mock;
  set: jest.Mock;
  select: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  execute: jest.Mock;
  getRawOne: jest.Mock;
  mock: {
    calls: Array<Array<ISetCallArgs>>;
  };
}

interface ICardServicePrivate {
  reorderCards: (
    quizzId: string,
    newOrder: number,
    oldOrder?: number,
  ) => Promise<void>;
  getMaxOrder: (quizzId: string) => Promise<number>;
}

describe("CardService", () => {
  let service: CardService;
  let mockCardRepository: Partial<Repository<Card>>;
  let mockTranslationService: Partial<TranslationService>;
  let mockFileUploadService: Partial<FileUploadService>;

  const mockUser: User = {
    id: "user-id",
    username: "testuser",
    email: "test@example.com",
    password: "hashed-password",
    creationDate: new Date(),
    role: Role.Customer,
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
      find: jest.fn().mockResolvedValue([mockCard]),
      findOne: jest.fn().mockResolvedValue(mockCard),
      create: jest.fn().mockReturnValue(mockCard),
      save: jest.fn().mockResolvedValue(mockCard),
      delete: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 1 }),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      } as unknown as SelectQueryBuilder<Card>),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated error message"),
    };

    mockFileUploadService = {
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCards", () => {
    it("should return an array of cards", async () => {
      const result = await service.getCards("quizz-id");

      expect(result).toEqual([mockCard]);
      expect(mockCardRepository.find).toHaveBeenCalledWith({
        where: { quizz: { id: "quizz-id" } },
        order: { order: "ASC" },
      });
    });
  });

  describe("getCard", () => {
    it("should return a card by id", async () => {
      const result = await service.getCard("quizz-id", "card-id");

      expect(result).toEqual(mockCard);
      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: "card-id", quizz: { id: "quizz-id" } },
      });
    });

    it("should throw NotFoundException when card is not found", async () => {
      mockCardRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.getCard("quizz-id", "non-existent-id"),
      ).rejects.toThrow(NotFoundException);
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "error.CARD_NOT_FOUND",
      );
    });
  });

  describe("createCard", () => {
    it("should create a new card", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
        order: 1,
      };

      const result = await service.createCard(mockQuizz, createCardDto);

      expect(result).toEqual(mockCard);
      expect(mockCardRepository.create).toHaveBeenCalledWith({
        ...createCardDto,
        quizz: mockQuizz,
        order: 1,
      });
      expect(mockCardRepository.save).toHaveBeenCalled();
    });

    it("should reorder cards when creating a new card", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
        order: 1,
      };

      const existingCards = [
        { ...mockCard, id: "card-1", order: 1 },
        { ...mockCard, id: "card-2", order: 2 },
      ];

      const mockQueryBuilder: IMockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 2 }),
        mock: {
          calls: [],
        },
      };

      mockCardRepository.find = jest.fn().mockResolvedValue(existingCards);
      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      await service.createCard(mockQuizz, createCardDto);

      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.any(Function) as () => string,
        }),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '"card"."quizzId" = :quizzId',
        { quizzId: mockQuizz.id },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "card.order >= :newOrder",
        { newOrder: 1 },
      );
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it("should throw BadRequestException when order is invalid", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
        order: -1,
      };

      await expect(
        service.createCard(mockQuizz, createCardDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "error.INVALID_ORDER_VALUE",
      );
    });

    it("should automatically set order to maxOrder + 1 when order is not specified", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
      };

      const mockQueryBuilder: IMockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 2 }),
        mock: {
          calls: [],
        },
      };

      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      const result = await service.createCard(mockQuizz, createCardDto);

      expect(result).toEqual(mockCard);
      expect(mockCardRepository.create).toHaveBeenCalledWith({
        ...createCardDto,
        quizz: mockQuizz,
        order: 3,
      });
      expect(mockCardRepository.save).toHaveBeenCalled();
    });
  });

  describe("updateCard", () => {
    it("should update a card", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
      };

      const result = await service.updateCard(
        mockQuizz,
        mockCard,
        updateCardDto,
      );

      expect(result).toEqual(mockCard);
      expect(mockCardRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it("should reorder cards when moving a card to a higher position", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: 3,
      };

      const existingCards = [
        { ...mockCard, id: "card-1", order: 1 },
        { ...mockCard, id: "card-2", order: 2 },
        { ...mockCard, id: "card-3", order: 3 },
      ];

      const mockQueryBuilder: IMockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 3 }),
        mock: {
          calls: [],
        },
      };

      mockCardRepository.find = jest.fn().mockResolvedValue(existingCards);
      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      await service.updateCard(
        mockQuizz,
        { ...mockCard, order: 1 },
        updateCardDto,
      );

      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.any(Function) as () => string,
        }),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '"card"."quizzId" = :quizzId',
        { quizzId: mockQuizz.id },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "card.order > :oldOrder AND card.order <= :newOrder",
        { oldOrder: 1, newOrder: 3 },
      );
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it("should reorder cards when moving a card to a lower position", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: 1,
      };

      const existingCards = [
        { ...mockCard, id: "card-1", order: 1 },
        { ...mockCard, id: "card-2", order: 2 },
        { ...mockCard, id: "card-3", order: 3 },
      ];

      const mockQueryBuilder: IMockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 3 }),
        mock: {
          calls: [],
        },
      };

      mockCardRepository.find = jest.fn().mockResolvedValue(existingCards);
      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      await service.updateCard(
        mockQuizz,
        { ...mockCard, order: 3 },
        updateCardDto,
      );

      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.any(Function) as () => string,
        }),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '"card"."quizzId" = :quizzId',
        { quizzId: mockQuizz.id },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "card.order >= :newOrder AND card.order < :oldOrder",
        { oldOrder: 3, newOrder: 1 },
      );
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it("should throw BadRequestException when order is invalid", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: -1,
      };

      await expect(
        service.updateCard(mockQuizz, mockCard, updateCardDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "error.INVALID_ORDER_VALUE",
      );
    });

    it("should delete unused images when updating", async () => {
      const cardWithImages = {
        ...mockCard,
        rectoImage: "old-recto.jpg",
        versoImage: "old-verso.jpg",
      };

      const updateCardDto: UpdateCardDto = {
        rectoImage: "new-recto.jpg",
        versoImage: "new-verso.jpg",
      };

      await service.updateCard(mockQuizz, cardWithImages, updateCardDto);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(
        "old-recto.jpg",
      );
      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(
        "old-verso.jpg",
      );
    });
  });

  describe("deleteCard", () => {
    it("should delete a card and its images", async () => {
      const cardWithImages = {
        ...mockCard,
        rectoImage: "recto.jpg",
        versoImage: "verso.jpg",
      };

      await service.delete(mockQuizz, cardWithImages);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(
        "recto.jpg",
      );
      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(
        "verso.jpg",
      );
      expect(mockCardRepository.delete).toHaveBeenCalledWith(cardWithImages.id);
    });
  });

  describe("reorderCards", () => {
    it("should correctly increment the order of affected cards", async () => {
      const mockExecute = jest.fn().mockResolvedValue({
        affected: 2,
      });

      const mockQueryBuilder: IMockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: mockExecute,
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 2 }),
        mock: {
          calls: [],
        },
      };

      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      const privateService = service as unknown as ICardServicePrivate;

      await privateService.reorderCards("quizz-id", 3, 1);

      expect(mockCardRepository.createQueryBuilder).toHaveBeenCalledWith(
        "card",
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Card);

      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        order: expect.any(Function),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const setCallArgs = mockQueryBuilder.set.mock.calls[0][0] as ISetCallArgs;
      const orderFunction = setCallArgs.order;

      expect(orderFunction()).toBe("card.order + 1");

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '"card"."quizzId" = :quizzId',
        { quizzId: "quizz-id" },
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "card.order > :oldOrder AND card.order <= :newOrder",
        { oldOrder: 1, newOrder: 3 },
      );

      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it("should handle moving a card to a lower position", async () => {
      const mockExecute = jest.fn().mockResolvedValue({
        affected: 2,
      });

      const mockQueryBuilder: IMockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: mockExecute,
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 2 }),
        mock: {
          calls: [],
        },
      };

      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      const privateService = service as unknown as ICardServicePrivate;

      await privateService.reorderCards("quizz-id", 1, 3);

      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        order: expect.any(Function),
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "card.order >= :newOrder AND card.order < :oldOrder",
        { oldOrder: 3, newOrder: 1 },
      );

      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it("should handle inserting a new card", async () => {
      const mockExecute = jest.fn().mockResolvedValue({
        affected: 2,
      });

      const mockQueryBuilder: IMockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: mockExecute,
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 2 }),
        mock: {
          calls: [],
        },
      };

      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      // Call reorderCards without an oldOrder, simulating an insert
      const privateService = service as unknown as ICardServicePrivate;

      await privateService.reorderCards("quizz-id", 2);

      // Verify the where conditions for insertion
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "card.order >= :newOrder",
        { newOrder: 2 },
      );

      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe("getMaxOrder", () => {
    it("should return the maximum order value for cards in a quizz", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 5 }),
      };

      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      const privateService = service as unknown as ICardServicePrivate;
      const result = await privateService.getMaxOrder("quizz-id");

      expect(result).toBe(5);

      expect(mockCardRepository.createQueryBuilder).toHaveBeenCalledWith(
        "card",
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        "MAX(card.order)",
        "maxOrder",
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "card.quizz.id = :quizzId",
        { quizzId: "quizz-id" },
      );
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    });

    it("should return -1 when no cards exist in the quizz", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      // Call the private getMaxOrder method
      const privateService = service as unknown as ICardServicePrivate;
      const result = await privateService.getMaxOrder("empty-quizz-id");

      // Verify that -1 is returned when no cards exist
      expect(result).toBe(-1);
    });

    it("should return -1 when maxOrder is null", async () => {
      // Create a mock for the query builder that returns an object with null maxOrder
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: null }),
      };

      mockCardRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      // Call the private getMaxOrder method
      const privateService = service as unknown as ICardServicePrivate;
      const result = await privateService.getMaxOrder("quizz-id");

      // Verify that -1 is returned when maxOrder is null
      expect(result).toBe(-1);
    });
  });

  describe("CreateCardDto", () => {
    describe("order property transformation", () => {
      it("should transform string numbers to integers", async () => {
        const rawData = {
          rectoText: "Front text",
          versoText: "Back text",
          order: "42",
        };

        const dto = plainToClass(CreateCardDto, rawData);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.order).toBe(42);
        expect(typeof dto.order).toBe("number");
      });

      it("should handle undefined order value", async () => {
        const rawData = {
          rectoText: "Front text",
          versoText: "Back text",
        };

        const dto = plainToClass(CreateCardDto, rawData);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.order).toBeUndefined();
      });

      it("should handle null order value", async () => {
        const rawData = {
          rectoText: "Front text",
          versoText: "Back text",
          order: null,
        };

        const dto = plainToClass(CreateCardDto, rawData);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.order).toBeUndefined();
      });

      it("should handle empty string order value", async () => {
        const rawData = {
          rectoText: "Front text",
          versoText: "Back text",
          order: "",
        };

        const dto = plainToClass(CreateCardDto, rawData);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.order).toBeUndefined();
      });

      it("should handle non-numeric string order value", async () => {
        const rawData = {
          rectoText: "Front text",
          versoText: "Back text",
          order: "not-a-number",
        };

        const dto = plainToClass(CreateCardDto, rawData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe("order");
        expect(isNaN(dto.order as number)).toBe(true);
      });

      it("should handle floating point string numbers", async () => {
        const rawData = {
          rectoText: "Front text",
          versoText: "Back text",
          order: "42.5",
        };

        const dto = plainToClass(CreateCardDto, rawData);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.order).toBe(42);
        expect(typeof dto.order).toBe("number");
      });
    });
  });
});
