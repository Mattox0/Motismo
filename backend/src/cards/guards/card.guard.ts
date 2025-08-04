import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { uuidRegex } from "@/utils/regex.variable";
import { Card } from "@/cards/card.entity";
import { IRequestWithParamCard } from "@/cards/types/IRequestWithParamCard";

@Injectable()
export class CardGuard implements CanActivate {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly translationsService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithParamCard>();
    const { cardId } = request.params;

    if (!cardId || !uuidRegex.test(cardId)) {
      throw new HttpException(await this.translationsService.translate("error.ID_INVALID"), HttpStatus.BAD_REQUEST);
    }

    const card = await this.cardRepository.findOne({
      where: {
        id: cardId,
      },
      relations: {
        quizz: true,
      },
    });

    if (!card) {
      throw new HttpException(await this.translationsService.translate("error.CARD_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    request.card = card;

    return true;
  }
}
