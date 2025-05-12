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
import { IQuizzType } from "@/quizz/types/QuestionType";
import { FileUploadService } from "@/files/files.service";

const mockQuizzRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockTranslationService = {
  translate: jest.fn((key: string) => key),
};

const mockUserService = {
  findOneUser: jest.fn(),
};

const mockFileUploadService = {
  uploadFile: jest.fn(),
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

      mockQuizzRepository.find.mockResolvedValue([quizz1]);

      const result = await service.getAll();

      expect(result).toEqual([quizz1]);
    });
  });

  describe("create", () => {
    it("should create and save a new quizz", async () => {
      const createQuizzDto: CreateQuizzDto = {
        title: "Quizz 1",
        description: "Description 1",
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
        description: "Description 1",
        quizzType: IQuizzType.QUESTIONS,
      };

      mockUserService.findOneUser.mockResolvedValue(null);

      await expect(service.create(createQuizzDto, "1")).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("update", () => {
    it("should update a quizz successfully", async () => {
      const quizzId = "1";
      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Quizz 1 updated",
        description: "Description 1 updated",
      };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest
        .spyOn(quizzRepo, "createQueryBuilder")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        .mockImplementation(() => mockQueryBuilder as any);

      await service.update(quizzId, updatedQuizzDto);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Quizz);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(updatedQuizzDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: quizzId,
      });
    });

    it("should throw HttpException if quizz not found", async () => {
      const quizzId = "1";
      const updatedQuizzDto: UpdatedQuizzDto = {
        title: "Quizz 1 updated",
        description: "Description 1 updated",
      };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      jest
        .spyOn(quizzRepo, "createQueryBuilder")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        .mockImplementation(() => mockQueryBuilder as any);

      await expect(service.update(quizzId, updatedQuizzDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("delete", () => {
    it("should delete a quizz successfully", async () => {
      const quizzId = "1";

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest
        .spyOn(quizzRepo, "createQueryBuilder")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        .mockImplementation(() => mockQueryBuilder as any);

      await service.delete(quizzId);

      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(Quizz);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: quizzId,
      });
    });

    it("should throw HttpException if quizz not found", async () => {
      const quizzId = "1";

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      jest
        .spyOn(quizzRepo, "createQueryBuilder")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
        .mockImplementation(() => mockQueryBuilder as any);

      await expect(service.delete(quizzId)).rejects.toThrow(HttpException);
    });
  });
});
