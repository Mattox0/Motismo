import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { uuidRegex } from "@/utils/regex.variable";
import { Question } from "@/question/question.entity";
import { MatchingQuestion } from "../entity/matchingQuestion.entity";
import { IRequestWithParamQuestion } from "@/question/types/IRequestWithParamQuestion";
import { QuestionType } from "../types/questionType";
import { ChoiceQuestion } from "../entity/choiceQuestion.entity";
import { WordCloudQuestion } from "../entity/wordCloudQuestion.entity";
import { AllQuestion } from "../types/AllQuestion";

@Injectable()
export class QuestionGuard implements CanActivate {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly translationsService: TranslationService,
    @InjectRepository(ChoiceQuestion)
    private readonly choiceQuestionRepository: Repository<ChoiceQuestion>,
    @InjectRepository(MatchingQuestion)
    private readonly matchingQuestionRepository: Repository<MatchingQuestion>,
    @InjectRepository(WordCloudQuestion)
    private readonly wordCloudQuestionRepository: Repository<WordCloudQuestion>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<IRequestWithParamQuestion>();
    const { questionId } = request.params;

    if (!questionId || !uuidRegex.test(questionId)) {
      throw new HttpException(
        await this.translationsService.translate("error.ID_INVALID"),
        HttpStatus.BAD_REQUEST,
      );
    }

    const question = await this.findQuestionWithDetails(questionId);

    if (!question) {
      throw new HttpException(
        await this.translationsService.translate("error.QUESTION_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    request.question = question;

    return true;
  }

  async findQuestionWithDetails(
    questionId: string,
  ): Promise<AllQuestion | null> {
    const baseQuestion = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: { quizz: true },
    });

    if (!baseQuestion) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    switch (baseQuestion.questionType) {
      case QuestionType.UNIQUE_CHOICES:
      case QuestionType.MULTIPLE_CHOICES:
      case QuestionType.BOOLEAN_CHOICES:
        return this.choiceQuestionRepository.findOne({
          where: { id: questionId },
          relations: { quizz: true, choices: true },
        });
      case QuestionType.MATCHING:
        return this.matchingQuestionRepository.findOne({
          where: { id: questionId },
          relations: { quizz: true },
        });
      case QuestionType.WORD_CLOUD:
        return this.wordCloudQuestionRepository.findOne({
          where: { id: questionId },
          relations: { quizz: true },
        });
      default:
        return baseQuestion;
    }
  }
}
