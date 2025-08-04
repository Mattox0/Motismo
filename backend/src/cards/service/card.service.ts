import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "../card.entity";
import { CreateCardDto } from "../dto/createCard.dto";
import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "@/quizz/quizz.entity";
import { IMaxOrderResult } from "@/cards/types/IMaxOrderResult";
import { UpdateCardDto } from "../dto/updateCard.dto";
import { FileUploadService } from "@/files/files.service";

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly translationService: TranslationService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  getCards(quizzId: string): Promise<Card[]> {
    return this.cardRepository.find({
      where: { quizz: { id: quizzId } },
      order: { order: "ASC" },
    });
  }

  async getCard(quizzId: string, cardId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, quizz: { id: quizzId } },
    });

    if (!card) {
      throw new NotFoundException(await this.translationService.translate("error.CARD_NOT_FOUND"));
    }

    return card;
  }

  private async getMaxOrder(quizzId: string): Promise<number> {
    const result = await this.cardRepository
      .createQueryBuilder("card")
      .select("MAX(card.order)", "maxOrder")
      .where("card.quizz.id = :quizzId", { quizzId })
      .getRawOne<IMaxOrderResult>();

    return result?.maxOrder ?? -1;
  }

  private async reorderCards(quizzId: string, newOrder: number, oldOrder?: number): Promise<void> {
    const queryBuilder = this.cardRepository
      .createQueryBuilder("card")
      .update(Card)
      .set({ order: () => "card.order + 1" })
      .where('"card"."quizzId" = :quizzId', { quizzId });

    if (oldOrder !== undefined) {
      if (newOrder > oldOrder) {
        queryBuilder.andWhere("card.order > :oldOrder AND card.order <= :newOrder", {
          oldOrder,
          newOrder,
        });
      } else {
        queryBuilder.andWhere("card.order >= :newOrder AND card.order < :oldOrder", {
          oldOrder,
          newOrder,
        });
      }
    } else {
      queryBuilder.andWhere("card.order >= :newOrder", { newOrder });
    }

    await queryBuilder.execute();
  }

  async createCard(quizz: Quizz, createCardDto: CreateCardDto): Promise<Card> {
    const maxOrder = await this.getMaxOrder(quizz.id);
    const order = createCardDto.order ?? maxOrder + 1;

    if (order < 0 || order > maxOrder + 1) {
      throw new BadRequestException(await this.translationService.translate("error.INVALID_ORDER_VALUE"));
    }

    if (order <= maxOrder) {
      await this.reorderCards(quizz.id, order);
    }

    const card = this.cardRepository.create({
      ...createCardDto,
      quizz,
      order,
    });

    return this.cardRepository.save(card);
  }

  private async deleteUnusedImages(card: Card, updateCardDto: UpdateCardDto): Promise<void> {
    if (updateCardDto.rectoImage && card.rectoImage && updateCardDto.rectoImage !== card.rectoImage) {
      await this.fileUploadService.deleteFile(card.rectoImage);
    }
    if (updateCardDto.versoImage && card.versoImage && updateCardDto.versoImage !== card.versoImage) {
      await this.fileUploadService.deleteFile(card.versoImage);
    }
  }

  async updateCard(quizz: Quizz, card: Card, updateCardDto: UpdateCardDto): Promise<Card> {
    const maxOrder = await this.getMaxOrder(quizz.id);

    if (updateCardDto.order !== undefined) {
      if (updateCardDto.order < 0 || updateCardDto.order > maxOrder) {
        throw new BadRequestException(await this.translationService.translate("error.INVALID_ORDER_VALUE"));
      }

      await this.reorderCards(quizz.id, updateCardDto.order, card.order);
    }

    if (updateCardDto.rectoImage) {
      updateCardDto.rectoText = "";
    }
    if (updateCardDto.versoImage) {
      updateCardDto.versoText = "";
    }

    await this.deleteUnusedImages(card, updateCardDto);

    await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set(updateCardDto)
      .where("id = :cardId AND quizz.id = :quizzId", {
        cardId: card.id,
        quizzId: quizz.id,
      })
      .execute();

    return this.getCard(quizz.id, card.id);
  }

  async delete(quizz: Quizz, card: Card): Promise<void> {
    if (card.rectoImage) {
      await this.fileUploadService.deleteFile(card.rectoImage);
    }
    if (card.versoImage) {
      await this.fileUploadService.deleteFile(card.versoImage);
    }

    await this.reorderCards(quizz.id, card.order);

    await this.cardRepository.delete(card.id);
  }
}
