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
import { Quizz } from "@/quizz/quizz.entity";
import { IRequestWithParamQuizz } from "@/quizz/types/IRequestWithParamQuizz";
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { Card } from "@/cards/card.entity";

@Injectable()
export class QuizzGuard implements CanActivate {
  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @InjectRepository(ChoiceQuestion)
    private readonly choiceQuestionRepository: Repository<ChoiceQuestion>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly translationsService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithParamQuizz>();
    const { quizzId } = request.params;

    if (!quizzId || !uuidRegex.test(quizzId)) {
      throw new HttpException(
        await this.translationsService.translate("error.ID_INVALID"),
        HttpStatus.BAD_REQUEST,
      );
    }

    const quizz = await this.quizzRepository.findOne({
      where: {
        id: quizzId,
      },
      relations: {
        author: true,
        questions: true,
        cards: true,
      },
    });

    if (!quizz) {
      throw new HttpException(
        await this.translationsService.translate("error.QUIZZ_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    const questions = await this.choiceQuestionRepository.find({
      where: { quizz: { id: quizzId } },
      relations: ["choices"],
      order: { order: "ASC" },
    });

    const cards = await this.cardRepository.find({
      where: { quizz: { id: quizzId } },
      order: { order: "ASC" },
    });

    quizz.questions = questions;
    quizz.cards = cards;

    request.quizz = quizz;

    return true;
  }
}
