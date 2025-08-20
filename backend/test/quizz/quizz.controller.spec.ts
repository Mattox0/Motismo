import { Test, TestingModule } from "@nestjs/testing";
import { QuizzController } from "@/quizz/controller/quizz.controller";
import { QuizzService } from "@/quizz/service/quizz.service";
import { TranslationService } from "@/translation/translation.service";
import { FileUploadService } from "@/files/files.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Quizz } from "@/quizz/quizz.entity";
import { User } from "@/user/user.entity";
import { CreateQuizzDto } from "@/quizz/dto/createQuizzDto";
import { UpdatedQuizzDto } from "@/quizz/dto/updatedQuizzDto";
import { Repository } from "typeorm";
import { Role } from "@/user/role.enum";
import { UserService } from "@/user/service/user.service";
import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { HttpException } from "@nestjs/common";
import { IQuizzType } from "@/quizz/types/IQuizzType";
import { ParseFilesPipe } from "@/files/files.validator";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockImplementation(() => "hashed-new-password"),
}));

describe("QuizzController", () => {
  let quizzController: QuizzController;
  let mockQuizzService: any;
  let mockTranslationService: any;
  let mockFileUploadService: any;
  let mockQuizzRepository: Partial<Repository<Quizz>>;
  let mockParseFilesPipe: Partial<ParseFilesPipe>;

  const mockQuizz: Quizz = {
    id: "quizz-id",
    title: "Quizz title",
    games: [],
    image: "image.jpg",
    questions: [],
    cards: [],
    classes: [],
    author: {} as User,
    creationDate: new Date(),
    quizzType: IQuizzType.QUESTIONS,
  };

  const mockUser: User = {
    id: "user-id",
    username: "testuser",
    email: "test@example.com",
    password: "hashed-password",
    creationDate: new Date(),
    role: Role.Student,
  };

  const mockQuizzs: Quizz[] = [mockQuizz];

  const mockUserAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    mockQuizzRepository = {};

    mockQuizzService = {
      getAll: jest.fn().mockResolvedValue(mockQuizzs),
      getMyQuizz: jest.fn().mockResolvedValue(mockQuizzs),
      getStudentQuizz: jest.fn().mockResolvedValue(mockQuizzs),
      getByCode: jest.fn(),
      create: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockTranslationService = {
      translate: jest.fn((key) => Promise.resolve(key)),
    };

    mockFileUploadService = {
      uploadFile: jest.fn().mockResolvedValue("http://example.com/new-file.jpg"),
      getFileUrl: jest.fn().mockResolvedValue("http://example.com/new-file.jpg"),
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzController],
      providers: [
        { provide: QuizzService, useValue: mockQuizzService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: FileUploadService, useValue: mockFileUploadService },
        { provide: getRepositoryToken(Quizz), useValue: mockQuizzRepository },
        { provide: UserService, useValue: {} },
        { provide: UserAuthGuard, useValue: mockUserAuthGuard },
        { provide: ParseFilesPipe, useValue: mockParseFilesPipe },
      ],
    }).compile();

    quizzController = module.get<QuizzController>(QuizzController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("getAll", () => {
    it("should return an array of quizzs", async () => {
      const quizzs: Quizz[] = [mockQuizz];

      jest.spyOn(mockQuizzService, "getAll").mockResolvedValue(quizzs);

      expect(await quizzController.getAll(mockUser)).toEqual(quizzs);
    });
  });

  describe("getById", () => {
    it("should return a quizz by id", () => {
      const result = quizzController.getById(mockQuizz);

      expect(result).toEqual(mockQuizz);
    });
  });

  describe("getByCode", () => {
    it("returns the quizz when found", async () => {
      mockQuizzService.getByCode.mockResolvedValue(mockQuizz);

      const result = await quizzController.getByCode("ABC123");

      expect(mockQuizzService.getByCode).toHaveBeenCalledWith("ABC123");
      expect(result).toEqual(mockQuizz);
    });

    it("throws when quizz not found", async () => {
      mockQuizzService.getByCode.mockResolvedValue(null);

      await expect(quizzController.getByCode("MISSING")).rejects.toThrow(HttpException);
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.QUIZZ_NOT_FOUND");
    });
  });

  describe("createQuizz", () => {
    it("should create a new quizz", async () => {
      const createQuizzDto: CreateQuizzDto = {
        title: "New Quizz",
        quizzType: IQuizzType.QUESTIONS,
      };

      jest.spyOn(mockQuizzService, "create").mockResolvedValue(mockQuizz);

      await quizzController.create(mockUser, createQuizzDto, undefined);

      expect(mockQuizzService.create).toHaveBeenCalledWith(createQuizzDto, mockUser.id);
    });

    it("should upload a file when creating a quizz", async () => {
      const createQuizzDto: CreateQuizzDto = {
        title: "New Quizz",
        quizzType: IQuizzType.QUESTIONS,
      };

      const file: Express.Multer.File = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File;

      const fileName = "test.jpg";
      const fileUrl = "http://example.com/new-file.jpg";

      jest.spyOn(mockFileUploadService, "uploadFile").mockResolvedValue(fileName);
      jest.spyOn(mockFileUploadService, "getFileUrl").mockReturnValue(fileUrl);
      jest.spyOn(mockQuizzService, "create").mockResolvedValue(mockQuizz);

      await quizzController.create(mockUser, createQuizzDto, file);

      expect(mockQuizzService.create).toHaveBeenCalledWith(
        {
          ...createQuizzDto,
          image: fileUrl,
        },
        mockUser.id,
      );
    });
  });

  describe("updateQuizz", () => {
    it("should update a quizz when user is the author", async () => {
      const quizzExisting = {
        ...mockQuizz,
        id: "quizz-id",
        author: mockUser,
      };

      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Updated Quizz",
      };

      jest.spyOn(mockQuizzService, "update").mockResolvedValue({ ...quizzExisting, ...updatedQuizzDto });

      await quizzController.update(mockUser, quizzExisting, updatedQuizzDto, undefined);

      expect(mockQuizzService.update).toHaveBeenCalledWith(quizzExisting, updatedQuizzDto);
    });

    it("should upload a file when updating a quizz", async () => {
      const quizzExisting = {
        ...mockQuizz,
        id: "quizz-id",
        author: mockUser,
      };

      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Updated Quizz",
      };

      const file: Express.Multer.File = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File;

      const fileUrl = "http://example.com/new-file.jpg";

      jest.spyOn(mockFileUploadService, "uploadFile").mockResolvedValue("test.jpg");
      jest.spyOn(mockFileUploadService, "getFileUrl").mockReturnValue(fileUrl);
      jest
        .spyOn(mockQuizzService, "update")
        .mockResolvedValue({ ...quizzExisting, ...updatedQuizzDto, image: fileUrl });

      await quizzController.update(mockUser, quizzExisting, updatedQuizzDto, file);

      expect(mockQuizzService.update).toHaveBeenCalledWith(quizzExisting, {
        ...updatedQuizzDto,
        image: fileUrl,
      });
    });

    it("should throw an HttpException if user is not the author", async () => {
      const quizzExisting = {
        ...mockQuizz,
        id: "quizz-id",
        author: { id: "other-user-id" } as User,
      };

      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Updated Quizz",
      };

      await expect(quizzController.update(mockUser, quizzExisting, updatedQuizzDto, undefined)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("deleteQuizz", () => {
    it("should delete a quizz", async () => {
      const quizzId = "quizz-id";

      jest.spyOn(mockQuizzService, "delete").mockResolvedValue(undefined);

      await quizzController.delete(mockQuizz);

      expect(mockQuizzService.delete).toHaveBeenCalledWith(quizzId);
    });
  });
});
