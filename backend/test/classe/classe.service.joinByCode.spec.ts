import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

import { ClasseService } from "@/classe/service/classe.service";
import { Classe } from "@/classe/classe.entity";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { TranslationService } from "@/translation/translation.service";

describe("ClasseService - joinByCode", () => {
  let service: ClasseService;
  let classeRepository: Repository<Classe>;
  let userRepository: Repository<User>;
  let translationService: TranslationService;

  const mockClasseRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockTranslationService = {
    translate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasseService,
        {
          provide: getRepositoryToken(Classe),
          useValue: mockClasseRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    service = module.get<ClasseService>(ClasseService);
    classeRepository = module.get<Repository<Classe>>(getRepositoryToken(Classe));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    translationService = module.get<TranslationService>(TranslationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("joinByCode", () => {
    const mockCode = "ABC123";
    const mockStudent: User = {
      id: "student-id",
      username: "teststudent",
      email: "student@test.com",
      password: "password",
      role: Role.Student,
      creationDate: new Date(),
      studentClasses: [],
      teacherClasses: [],
    } as User;

    const mockTeacher: User = {
      id: "teacher-id",
      username: "testteacher",
      email: "teacher@test.com",
      password: "password",
      role: Role.Teacher,
      creationDate: new Date(),
      studentClasses: [],
      teacherClasses: [],
    } as User;

    const mockClasse: Classe = {
      id: "classe-id",
      name: "Test Class",
      code: mockCode,
      students: [],
      teachers: [mockTeacher],
      quizz: [],
    } as Classe;

    it("should allow a student to join a class by code", async () => {
      mockClasseRepository.findOne.mockResolvedValue(mockClasse);
      mockClasseRepository.save.mockResolvedValue({
        ...mockClasse,
        students: [mockStudent],
      });
      mockTranslationService.translate.mockResolvedValue("Error message");

      const result = await service.joinByCode(mockCode, mockStudent);

      expect(mockClasseRepository.findOne).toHaveBeenCalledWith({
        where: { code: mockCode },
        relations: {
          teachers: true,
          students: true,
        },
      });
      expect(mockClasseRepository.save).toHaveBeenCalledWith({
        ...mockClasse,
        students: [mockStudent],
      });
      expect(result.students).toContain(mockStudent);
    });

    it("should throw an error if user is not a student", async () => {
      mockTranslationService.translate.mockResolvedValue("Only students can join classes");

      await expect(service.joinByCode(mockCode, mockTeacher)).rejects.toThrow(
        new HttpException("Only students can join classes", HttpStatus.FORBIDDEN),
      );

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.ONLY_STUDENTS_CAN_JOIN_CLASSES");
    });

    it("should throw an error if class is not found", async () => {
      mockClasseRepository.findOne.mockResolvedValue(null);
      mockTranslationService.translate.mockResolvedValue("Class not found");

      await expect(service.joinByCode(mockCode, mockStudent)).rejects.toThrow(
        new HttpException("Class not found", HttpStatus.NOT_FOUND),
      );

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.CLASSE_NOT_FOUND");
    });

    it("should throw an error if student is already in the class", async () => {
      const classeWithStudent = {
        ...mockClasse,
        students: [mockStudent],
      };

      mockClasseRepository.findOne.mockResolvedValue(classeWithStudent);
      mockTranslationService.translate.mockResolvedValue("Student already in class");

      await expect(service.joinByCode(mockCode, mockStudent)).rejects.toThrow(
        new HttpException("Student already in class", HttpStatus.CONFLICT),
      );

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.STUDENT_ALREADY_IN_CLASSE");
    });
  });
});
