import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./card.entity";
import { CardController } from "./controller/card.controller";
import { CardService } from "./service/card.service";
import { TranslationModule } from "@/translation/translation.module";
import { CardGuard } from "./guards/card.guard";
import { FileUploadService } from "@/files/files.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([Card]),
    TranslationModule,
    FileUploadService,
  ],
  controllers: [CardController],
  providers: [CardService, CardGuard],
  exports: [CardService],
})
export class CardsModule {}
