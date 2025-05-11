import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TranslationService } from "@/translation/translation.service";
import { CardService } from "./service/card.service";
import { CardController } from "./controller/card.controller";
import { Card } from "./card.entity";
import { Quizz } from "@/quizz/quizz.entity";
import { ParseFilesPipe } from "@/files/files.validator";
import { FileUploadModule } from "@/files/files.module";

@Module({
  imports: [TypeOrmModule.forFeature([Card, Quizz]), FileUploadModule],
  controllers: [CardController],
  providers: [CardService, TranslationService, ParseFilesPipe],
  exports: [CardService],
})
export class CardModule {}
