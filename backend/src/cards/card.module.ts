import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TranslationService } from "@/translation/translation.service";
import { CardService } from "./service/card.service";
import { CardController } from "./controller/card.controller";
import { Card } from "./card.entity";
import { Quizz } from "@/quizz/quizz.entity";
import { ParseFilesPipe } from "@/files/files.validator";
import { FileUploadModule } from "@/files/files.module";
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { UsersModule } from "@/user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Card, Quizz, ChoiceQuestion]), FileUploadModule, forwardRef(() => UsersModule)],
  controllers: [CardController],
  providers: [CardService, TranslationService, ParseFilesPipe],
  exports: [CardService],
})
export class CardsModule {}
