import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { Question } from "@/question/question.entity";
import { QuestionController } from "@/question/controller/question.controller";
import { QuestionService } from "./service/question.service";
import { ChoiceQuestion } from "./entity/choiceQuestion.entity";
import { WordCloudQuestion } from "./entity/wordCloudQuestion.entity";
import { MatchingQuestion } from "./entity/matchingQuestion.entity";
import { UsersModule } from "@/user/user.module";
import { Quizz } from "@/quizz/quizz.entity";
import { Choice } from "@/choice/choice.entity";
import { ChoiceModule } from "@/choice/choice.module";
import { Card } from "@/cards/card.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, ChoiceQuestion, WordCloudQuestion, MatchingQuestion, Quizz, Choice, Card]),
    forwardRef(() => UsersModule),
    forwardRef(() => ChoiceModule),
  ],
  controllers: [QuestionController],
  providers: [QuestionService, TranslationService, FileUploadService],
  exports: [QuestionService, TypeOrmModule],
})
export class QuestionModule {}
