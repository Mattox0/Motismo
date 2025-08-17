import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Repository } from "typeorm";

import { ClasseGuard } from "@/classe/guards/classe.guard";
import { Classe } from "@/classe/classe.entity";
import { TranslationService } from "@/translation/translation.service";

describe("ClasseGuard", () => {
  let guard: ClasseGuard;
  let classeRepository: Repository<Classe>;
  let translationService: TranslationService;

  const mockClasseRepository = {
    findOne: jest.fn(),
  };

  const mockTranslationService = {
    translate: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        params: {
          classeId: "550e8400-e29b-41d4-a716-446655440000",
        },
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasseGuard,
        {
          provide: getRepositoryToken(Classe),
          useValue: mockClasseRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    guard = module.get<ClasseGuard>(ClasseGuard);
    classeRepository = module.get<Repository<Classe>>(getRepositoryToken(Classe));
    translationService = module.get<TranslationService>(TranslationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("should return true for valid UUID and existing class", async () => {
      const mockClasse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test Class",
        code: "test-code",
        teachers: [],
        students: [],
      };

      mockClasseRepository.findOne.mockResolvedValue(mockClasse);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockClasseRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: "550e8400-e29b-41d4-a716-446655440000",
        },
        relations: {
          teachers: true,
          students: true,
        },
      });
    });

    it("should throw error for invalid UUID", async () => {
      const invalidExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: {
              classeId: "invalid-uuid",
            },
          }),
        }),
      } as ExecutionContext;

      mockTranslationService.translate.mockResolvedValue("Invalid ID");

      await expect(guard.canActivate(invalidExecutionContext)).rejects.toThrow(
        new HttpException("Invalid ID", HttpStatus.BAD_REQUEST),
      );
    });

    it("should throw error for non-existent class", async () => {
      mockClasseRepository.findOne.mockResolvedValue(null);
      mockTranslationService.translate.mockResolvedValue("Class not found");

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new HttpException("Class not found", HttpStatus.NOT_FOUND),
      );
    });
  });
});
