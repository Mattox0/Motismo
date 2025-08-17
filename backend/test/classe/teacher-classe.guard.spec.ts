import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

import { TeacherClasseGuard } from "@/classe/guards/teacher-classe.guard";
import { TranslationService } from "@/translation/translation.service";
import { Classe } from "@/classe/classe.entity";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";

describe("TeacherClasseGuard", () => {
  let guard: TeacherClasseGuard;
  let translationService: TranslationService;

  const mockTranslationService = {
    translate: jest.fn(),
  };

  const mockClasse: Classe = {
    id: "classe-id",
    name: "Test Class",
    code: "test-code",
    teachers: [
      {
        id: "teacher-id",
        username: "teacher",
        email: "teacher@test.com",
        password: "password",
        role: Role.Teacher,
        creationDate: new Date(),
      },
    ],
    students: [],
  };

  const mockTeacher: User = {
    id: "teacher-id",
    username: "teacher",
    email: "teacher@test.com",
    password: "password",
    role: Role.Teacher,
    creationDate: new Date(),
  };

  const mockAdmin: User = {
    id: "admin-id",
    username: "admin",
    email: "admin@test.com",
    password: "password",
    role: Role.Admin,
    creationDate: new Date(),
  };

  const mockStudent: User = {
    id: "student-id",
    username: "student",
    email: "student@test.com",
    password: "password",
    role: Role.Student,
    creationDate: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherClasseGuard,
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    guard = module.get<TeacherClasseGuard>(TeacherClasseGuard);
    translationService = module.get<TranslationService>(TranslationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return true for admin user", async () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            classe: mockClasse,
            user: mockAdmin,
          }),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it("should return true for teacher of the class", async () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            classe: mockClasse,
            user: mockTeacher,
          }),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it("should throw error for student user", async () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            classe: mockClasse,
            user: mockStudent,
          }),
        }),
      } as ExecutionContext;

      mockTranslationService.translate.mockResolvedValue("Not teacher of class");

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new HttpException("Not teacher of class", HttpStatus.FORBIDDEN),
      );
    });

    it("should throw error for teacher not in class", async () => {
      const otherTeacher: User = {
        id: "other-teacher-id",
        username: "other-teacher",
        email: "other-teacher@test.com",
        password: "password",
        role: Role.Teacher,
        creationDate: new Date(),
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            classe: mockClasse,
            user: otherTeacher,
          }),
        }),
      } as ExecutionContext;

      mockTranslationService.translate.mockResolvedValue("Not teacher of class");

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new HttpException("Not teacher of class", HttpStatus.FORBIDDEN),
      );
    });

    it("should throw error when classe is missing", async () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: mockTeacher,
          }),
        }),
      } as ExecutionContext;

      mockTranslationService.translate.mockResolvedValue("Unauthorized");

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED),
      );
    });

    it("should throw error when user is missing", async () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            classe: mockClasse,
          }),
        }),
      } as ExecutionContext;

      mockTranslationService.translate.mockResolvedValue("Unauthorized");

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
