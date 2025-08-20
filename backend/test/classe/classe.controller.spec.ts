import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ClasseController } from "@/classe/controller/classe.controller";
import { ClasseService } from "@/classe/service/classe.service";
import { TranslationService } from "@/translation/translation.service";
import { Classe } from "@/classe/classe.entity";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { UserAuthGuard } from "@/auth/guards/user-auth.guard";

describe("ClasseController", () => {
  let controller: ClasseController;
  let classeService: ClasseService;
  let translationService: TranslationService;

  const mockClasse: Classe = {
    id: "1",
    name: "Test Class",
    code: "ABC123",
    students: [],
    teachers: [],
    quizz: [],
  };

  const mockUser: User = {
    id: "1",
    username: "johndoe",
    email: "test@example.com",
    password: "password",
    role: Role.Teacher,
    creationDate: new Date(),
    studentClasses: [],
    teacherClasses: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasseController],
      providers: [
        {
          provide: ClasseService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByCode: jest.fn(),
            findOne: jest.fn(),
            findByTeacher: jest.fn(),
            findByStudent: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            addStudent: jest.fn(),
            removeStudent: jest.fn(),
            addTeacher: jest.fn(),
            removeTeacher: jest.fn(),
          },
        },
        {
          provide: TranslationService,
          useValue: {
            translate: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Classe),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClasseController>(ClasseController);
    classeService = module.get<ClasseService>(ClasseService);
    translationService = module.get<TranslationService>(TranslationService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
