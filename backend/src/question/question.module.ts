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
import { QuizzModule } from "@/quizz/quizz.module";
import { UsersModule } from "@/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      ChoiceQuestion,
      WordCloudQuestion,
      MatchingQuestion,
    ]),
    forwardRef(() => QuizzModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [QuestionController],
  providers: [QuestionService, TranslationService, FileUploadService],
  exports: [QuestionService, TypeOrmModule],
})
export class QuestionModule {}
