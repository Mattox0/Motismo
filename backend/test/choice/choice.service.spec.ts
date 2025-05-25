import { Test, TestingModule } from "@nestjs/testing";

import { ChoiceService } from "@/choice/service/choice.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Choice } from "@/choice/choice.entity";
import { CreateChoiceDto } from "@/choice/dto/createChoice.dto";
import { QuestionType } from "@/question/types/questionType";
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { Quizz } from "@/quizz/quizz.entity";
import { Role } from "@/user/role.enum";
import { IQuizzType } from "@/quizz/types/IQuizzType";

describe("ChoiceService", () => {
  let service: ChoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChoiceService,
        { provide: getRepositoryToken(Choice), useValue: {} },
      ],
    }).compile();

    service = module.get<ChoiceService>(ChoiceService);
  });

  const mockQuizz: Quizz = {
    id: "q1",
    title: "Quizz 1",
    description: "Quizz 1 description",
    author: {
      id: "user-id",
      username: "testuser",
      email: "test@example.com",
      password: "hashed-password",
      creationDate: new Date(),
      role: Role.Customer,
    },
    creationDate: new Date(),
    quizzType: IQuizzType.QUESTIONS,
  };

  const mockQuestion: ChoiceQuestion = {
    id: "q1",
    order: 1,
    quizz: mockQuizz,
    allowMultipleSelections: false,
    choices: [],
    title: "Question 1",
    questionType: QuestionType.MULTIPLE_CHOICES,
    creationDate: new Date(),
  };

  describe("createChoice", () => {
    const createChoiceDto: CreateChoiceDto = {
      text: "Choice 1",
      isCorrect: true,
    };

    const mockChoice: Choice = {
      id: "c1",
      text: "Choice 1",
      isCorrect: true,
      question: mockQuestion,
    };

    it("should create a choice", async () => {
      const choice = await service.createChoice(createChoiceDto, mockQuestion);

      expect(choice).toEqual(mockChoice);
    });
  });
});
