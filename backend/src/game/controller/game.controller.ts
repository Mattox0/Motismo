import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { TranslationService } from "@/translation/translation.service";
import { GameService } from "../service/game.service";
import { ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { BadRequestException, Controller, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { QuizzGuard } from "@/quizz/guards/quizz.guard";
import { Quizz } from "@/quizz/quizz.entity";
import { QuizzRequest } from "@/quizz/decorator/quizz.decorator";
import { IQuizzType } from "@/quizz/types/IQuizzType";
import { CurrentUser } from "@/user/decorators/currentUser.decorator";
import { User } from "@/user/user.entity";

@UseGuards(UserAuthGuard)
@ApiTags("game")
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller("quizz/:quizzId/game")
export class GameController {
  constructor(
    private gameService: GameService,
    private readonly translationService: TranslationService,
  ) {}

  @Post("")
  @UseGuards(QuizzGuard)
  async createGame(@QuizzRequest() quizz: Quizz, @CurrentUser() user: User) {
    if (quizz.quizzType !== IQuizzType.QUESTIONS) {
      throw new BadRequestException(await this.translationService.translate("error.QUIZZ_TYPE"));
    }
    if (!quizz.questions || quizz.questions.length === 0) {
      throw new BadRequestException(await this.translationService.translate("error.ANY_QUESTIONS"));
    }
    if (quizz.author.id !== user.id) {
      throw new UnauthorizedException(await this.translationService.translate("error.PERMISSION_DENIED"));
    }

    return this.gameService.create(quizz, user);
  }
}
