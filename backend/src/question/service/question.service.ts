import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";

import { Question } from "@/question/question.entity";
import { ChoiceQuestion } from "../entity/choiceQuestion.entity";
import { CreateChoiceQuestionDto } from "../dto/createChoiceQuestion.dto";
import { Quizz } from "@/quizz/quizz.entity";
import { QuestionType } from "../types/questionType";
import { TranslationService } from "@/translation/translation.service";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(ChoiceQuestion)
    private choiceQuestionRepository: Repository<ChoiceQuestion>,
    private translationService: TranslationService,
  ) {}

  async createChoiceQuestion(
    quizz: Quizz,
    createChoiceQuestionDto: CreateChoiceQuestionDto,
  ): Promise<Question> {
    if (
      createChoiceQuestionDto.questionType !== QuestionType.MULTIPLE_CHOICES &&
      !createChoiceQuestionDto.allowMultipleSelections
    ) {
      throw new BadRequestException(
        await this.translationService.translate("error.INVALID_QUESTION_TYPE"),
      );
    }

    const question = this.choiceQuestionRepository.create({
      ...createChoiceQuestionDto,
      quizz,
      questionType: createChoiceQuestionDto.questionType,
    });

    return this.choiceQuestionRepository.save(question);
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
