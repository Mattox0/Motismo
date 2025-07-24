import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "./game.entity";
import { GameService } from "./service/game.service";
import { TranslationService } from "@/translation/translation.service";
import { GameUserModule } from "@/gameUser/gameUser.module";

@Module({
  imports: [TypeOrmModule.forFeature([Game]), forwardRef(() => GameUserModule)],
  controllers: [],
  providers: [GameService, TranslationService],
  exports: [GameService],
})
export class GameModule {}
