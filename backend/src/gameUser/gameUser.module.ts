import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TranslationService } from "@/translation/translation.service";
import { GameUser } from "./gameUser.entity";
import { GameUserService } from "./service/gameUser.service";

@Module({
  imports: [TypeOrmModule.forFeature([GameUser])],
  controllers: [],
  providers: [GameUserService, TranslationService],
  exports: [GameUserService],
})
export class GameUserModule {}
