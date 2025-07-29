import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "./game.entity";
import { GameService } from "./service/game.service";
import { TranslationService } from "@/translation/translation.service";
import { GameUserModule } from "@/gameUser/gameUser.module";
import { GameController } from "./controller/game.controller";
import { User } from "@/user/user.entity";
import { UsersModule } from "@/user/user.module";
import { Quizz } from "@/quizz/quizz.entity";
import { Choice } from "@/choice/choice.entity";
import { Card } from "@/cards/card.entity";
import { ChoiceModule } from "@/choice/choice.module";
import { QuestionModule } from "@/question/question.module";
import { GameResponseModule } from "@/gameResponses/gameResponse.module";
import { GameResponse } from "@/gameResponses/gameResponse.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User, Quizz, Choice, Card, GameResponse]),
    forwardRef(() => GameUserModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ChoiceModule),
    forwardRef(() => QuestionModule),
    forwardRef(() => GameResponseModule),
  ],
  controllers: [GameController],
  providers: [GameService, TranslationService],
  exports: [GameService],
})
export class GameModule {}
