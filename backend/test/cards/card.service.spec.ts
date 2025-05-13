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
import { IQuizzType } from "@/quizz/types/QuestionType";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateCardDto } from "@/cards/dto/createCard.dto";
import { UpdateCardDto } from "@/cards/dto/updateCard.dto";

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
    description: "Quizz description",
    author: mockUser,
    creationDate: new Date(),
    quizzType: IQuizzType.QUESTIONS,
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

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 2 }),
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

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 3 }),
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

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 3 }),
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
});
