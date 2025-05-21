import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { uuidRegex } from "@/utils/regex.variable";
import { Question } from "@/question/question.entity";
import { IRequestWithParamQuestion } from "@/question/types/IRequestWithParamQuestion";

@Injectable()
export class QuestionGuard implements CanActivate {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly translationsService: TranslationService,
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

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ["quizz", "choices"],
    });

    if (!question) {
      throw new HttpException(
        await this.translationsService.translate("error.QUESTION_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    request.question = question;

    return true;
  }
}
