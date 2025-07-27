import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { uuidRegex } from "@/utils/regex.variable";
import { Quizz } from "@/quizz/quizz.entity";
import { IRequestWithParamQuizz } from "@/quizz/types/IRequestWithParamQuizz";

@Injectable()
export class QuizzGuard implements CanActivate {
  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    private readonly translationsService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithParamQuizz>();
    const { quizzId } = request.params;

    if (!quizzId || !uuidRegex.test(quizzId)) {
      throw new HttpException(await this.translationsService.translate("error.ID_INVALID"), HttpStatus.BAD_REQUEST);
    }

    const quizz = await this.quizzRepository
      .createQueryBuilder("quizz")
      .leftJoinAndSelect("quizz.author", "author")
      .leftJoinAndSelect("quizz.questions", "questions")
      .leftJoinAndSelect("questions.choices", "choices")
      .leftJoinAndSelect("quizz.cards", "cards")
      .where("quizz.id = :quizzId", { quizzId })
      .orderBy("questions.order", "ASC")
      .addOrderBy("cards.order", "ASC")
      .getOne();

    if (!quizz) {
      throw new HttpException(await this.translationsService.translate("error.QUIZZ_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    request.quizz = quizz;

    return true;
  }
}
