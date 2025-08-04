import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";

import { Question } from "@/question/question.entity";
import { ChoiceQuestion } from "../entity/choiceQuestion.entity";
import { CreateChoiceQuestionDto } from "../dto/createChoiceQuestion.dto";
import { CreateQuestionDto } from "../dto/createQuestion.dto";
import { Quizz } from "@/quizz/quizz.entity";
import { TranslationService } from "@/translation/translation.service";
import { ChoiceService } from "@/choice/service/choice.service";
import { AllQuestion } from "../types/AllQuestion";
import { FileUploadService } from "@/files/files.service";
import { UpdateChoiceQuestionDto, UpdateQuestionDto } from "../dto/updateQuestion.dto";
import { QuestionType } from "../types/questionType";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(ChoiceQuestion)
    private choiceQuestionRepository: Repository<ChoiceQuestion>,
    private translationService: TranslationService,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
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
    const questions = await this.questionRepository.find({
      where: { quizz: { id: quizzId } },
      order: { order: "ASC" },
    });

    return questions.length;
  }

  private async normalizeOrders(quizzId: string): Promise<void> {
    const questions = await this.questionRepository.find({
      where: { quizz: { id: quizzId } },
      order: { order: "ASC" },
    });

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (question.order !== i + 1) {
        await this.questionRepository.update(question.id, { order: i + 1 });
      }
    }
  }

  private async reorderQuestions(quizzId: string, newOrder: number, oldOrder?: number): Promise<void> {
    const questions = await this.questionRepository.find({
      where: { quizz: { id: quizzId } },
      order: { order: "ASC" },
    });

    if (oldOrder) {
      if (newOrder > oldOrder) {
        for (const question of questions) {
          if (question.order > oldOrder && question.order <= newOrder) {
            await this.questionRepository.update(question.id, { order: question.order - 1 });
          }
        }
      } else {
        for (const question of questions) {
          if (question.order >= newOrder && question.order < oldOrder) {
            await this.questionRepository.update(question.id, { order: question.order + 1 });
          }
        }
      }
    } else {
      for (const question of questions) {
        if (question.order >= newOrder) {
          await this.questionRepository.update(question.id, { order: question.order + 1 });
        }
      }
    }

    await this.normalizeOrders(quizzId);
  }

  async createQuestion(quizz: Quizz, createQuestionDto: CreateQuestionDto): Promise<void> {
    const { questionType, choices, ...questionData } = createQuestionDto;

    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICES:
      case QuestionType.UNIQUE_CHOICES:
      case QuestionType.BOOLEAN_CHOICES: {
        if (!choices || choices.length === 0) {
          throw new BadRequestException(
            await this.translationService.translate("error.CHOICES_REQUIRED_FOR_CHOICE_QUESTIONS"),
          );
        }
        const choiceQuestionDto: CreateChoiceQuestionDto = {
          ...questionData,
          questionType,
          choices,
        };

        return this.createChoiceQuestion(quizz, choiceQuestionDto);
      }

      case QuestionType.WORD_CLOUD:
      case QuestionType.MATCHING: {
        const maxOrder = await this.getMaxOrder(quizz.id);
        const order = createQuestionDto.order ?? maxOrder + 1;

        if (order < 1 || order > maxOrder + 1) {
          throw new BadRequestException(await this.translationService.translate("error.INVALID_ORDER_VALUE"));
        }

        if (order <= maxOrder) {
          await this.reorderQuestions(quizz.id, order);
        }

        const question = this.questionRepository.create({
          ...questionData,
          quizz,
          questionType,
          order,
        });

        await this.questionRepository.save(question);
        await this.normalizeOrders(quizz.id);
        break;
      }

      default:
        throw new BadRequestException(await this.translationService.translate("error.UNSUPPORTED_QUESTION_TYPE"));
    }
  }

  async updateQuestion(quizz: Quizz, question: AllQuestion, updateQuestionDto: UpdateQuestionDto): Promise<void> {
    const { questionType, choices, ...updateData } = updateQuestionDto;

    if (questionType && questionType !== question.questionType) {
      (updateData as any).questionType = questionType;
    }

    switch (question.questionType) {
      case QuestionType.MULTIPLE_CHOICES:
      case QuestionType.UNIQUE_CHOICES:
      case QuestionType.BOOLEAN_CHOICES:
        if (question instanceof ChoiceQuestion) {
          const choiceUpdateDto: UpdateChoiceQuestionDto = {
            ...updateData,
            questionType: questionType || question.questionType,
            choices,
          };

          return this.updateChoiceQuestion(quizz, question, choiceUpdateDto);
        }
        break;

      case QuestionType.WORD_CLOUD:
      case QuestionType.MATCHING: {
        const maxOrder = await this.getMaxOrder(quizz.id);

        if (updateQuestionDto.order !== undefined) {
          if (updateQuestionDto.order < 1 || updateQuestionDto.order > maxOrder) {
            throw new BadRequestException(await this.translationService.translate("error.INVALID_ORDER_VALUE"));
          }

          if (updateQuestionDto.order !== question.order) {
            await this.reorderQuestions(quizz.id, updateQuestionDto.order, question.order);
          }
        }

        await this.deleteUnusedImages(question, updateQuestionDto);
        await this.questionRepository.update(question.id, updateData);
        await this.normalizeOrders(quizz.id);
        break;
      }

      default:
        throw new BadRequestException(await this.translationService.translate("error.UNSUPPORTED_QUESTION_TYPE"));
    }
  }

  async createChoiceQuestion(quizz: Quizz, createChoiceQuestionDto: CreateChoiceQuestionDto): Promise<void> {
    const maxOrder = await this.getMaxOrder(quizz.id);
    const order = createChoiceQuestionDto.order ?? maxOrder + 1;

    if (order < 1 || order > maxOrder + 1) {
      throw new BadRequestException(await this.translationService.translate("error.INVALID_ORDER_VALUE"));
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

    for (const option of createChoiceQuestionDto.choices) {
      await this.choiceService.createChoice(option, savedQuestion);
    }

    await this.normalizeOrders(quizz.id);
  }

  async updateChoiceQuestion(
    quizz: Quizz,
    question: ChoiceQuestion,
    updateChoiceQuestionDto: UpdateChoiceQuestionDto,
  ): Promise<void> {
    const maxOrder = await this.getMaxOrder(quizz.id);

    if (updateChoiceQuestionDto.order !== undefined) {
      if (updateChoiceQuestionDto.order < 1 || updateChoiceQuestionDto.order > maxOrder) {
        throw new BadRequestException(await this.translationService.translate("error.INVALID_ORDER_VALUE"));
      }

      if (updateChoiceQuestionDto.order !== question.order) {
        await this.reorderQuestions(quizz.id, updateChoiceQuestionDto.order, question.order);
      }
    }

    await this.deleteUnusedImages(question, updateChoiceQuestionDto);

    const { choices, ...updateData } = updateChoiceQuestionDto;

    await this.choiceQuestionRepository.update(question.id, updateData);

    if (choices) {
      await this.choiceService.updateChoices(question, choices);
    }

    await this.normalizeOrders(quizz.id);
  }

  async deleteQuestion(question: AllQuestion): Promise<void> {
    if (question.image) {
      await this.fileUploadService.deleteFile(question.image);
    }

    await this.questionRepository.delete(question.id);

    await this.normalizeOrders(question.quizz.id);
  }

  private async deleteUnusedImages(
    question: AllQuestion,
    updateChoiceQuestionDto: UpdateChoiceQuestionDto,
  ): Promise<void> {
    if (updateChoiceQuestionDto.image && question.image && updateChoiceQuestionDto.image !== question.image) {
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
