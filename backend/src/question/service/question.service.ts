import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";

import { Question } from "@/question/question.entity";
import { ChoiceQuestion } from "../entity/choiceQuestion.entity";
import { CreateChoiceQuestionDto } from "../dto/createChoiceQuestion.dto";
import { Quizz } from "@/quizz/quizz.entity";
import { QuestionType } from "../types/questionType";
import { TranslationService } from "@/translation/translation.service";
import { ChoiceService } from "@/choice/service/choice.service";
import { IMaxOrderResult } from "@/cards/types/IMaxOrderResult";
import { AllQuestion } from "../types/AllQuestion";
import { MatchingQuestion } from "../entity/matchingQuestion.entity";
import { WordCloudQuestion } from "../entity/wordCloudQuestion.entity";
import { FileUploadService } from "@/files/files.service";
import { UpdateChoiceQuestionDto } from "../dto/updateQuestion.dto";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(ChoiceQuestion)
    private choiceQuestionRepository: Repository<ChoiceQuestion>,
    private translationService: TranslationService,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(MatchingQuestion)
    private matchingQuestionRepository: Repository<MatchingQuestion>,
    @InjectRepository(WordCloudQuestion)
    private wordCloudQuestionRepository: Repository<WordCloudQuestion>,
    private choiceService: ChoiceService,
    private fileUploadService: FileUploadService,
  ) {}

  async getQuestions(quizz: Quizz): Promise<AllQuestion[]> {
    return await this.questionRepository.find({
      where: { quizz: { id: quizz.id } },
      order: { order: "ASC" },
      relations: ["choices", "quizz"],
    });
  }

  private async getMaxOrder(quizzId: string): Promise<number> {
    const result = await this.questionRepository
      .createQueryBuilder("question")
      .select("MAX(question.order)", "maxOrder")
      .where("question.quizz.id = :quizzId", { quizzId })
      .getRawOne<IMaxOrderResult>();

    return result?.maxOrder ?? -1;
  }

  private async reorderQuestions(
    quizzId: string,
    newOrder: number,
    oldOrder?: number,
  ): Promise<void> {
    const queryBuilder = this.questionRepository
      .createQueryBuilder("question")
      .update(Question)
      .set({ order: () => "question.order + 1" })
      .where('"question"."quizzId" = :quizzId', { quizzId });

    if (oldOrder !== undefined) {
      if (newOrder > oldOrder) {
        queryBuilder.andWhere(
          "question.order > :oldOrder AND question.order <= :newOrder",
          {
            oldOrder,
            newOrder,
          },
        );
      } else {
        queryBuilder.andWhere(
          "question.order >= :newOrder AND question.order < :oldOrder",
          {
            oldOrder,
            newOrder,
          },
        );
      }
    } else {
      queryBuilder.andWhere("question.order >= :newOrder", { newOrder });
    }

    await queryBuilder.execute();
  }

  async createChoiceQuestion(
    quizz: Quizz,
    createChoiceQuestionDto: CreateChoiceQuestionDto,
  ): Promise<void> {
    if (
      createChoiceQuestionDto.questionType === QuestionType.MULTIPLE_CHOICES &&
      !createChoiceQuestionDto.allowMultipleSelections
    ) {
      throw new BadRequestException(
        await this.translationService.translate("error.INVALID_QUESTION_TYPE"),
      );
    }

    const maxOrder = await this.getMaxOrder(quizz.id);
    const order = createChoiceQuestionDto.order ?? maxOrder + 1;

    if (order < 0 || order > maxOrder + 1) {
      throw new BadRequestException(
        await this.translationService.translate("error.INVALID_ORDER_VALUE"),
      );
    }

    if (order <= maxOrder) {
      await this.reorderQuestions(quizz.id, order);
    }

    const question = this.choiceQuestionRepository.create({
      ...createChoiceQuestionDto,
      quizz,
      questionType: createChoiceQuestionDto.questionType,
      order,
    });

    const savedQuestion = await this.choiceQuestionRepository.save(question);

    for (const option of createChoiceQuestionDto.options) {
      await this.choiceService.createChoice(option, savedQuestion);
    }
  }

  async updateChoiceQuestion(
    quizz: Quizz,
    question: ChoiceQuestion,
    updateChoiceQuestionDto: UpdateChoiceQuestionDto,
  ): Promise<void> {
    const maxOrder = await this.getMaxOrder(quizz.id);

    if (updateChoiceQuestionDto.order !== undefined) {
      if (
        updateChoiceQuestionDto.order < 0 ||
        updateChoiceQuestionDto.order > maxOrder
      ) {
        throw new BadRequestException(
          await this.translationService.translate("error.INVALID_ORDER_VALUE"),
        );
      }

      await this.reorderQuestions(
        quizz.id,
        updateChoiceQuestionDto.order,
        question.order,
      );
    }

    await this.deleteUnusedImages(question, updateChoiceQuestionDto);

    await this.choiceQuestionRepository.update(
      question.id,
      updateChoiceQuestionDto,
    );

    if (updateChoiceQuestionDto.options) {
      await this.choiceService.updateChoices(
        question,
        updateChoiceQuestionDto.options,
      );
    }
  }

  async deleteQuestion(question: AllQuestion): Promise<void> {
    if (question.image) {
      await this.fileUploadService.deleteFile(question.image);
    }
    await this.questionRepository.delete(question.id);
  }

  private async deleteUnusedImages(
    question: AllQuestion,
    updateChoiceQuestionDto: UpdateChoiceQuestionDto,
  ): Promise<void> {
    if (
      updateChoiceQuestionDto.image &&
      question.image &&
      updateChoiceQuestionDto.image !== question.image
    ) {
      await this.fileUploadService.deleteFile(question.image);
    }
  }

  // async createMatchingQuestion(
  //   createMatchingQuestionDto: CreateMatchingQuestionDto,
  // ): Promise<Question> {
  //   const quizz = await this.quizzService.findOne(
  //     createMatchingQuestionDto.quizzId,
  //   );

  //   if (!quizz) {
  //     throw new NotFoundException(
  //       await this.translationService.translate("error.QUIZZ_NOT_FOUND"),
  //     );
  //   }

  //   const question = this.matchingQuestionRepository.create({
  //     ...createMatchingQuestionDto,
  //     quizz,
  //   });

  //   return this.matchingQuestionRepository.save(question);
  // }

  // async createWordCloudQuestion(
  //   createWordCloudQuestionDto: CreateWordCloudQuestionDto,
  // ): Promise<Question> {
  //   const quizz = await this.quizzService.findOne(
  //     createWordCloudQuestionDto.quizzId,
  //   );

  //   if (!quizz) {
  //     throw new NotFoundException(
  //       await this.translationService.translate("error.QUIZZ_NOT_FOUND"),
  //     );
  //   }

  //   const question = this.wordCloudQuestionRepository.create({
  //     ...createWordCloudQuestionDto,
  //     quizz,
  //   });

  //   return this.wordCloudQuestionRepository.save(question);
  // }
}
