import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "./quizz.entity";
import { QuizzController } from "./controller/quizz.controller";
import { QuizzService } from "./service/quizz.service";
import { UsersModule } from "@/user/user.module";
import { QuestionModule } from "@/question/question.module";
import { ParseFilesPipe } from "@/files/files.validator";
@Module({
  imports: [
    TypeOrmModule.forFeature([Quizz]),
    forwardRef(() => UsersModule),
    forwardRef(() => QuestionModule),
  ],
  controllers: [QuizzController],
  providers: [
    QuizzService,
    TranslationService,
    FileUploadService,
    ParseFilesPipe,
  ],
  exports: [QuizzService],
})
export class QuizzModule {}
