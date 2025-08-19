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
import { QuizzGuard } from "./guards/quizz.guard";
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { ChoiceModule } from "@/choice/choice.module";
import { CardsModule } from "@/cards/card.module";
import { Card } from "@/cards/card.entity";
import { ClasseModule } from "@/classe/classe.module";
import { Classe } from "@/classe/classe.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quizz, ChoiceQuestion, Card, Classe]),
    forwardRef(() => UsersModule),
    forwardRef(() => QuestionModule),
    forwardRef(() => ChoiceModule),
    forwardRef(() => CardsModule),
    forwardRef(() => ClasseModule),
  ],
  controllers: [QuizzController],
  providers: [QuizzService, TranslationService, FileUploadService, ParseFilesPipe, QuizzGuard],
  exports: [QuizzService, QuizzGuard],
})
export class QuizzModule {}
