import { Test, TestingModule } from "@nestjs/testing";
import { CardController } from "@/cards/controller/card.controller";
import { CardService } from "@/cards/service/card.service";
import { TranslationService } from "@/translation/translation.service";
import { FileUploadService } from "@/files/files.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Card } from "@/cards/card.entity";
import { Quizz } from "@/quizz/quizz.entity";
import { User } from "@/user/user.entity";
import { CreateCardDto } from "@/cards/dto/createCard.dto";
import { UpdateCardDto } from "@/cards/dto/updateCard.dto";
import { Repository } from "typeorm";
import { Role } from "@/user/role.enum";
import { UserService } from "@/user/service/user.service";
import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ParseFilesPipe } from "@/files/files.validator";
import { IQuizzType } from "@/quizz/types/QuestionType";
import { QuizzGuard } from "@/quizz/guards/quizz.guard";
import { CardGuard } from "@/cards/guards/card.guard";

describe("CardController", () => {
  let cardController: CardController;
  let mockCardService: Partial<CardService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockFileUploadService: Partial<FileUploadService>;
  let mockCardRepository: Partial<Repository<Card>>;
  let mockQuizzRepository: Partial<Repository<Quizz>>;
  let mockParseFilesPipe: Partial<ParseFilesPipe>;

  const createMocks = () => {
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

    return {
      mockUser,
      mockQuizz,
      mockCard,
      mockCards: [mockCard],
      mockUserAuthGuard: { canActivate: jest.fn().mockReturnValue(true) },
      mockQuizzGuard: { canActivate: jest.fn().mockReturnValue(true) },
      mockCardGuard: { canActivate: jest.fn().mockReturnValue(true) },
    };
  };

  const setupMocks = () => {
    mockCardRepository = {};
    mockQuizzRepository = {};

    mockCardService = {
      getCards: jest.fn().mockResolvedValue(mocks.mockCards),
      createCard: jest.fn().mockResolvedValue(undefined),
      updateCard: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockTranslationService = {
      translate: jest.fn((key) => Promise.resolve(key)),
    };

    mockFileUploadService = {
      uploadFile: jest.fn().mockResolvedValue("test.jpg"),
      getFileUrl: jest.fn().mockReturnValue("http://example.com/test.jpg"),
    };

    mockParseFilesPipe = {
      transform: jest.fn().mockImplementation((value: unknown) => {
        if (value && typeof value === "object" && "fieldname" in value) {
          const file = value as Express.Multer.File;

          return {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            buffer: file.buffer,
            size: file.size,
          };
        }

        return value;
      }),
    };
  };

  const mocks = createMocks();

  beforeEach(async () => {
    setupMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        { provide: CardService, useValue: mockCardService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: FileUploadService, useValue: mockFileUploadService },
        { provide: getRepositoryToken(Card), useValue: mockCardRepository },
        { provide: getRepositoryToken(Quizz), useValue: mockQuizzRepository },
        { provide: UserService, useValue: {} },
        { provide: UserAuthGuard, useValue: mocks.mockUserAuthGuard },
        { provide: QuizzGuard, useValue: mocks.mockQuizzGuard },
        { provide: CardGuard, useValue: mocks.mockCardGuard },
        { provide: ParseFilesPipe, useValue: mockParseFilesPipe },
      ],
    }).compile();

    cardController = module.get<CardController>(CardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("getCards", () => {
    it("should return an array of cards", async () => {
      const cards: Card[] = [mocks.mockCard];

      jest.spyOn(mockCardService, "getCards").mockResolvedValue(cards);

      expect(await cardController.getCards(mocks.mockQuizz)).toEqual(cards);
    });
  });

  describe("getCard", () => {
    it("should return a card by id", () => {
      const result = cardController.getCard(mocks.mockCard);

      expect(result).toEqual(mocks.mockCard);
    });
  });

  describe("createCard", () => {
    it("should create a new card", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
        order: 1,
      };

      jest
        .spyOn(mockCardService, "createCard")
        .mockResolvedValue(mocks.mockCard);

      await cardController.createCard(
        mocks.mockQuizz,
        createCardDto,
        undefined,
      );

      expect(mockCardService.createCard).toHaveBeenCalledWith(
        mocks.mockQuizz,
        createCardDto,
      );
    });

    it("should upload files when creating a card", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
        order: 1,
      };

      const files = {
        rectoImage: [
          {
            fieldname: "rectoImage",
            originalname: "test.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: Buffer.from("test"),
            size: 1024,
          } as Express.Multer.File,
        ],
        versoImage: [
          {
            fieldname: "versoImage",
            originalname: "test.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: Buffer.from("test"),
            size: 1024,
          } as Express.Multer.File,
        ],
      };

      const fileName = "test.jpg";
      const fileUrl = "http://example.com/test.jpg";

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockResolvedValue(fileName);
      jest.spyOn(mockFileUploadService, "getFileUrl").mockReturnValue(fileUrl);
      jest
        .spyOn(mockCardService, "createCard")
        .mockResolvedValue(mocks.mockCard);

      await cardController.createCard(mocks.mockQuizz, createCardDto, files);

      expect(mockCardService.createCard).toHaveBeenCalledWith(mocks.mockQuizz, {
        ...createCardDto,
        rectoImage: fileUrl,
        versoImage: fileUrl,
      });
    });

    it("should throw HttpException when files validation fails", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
        order: 1,
      };

      const invalidFile = {
        fieldname: "rectoImage",
        originalname: "test.exe",
        encoding: "7bit",
        mimetype: "application/octet-stream",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File;

      jest.spyOn(mockParseFilesPipe, "transform").mockImplementation(() => {
        throw new HttpException("Invalid file", HttpStatus.BAD_REQUEST);
      });
      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("Invalid file");

      await expect(
        cardController.createCard(mocks.mockQuizz, createCardDto, {
          rectoImage: [invalidFile],
        }),
      ).rejects.toThrow(HttpException);
    });

    it("should throw HttpException when parseFilesPipe returns invalid result", async () => {
      const createCardDto: CreateCardDto = {
        rectoText: "New Recto Text",
        versoText: "New Verso Text",
        order: 1,
      };

      const files = {
        rectoImage: [
          {
            fieldname: "rectoImage",
            originalname: "test.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: Buffer.from("test"),
            size: 1024,
          } as Express.Multer.File,
        ],
      };

      jest.spyOn(mockParseFilesPipe, "transform").mockResolvedValue({
        fieldname: "rectoImage",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File);
      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("Invalid file");

      await expect(
        cardController.createCard(mocks.mockQuizz, createCardDto, files),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("updateCard", () => {
    it("should update a card", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: 2,
      };

      jest
        .spyOn(mockCardService, "updateCard")
        .mockResolvedValue(mocks.mockCard);

      await cardController.updateCard(
        mocks.mockQuizz,
        mocks.mockCard,
        updateCardDto,
        undefined,
      );

      expect(mockCardService.updateCard).toHaveBeenCalledWith(
        mocks.mockQuizz,
        mocks.mockCard,
        updateCardDto,
      );
    });

    it("should upload files when updating a card", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: 2,
      };

      const files = {
        rectoImage: [
          {
            fieldname: "rectoImage",
            originalname: "test.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: Buffer.from("test"),
            size: 1024,
          } as Express.Multer.File,
        ],
        versoImage: [
          {
            fieldname: "versoImage",
            originalname: "test.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: Buffer.from("test"),
            size: 1024,
          } as Express.Multer.File,
        ],
      };

      const fileName = "test.jpg";
      const fileUrl = "http://example.com/test.jpg";

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockResolvedValue(fileName);
      jest.spyOn(mockFileUploadService, "getFileUrl").mockReturnValue(fileUrl);
      jest
        .spyOn(mockCardService, "updateCard")
        .mockResolvedValue(mocks.mockCard);

      await cardController.updateCard(
        mocks.mockQuizz,
        mocks.mockCard,
        updateCardDto,
        files,
      );

      expect(mockCardService.updateCard).toHaveBeenCalledWith(
        mocks.mockQuizz,
        mocks.mockCard,
        {
          ...updateCardDto,
          rectoImage: fileUrl,
          versoImage: fileUrl,
        },
      );
    });

    it("should throw HttpException when files validation fails during update", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: 2,
      };

      const invalidFile = {
        fieldname: "rectoImage",
        originalname: "test.exe",
        encoding: "7bit",
        mimetype: "application/octet-stream",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File;

      jest.spyOn(mockParseFilesPipe, "transform").mockImplementation(() => {
        throw new HttpException("Invalid file", HttpStatus.BAD_REQUEST);
      });
      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("Invalid file");

      await expect(
        cardController.updateCard(
          mocks.mockQuizz,
          mocks.mockCard,
          updateCardDto,
          {
            rectoImage: [invalidFile],
          },
        ),
      ).rejects.toThrow(HttpException);
    });

    it("should throw HttpException when parseFilesPipe returns invalid result during update", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: 2,
      };

      const files = {
        rectoImage: [
          {
            fieldname: "rectoImage",
            originalname: "test.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: Buffer.from("test"),
            size: 1024,
          } as Express.Multer.File,
        ],
      };

      jest.spyOn(mockParseFilesPipe, "transform").mockResolvedValue({
        fieldname: "rectoImage",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File);
      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("Invalid file");

      await expect(
        cardController.updateCard(
          mocks.mockQuizz,
          mocks.mockCard,
          updateCardDto,
          files,
        ),
      ).rejects.toThrow(HttpException);
    });

    it("should throw HttpException when file upload fails during update", async () => {
      const updateCardDto: UpdateCardDto = {
        rectoText: "Updated Recto Text",
        versoText: "Updated Verso Text",
        order: 2,
      };

      const files = {
        rectoImage: [
          {
            fieldname: "rectoImage",
            originalname: "test.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer: Buffer.from("test"),
            size: 1024,
          } as Express.Multer.File,
        ],
      };

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockRejectedValue(
          new HttpException("Upload failed", HttpStatus.BAD_REQUEST),
        );
      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("File upload failed");

      await expect(
        cardController.updateCard(
          mocks.mockQuizz,
          mocks.mockCard,
          updateCardDto,
          files,
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("deleteCard", () => {
    it("should delete a card", async () => {
      jest.spyOn(mockCardService, "delete").mockResolvedValue(undefined);

      await cardController.deleteCard(mocks.mockQuizz, mocks.mockCard);

      expect(mockCardService.delete).toHaveBeenCalledWith(
        mocks.mockQuizz,
        mocks.mockCard,
      );
    });
  });
});
