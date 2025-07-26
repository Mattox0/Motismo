import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TranslationService } from "@/translation/translation.service";
import { GameUser } from "./gameUser.entity";
import { GameUserService } from "./service/gameUser.service";
import { UsersModule } from "@/user/user.module";
import { Quizz } from "@/quizz/quizz.entity";

@Module({
  imports: [TypeOrmModule.forFeature([GameUser, Quizz]), forwardRef(() => UsersModule)],
  controllers: [],
  providers: [GameUserService, TranslationService],
  exports: [GameUserService],
})
export class GameUserModule {}
