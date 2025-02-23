import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "./quizz.entity";
import { QuizzController } from "./controller/quizz.controller";
import { QuizzService } from "./service/quizz.service";

@Module({
  imports: [TypeOrmModule.forFeature([Quizz])],
  controllers: [QuizzController],
  providers: [QuizzService, TranslationService, FileUploadService],
  exports: [QuizzService],
})
export class QuizzModule {}
