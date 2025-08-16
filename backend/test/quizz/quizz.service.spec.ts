import { Test, TestingModule } from "@nestjs/testing";
import { QuizzService } from "@/quizz/service/quizz.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Quizz } from "@/quizz/quizz.entity";
import { TranslationService } from "@/translation/translation.service";
import { Repository } from "typeorm";
import { CreateQuizzDto } from "@/quizz/dto/createQuizzDto";
import { UpdatedQuizzDto } from "@/quizz/dto/updatedQuizzDto";
import { UserService } from "@/user/service/user.service";
import { HttpException } from "@nestjs/common";
import { Role } from "@/user/role.enum";
import { IQuizzType } from "@/quizz/types/IQuizzType";
import { FileUploadService } from "@/files/files.service";

const mockQuizzRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

const mockTranslationService = {
  translate: jest.fn((key: string) => key),
};

const mockUserService = {
  findOneUser: jest.fn(),
};

const mockFileUploadService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
};

describe("QuizzService", () => {
  let service: QuizzService;
  let quizzRepo: Repository<Quizz>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzService,
        {
          provide: getRepositoryToken(Quizz),
          useValue: mockQuizzRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    service = module.get<QuizzService>(QuizzService);
    quizzRepo = module.get<Repository<Quizz>>(getRepositoryToken(Quizz));
  });

  describe("getAll", () => {
    it("should return an array of quizz", async () => {
      const quizz1: Quizz = {
        id: "1",
        title: "Quizz 1",
        quizzType: IQuizzType.QUESTIONS,
        games: [],
        image: "image.jpg",
        questions: [],
        cards: [],
        author: {
          id: "1",
          username: "Author 1",
          email: "example@yoohoo.fr",
          password: "password",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      mockQuizzRepository.find.mockResolvedValue([quizz1]);

      const result = await service.getAll();

      expect(result).toEqual([quizz1]);
    });
  });

  describe("create", () => {
    it("should create and save a new quizz", async () => {
      const createQuizzDto: CreateQuizzDto = {
        title: "Quizz 1",
        quizzType: IQuizzType.QUESTIONS,
      };

      const user = {
        id: "1",
        username: "Author 1",
      };

      mockUserService.findOneUser.mockResolvedValue(user);
      mockQuizzRepository.create.mockReturnValue({
        ...createQuizzDto,
        author: user,
      });
      mockQuizzRepository.save.mockResolvedValue({
        ...createQuizzDto,
        author: user,
      });

      await service.create(createQuizzDto, "1");

      expect(mockQuizzRepository.create).toHaveBeenCalledWith({
        ...createQuizzDto,
        author: user,
      });
      expect(mockQuizzRepository.save).toHaveBeenCalledWith({
        ...createQuizzDto,
        author: user,
      });
    });

    it("should throw HttpException if user not found", async () => {
      const createQuizzDto: CreateQuizzDto = {
        title: "Quizz 1",
        quizzType: IQuizzType.QUESTIONS,
      };

      mockUserService.findOneUser.mockResolvedValue(null);

      await expect(service.create(createQuizzDto, "1")).rejects.toThrow(HttpException);
    });
  });

  describe("update", () => {
    it("should update a quizz successfully", async () => {
      const quizzId = "1";
      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Quizz 1 updated",
      };

      const existingQuizz: Quizz = {
        id: quizzId,
        title: "Quizz 1",
        quizzType: IQuizzType.QUESTIONS,
        games: [],
        image: "image.jpg",
        questions: [],
        cards: [],
        author: {
          id: "1",
          username: "Author 1",
          email: "example@yoohoo.fr",
          password: "password",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(existingQuizz);
      jest
        .spyOn(quizzRepo, "createQueryBuilder")

        .mockImplementation(() => mockQueryBuilder as any);

      await service.update(existingQuizz, updatedQuizzDto);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Quizz);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(updatedQuizzDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: quizzId,
      });
    });

    it("should delete old image when updating with new image", async () => {
      const quizzId = "1";
      const oldImage = "old-image.jpg";
      const newImage = "new-image.jpg";

      const existingQuizz: Quizz = {
        id: quizzId,
        title: "Quizz 1",
        games: [],
        questions: [],
        cards: [],
        image: oldImage,
        quizzType: IQuizzType.QUESTIONS,
        author: {
          id: "1",
          username: "Author 1",
          email: "example@yoohoo.fr",
          password: "password",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Quizz 1 updated",
        image: newImage,
      };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockQuizzRepository.findOne.mockResolvedValue(existingQuizz);
      jest
        .spyOn(quizzRepo, "createQueryBuilder")

        .mockImplementation(() => mockQueryBuilder as any);

      mockFileUploadService.deleteFile.mockClear();

      await service.update(existingQuizz, updatedQuizzDto);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(oldImage);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Quizz);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(updatedQuizzDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: quizzId,
      });
    });

    it("should throw HttpException if update fails", async () => {
      const quizzId = "1";
      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Quizz 1 updated",
      };

      const existingQuizz: Quizz = {
        id: quizzId,
        title: "Quizz 1",
        games: [],
        image: "image.jpg",
        questions: [],
        cards: [],
        quizzType: IQuizzType.QUESTIONS,
        author: {
          id: "1",
          username: "Author 1",
          email: "example@yoohoo.fr",
          password: "password",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(existingQuizz);
      jest
        .spyOn(quizzRepo, "createQueryBuilder")

        .mockImplementation(() => mockQueryBuilder as any);

      await expect(service.update(existingQuizz, updatedQuizzDto)).rejects.toThrow("error.QUIZZ_NOT_FOUND");
    });
  });

  describe("delete", () => {
    it("should delete a quizz successfully", async () => {
      const quizzId = "1";
      const existingQuizz = {
        id: quizzId,
        title: "Quizz 1",
        description: "Description 1",
        image: "test-image.jpg",
        quizzType: IQuizzType.QUESTIONS,
        author: {
          id: "1",
          username: "Author 1",
          email: "example@yoohoo.fr",
          password: "password",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(existingQuizz);
      mockQuizzRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await service.delete(quizzId);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(existingQuizz.image);
      expect(mockQuizzRepository.delete).toHaveBeenCalledWith(quizzId);
    });

    it("should delete a quizz without image successfully", async () => {
      const quizzId = "1";
      const existingQuizz = {
        id: quizzId,
        title: "Quizz 1",
        description: "Description 1",
        quizzType: IQuizzType.QUESTIONS,
        author: {
          id: "1",
          username: "Author 1",
          email: "example@yoohoo.fr",
          password: "password",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(existingQuizz);
      mockQuizzRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
      mockFileUploadService.deleteFile.mockClear();

      await service.delete(quizzId);

      expect(mockFileUploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockQuizzRepository.delete).toHaveBeenCalledWith(quizzId);
    });

    it("should throw NotFoundException if quizz not found", async () => {
      const quizzId = "1";

      mockQuizzRepository.findOne = jest.fn().mockResolvedValue(null);
      mockQuizzRepository.delete.mockClear();

      await expect(service.delete(quizzId)).rejects.toThrow("error.QUIZZ_NOT_FOUND");
      expect(mockQuizzRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("getMyQuizz", () => {
    it("calls repository with code filter and relations, returns quizz", async () => {
      const quizz: Quizz = {
        id: "qz-1",
        title: "Quiz",
        quizzType: IQuizzType.QUESTIONS,
        games: [],
        image: "i.jpg",
        questions: [],
        cards: [],
        author: {
          id: "u1",
          username: "u",
          email: "u@e.c",
          password: "p",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      mockQuizzRepository.findOne.mockResolvedValue(quizz);

      const res = await service.getByCode("ROOM123");

      expect(mockQuizzRepository.findOne).toHaveBeenCalledWith({
        where: { games: { code: "ROOM123" } },
        relations: { cards: true, questions: true, games: true, author: true },
      });
      expect(res).toBe(quizz);
    });

    it("returns null when quizz not found", async () => {
      mockQuizzRepository.findOne.mockResolvedValue(null);

      const res = await service.getByCode("UNKNOWN");

      expect(mockQuizzRepository.findOne).toHaveBeenCalledWith({
        where: { games: { code: "UNKNOWN" } },
        relations: { cards: true, questions: true, games: true, author: true },
      });
      expect(res).toBeNull();
    });

    it("returns quizzes for the given user with relations", async () => {
      const user = { id: "user-42" } as any;
      const rows = [{ id: "qz1" }, { id: "qz2" }] as any[];

      mockQuizzRepository.find.mockResolvedValue(rows);

      const res = await service.getMyQuizz(user);

      expect(mockQuizzRepository.find).toHaveBeenCalledWith({
        where: { author: { id: "user-42" } },
        relations: { cards: true, questions: true },
      });
      expect(res).toBe(rows);
    });
  });

  describe("findOne", () => {
    it("returns the quizz with relations when found", async () => {
      const quizz: Quizz = {
        id: "abc",
        title: "T",
        quizzType: IQuizzType.QUESTIONS,
        games: [],
        image: "i.jpg",
        questions: [],
        cards: [],
        author: {
          id: "u1",
          username: "x",
          email: "x@y.z",
          password: "p",
          creationDate: new Date(),
          role: Role.Customer,
        },
        creationDate: new Date(),
      };

      mockQuizzRepository.findOne.mockResolvedValue(quizz);

      const res = await service.findOne("abc");

      expect(mockQuizzRepository.findOne).toHaveBeenCalledWith({
        where: { id: "abc" },
        relations: { author: true, questions: true },
      });
      expect(res).toBe(quizz);
    });

    it("throws when quizz not found", async () => {
      mockQuizzRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("missing")).rejects.toThrow("error.QUIZZ_NOT_FOUND");
      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.QUIZZ_NOT_FOUND");
    });
  });
});
