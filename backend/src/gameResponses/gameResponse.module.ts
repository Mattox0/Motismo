import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TranslationService } from "@/translation/translation.service";
import { GameResponseService } from "./services/gameResponse.service";
import { GameResponse } from "./gameResponse.entity";
import { GameUser } from "@/gameUser/gameUser.entity";

@Module({
  imports: [TypeOrmModule.forFeature([GameUser, GameResponse])],
  controllers: [],
  providers: [GameResponseService, TranslationService],
  exports: [GameResponseService],
})
export class GameResponseModule {}
