import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "./quizz.entity";
import { QuizzController } from "./controller/quizz.controller";
import { QuizzService } from "./service/quizz.service";
import { UserService } from "@/user/service/user.service";
import { User } from "@/user/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quizz]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [QuizzController],
  providers: [QuizzService, UserService, TranslationService, FileUploadService],
  exports: [QuizzService],
})
export class QuizzModule {}
