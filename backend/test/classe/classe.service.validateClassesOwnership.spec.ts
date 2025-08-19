import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

import { ClasseService } from '@/classe/service/classe.service';
import { Classe } from '@/classe/classe.entity';
import { User } from '@/user/user.entity';
import { Role } from '@/user/role.enum';
import { TranslationService } from '@/translation/translation.service';

describe('ClasseService - validateClassesOwnership', () => {
  let service: ClasseService;
  let classeRepository: Repository<Classe>;
  let userRepository: Repository<User>;
  let translationService: TranslationService;

  const mockClasseRepository = {
    find: jest.fn(),
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

  describe('validateClassesOwnership', () => {
    const teacherId = 'teacher-id';
    const otherTeacherId = 'other-teacher-id';

    const mockTeacher: User = {
      id: teacherId,
      username: 'testteacher',
      email: 'teacher@test.com',
      password: 'password',
      role: Role.Teacher,
      creationDate: new Date(),
      studentClasses: [],
      teacherClasses: [],
    } as User;

    const mockOtherTeacher: User = {
      id: otherTeacherId,
      username: 'otherteacher',
      email: 'other@test.com',
      password: 'password',
      role: Role.Teacher,
      creationDate: new Date(),
      studentClasses: [],
      teacherClasses: [],
    } as User;

    const mockOwnedClass: Classe = {
      id: 'owned-class-id',
      name: 'Owned Class',
      code: 'OWNED123',
      students: [],
      teachers: [mockTeacher],
      quizz: [],
    } as Classe;

    const mockUnauthorizedClass: Classe = {
      id: 'unauthorized-class-id',
      name: 'Unauthorized Class',
      code: 'UNAUTH123',
      students: [],
      teachers: [mockOtherTeacher],
      quizz: [],
    } as Classe;

    it('should return empty array when no classIds provided', async () => {
      const result = await service.validateClassesOwnership([], teacherId);

      expect(result).toEqual([]);
      expect(mockClasseRepository.find).not.toHaveBeenCalled();
    });

    it('should return classes when teacher owns all classes', async () => {
      mockClasseRepository.find.mockResolvedValue([mockOwnedClass]);
      mockTranslationService.translate.mockResolvedValue('Error message');

      const result = await service.validateClassesOwnership(['owned-class-id'], teacherId);

      expect(result).toEqual([mockOwnedClass]);
      expect(mockClasseRepository.find).toHaveBeenCalledWith({
        where: [{ id: 'owned-class-id' }],
        relations: {
          teachers: true,
          students: true,
        },
      });
    });

    it('should throw error when teacher does not own some classes', async () => {
      mockClasseRepository.find.mockResolvedValue([mockOwnedClass, mockUnauthorizedClass]);
      mockTranslationService.translate.mockResolvedValue('Classes not owned by teacher');

      await expect(service.validateClassesOwnership(['owned-class-id', 'unauthorized-class-id'], teacherId)).rejects.toThrow(
        new HttpException('Classes not owned by teacher', HttpStatus.FORBIDDEN)
      );

      expect(mockTranslationService.translate).toHaveBeenCalledWith('error.CLASSES_NOT_OWNED_BY_TEACHER');
    });

    it('should throw error when teacher does not own any of the classes', async () => {
      mockClasseRepository.find.mockResolvedValue([mockUnauthorizedClass]);
      mockTranslationService.translate.mockResolvedValue('Classes not owned by teacher');

      await expect(service.validateClassesOwnership(['unauthorized-class-id'], teacherId)).rejects.toThrow(
        new HttpException('Classes not owned by teacher', HttpStatus.FORBIDDEN)
      );

      expect(mockTranslationService.translate).toHaveBeenCalledWith('error.CLASSES_NOT_OWNED_BY_TEACHER');
    });

    it('should handle multiple teachers in a class correctly', async () => {
      const classWithMultipleTeachers: Classe = {
        id: 'multi-teacher-class-id',
        name: 'Multi Teacher Class',
        code: 'MULTI123',
        students: [],
        teachers: [mockTeacher, mockOtherTeacher],
        quizz: [],
      } as Classe;

      mockClasseRepository.find.mockResolvedValue([classWithMultipleTeachers]);
      mockTranslationService.translate.mockResolvedValue('Error message');

      const result = await service.validateClassesOwnership(['multi-teacher-class-id'], teacherId);

      expect(result).toEqual([classWithMultipleTeachers]);
    });
  });
});
