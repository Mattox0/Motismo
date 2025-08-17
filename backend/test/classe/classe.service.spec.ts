import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";

import { ClasseService } from "@/classe/service/classe.service";
import { Classe } from "@/classe/classe.entity";
import { User } from "@/user/user.entity";
import { TranslationService } from "@/translation/translation.service";
import { CreateClasseDto } from "@/classe/dto/createClasse.dto";
import { UpdateClasseDto } from "@/classe/dto/updateClasse.dto";
import { Role } from "@/user/role.enum";

describe("ClasseService", () => {
  let service: ClasseService;
  let classeRepository: Repository<Classe>;
  let userRepository: Repository<User>;
  let translationService: TranslationService;

  const mockClasseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    const createClasseDto: CreateClasseDto = {
      name: "Test Class",
    };

    const teacher: User = {
      id: "teacher-id",
      username: "teacher",
      email: "teacher@test.com",
      password: "password",
      role: Role.Teacher,
      creationDate: new Date(),
    };

    it("should create a class successfully", async () => {
      const expectedClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [teacher],
        students: [],
      };

      mockClasseRepository.create.mockReturnValue(expectedClasse);
      mockClasseRepository.save.mockResolvedValue(expectedClasse);

      const result = await service.create(createClasseDto, teacher);

      expect(result).toEqual(expectedClasse);
      expect(mockClasseRepository.create).toHaveBeenCalledWith({
        ...createClasseDto,
        code: expect.any(String),
        teachers: [teacher],
      });
      expect(mockClasseRepository.save).toHaveBeenCalledWith(expectedClasse);
    });

    it("should throw error if teacher is not a teacher", async () => {
      const student: User = {
        id: "student-id",
        username: "student",
        email: "student@test.com",
        password: "password",
        role: Role.Student,
        creationDate: new Date(),
      };

      mockTranslationService.translate.mockResolvedValue("Only teachers can create classes");

      await expect(service.create(createClasseDto, student)).rejects.toThrow(
        new HttpException("Only teachers can create classes", HttpStatus.FORBIDDEN),
      );
    });
  });

  describe("findAll", () => {
    it("should return all classes", async () => {
      const expectedClasses = [
        { id: "1", name: "Class 1", code: "code1", teachers: [], students: [] },
        { id: "2", name: "Class 2", code: "code2", teachers: [], students: [] },
      ];

      mockClasseRepository.find.mockResolvedValue(expectedClasses);

      const result = await service.findAll();

      expect(result).toEqual(expectedClasses);
      expect(mockClasseRepository.find).toHaveBeenCalledWith({
        relations: {
          teachers: true,
          students: true,
        },
      });
    });
  });

  describe("findOne", () => {
    it("should return a class by id", async () => {
      const expectedClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      mockClasseRepository.findOne.mockResolvedValue(expectedClasse);

      const result = await service.findOne("classe-id");

      expect(result).toEqual(expectedClasse);
      expect(mockClasseRepository.findOne).toHaveBeenCalledWith({
        where: { id: "classe-id" },
        relations: {
          teachers: true,
          students: true,
        },
      });
    });

    it("should throw error if class not found", async () => {
      mockClasseRepository.findOne.mockResolvedValue(null);
      mockTranslationService.translate.mockResolvedValue("Class not found");

      await expect(service.findOne("non-existent-id")).rejects.toThrow(
        new HttpException("Class not found", HttpStatus.NOT_FOUND),
      );
    });
  });

  describe("findByTeacher", () => {
    it("should return classes by teacher id", async () => {
      const expectedClasses = [
        { id: "1", name: "Class 1", code: "code1", teachers: [], students: [] },
      ];

      mockClasseRepository.find.mockResolvedValue(expectedClasses);

      const result = await service.findByTeacher("teacher-id");

      expect(result).toEqual(expectedClasses);
      expect(mockClasseRepository.find).toHaveBeenCalledWith({
        where: {
          teachers: { id: "teacher-id" },
        },
        relations: {
          teachers: true,
          students: true,
        },
      });
    });
  });

  describe("findByStudent", () => {
    it("should return classes by student id", async () => {
      const expectedClasses = [
        { id: "1", name: "Class 1", code: "code1", teachers: [], students: [] },
      ];

      mockClasseRepository.find.mockResolvedValue(expectedClasses);

      const result = await service.findByStudent("student-id");

      expect(result).toEqual(expectedClasses);
      expect(mockClasseRepository.find).toHaveBeenCalledWith({
        where: {
          students: { id: "student-id" },
        },
        relations: {
          teachers: true,
          students: true,
        },
      });
    });
  });

  describe("update", () => {
    it("should update a class successfully", async () => {
      const updateClasseDto: UpdateClasseDto = {
        name: "Updated Class",
      };

      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      const updatedClasse = {
        ...existingClasse,
        name: "Updated Class",
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockClasseRepository.save.mockResolvedValue(updatedClasse);

      const result = await service.update("classe-id", updateClasseDto);

      expect(result).toEqual(updatedClasse);
      expect(mockClasseRepository.save).toHaveBeenCalledWith(updatedClasse);
    });
  });

  describe("remove", () => {
    it("should remove a class successfully", async () => {
      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockClasseRepository.remove.mockResolvedValue(undefined);

      await service.remove("classe-id");

      expect(mockClasseRepository.remove).toHaveBeenCalledWith(existingClasse);
    });
  });

  describe("addStudent", () => {
    it("should add a student to a class successfully", async () => {
      const student: User = {
        id: "student-id",
        username: "student",
        email: "student@test.com",
        password: "password",
        role: Role.Student,
        creationDate: new Date(),
      };

      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      const updatedClasse = {
        ...existingClasse,
        students: [student],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockUserRepository.findOne.mockResolvedValue(student);
      mockClasseRepository.save.mockResolvedValue(updatedClasse);

      const result = await service.addStudent("classe-id", "student-id");

      expect(result).toEqual(updatedClasse);
      expect(mockClasseRepository.save).toHaveBeenCalledWith(updatedClasse);
    });

    it("should throw error if student not found", async () => {
      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockTranslationService.translate.mockResolvedValue("User not found");

      await expect(service.addStudent("classe-id", "non-existent-student")).rejects.toThrow(
        new HttpException("User not found", HttpStatus.NOT_FOUND),
      );
    });

    it("should throw error if user is not a student", async () => {
      const teacher: User = {
        id: "teacher-id",
        username: "teacher",
        email: "teacher@test.com",
        password: "password",
        role: Role.Teacher,
        creationDate: new Date(),
      };

      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockUserRepository.findOne.mockResolvedValue(teacher);
      mockTranslationService.translate.mockResolvedValue("Only students can be added");

      await expect(service.addStudent("classe-id", "teacher-id")).rejects.toThrow(
        new HttpException("Only students can be added", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw error if student already in class", async () => {
      const student: User = {
        id: "student-id",
        username: "student",
        email: "student@test.com",
        password: "password",
        role: Role.Student,
        creationDate: new Date(),
      };

      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [student],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockUserRepository.findOne.mockResolvedValue(student);
      mockTranslationService.translate.mockResolvedValue("Student already in class");

      await expect(service.addStudent("classe-id", "student-id")).rejects.toThrow(
        new HttpException("Student already in class", HttpStatus.CONFLICT),
      );
    });
  });

  describe("removeStudent", () => {
    it("should remove a student from a class successfully", async () => {
      const student: User = {
        id: "student-id",
        username: "student",
        email: "student@test.com",
        password: "password",
        role: Role.Student,
        creationDate: new Date(),
      };

      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [student],
      };

      const updatedClasse = {
        ...existingClasse,
        students: [],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockClasseRepository.save.mockResolvedValue(updatedClasse);

      const result = await service.removeStudent("classe-id", "student-id");

      expect(result).toEqual(updatedClasse);
      expect(mockClasseRepository.save).toHaveBeenCalledWith(updatedClasse);
    });
  });

  describe("addTeacher", () => {
    it("should add a teacher to a class successfully", async () => {
      const teacher: User = {
        id: "teacher-id",
        username: "teacher",
        email: "teacher@test.com",
        password: "password",
        role: Role.Teacher,
        creationDate: new Date(),
      };

      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      const updatedClasse = {
        ...existingClasse,
        teachers: [teacher],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockUserRepository.findOne.mockResolvedValue(teacher);
      mockClasseRepository.save.mockResolvedValue(updatedClasse);

      const result = await service.addTeacher("classe-id", "teacher-id");

      expect(result).toEqual(updatedClasse);
      expect(mockClasseRepository.save).toHaveBeenCalledWith(updatedClasse);
    });
  });

  describe("removeTeacher", () => {
    it("should remove a teacher from a class successfully", async () => {
      const teacher: User = {
        id: "teacher-id",
        username: "teacher",
        email: "teacher@test.com",
        password: "password",
        role: Role.Teacher,
        creationDate: new Date(),
      };

      const existingClasse = {
        id: "classe-id",
        name: "Test Class",
        code: "test-code",
        teachers: [teacher],
        students: [],
      };

      const updatedClasse = {
        ...existingClasse,
        teachers: [],
      };

      mockClasseRepository.findOne.mockResolvedValue(existingClasse);
      mockClasseRepository.save.mockResolvedValue(updatedClasse);

      const result = await service.removeTeacher("classe-id", "teacher-id");

      expect(result).toEqual(updatedClasse);
      expect(mockClasseRepository.save).toHaveBeenCalledWith(updatedClasse);
    });
  });
});
