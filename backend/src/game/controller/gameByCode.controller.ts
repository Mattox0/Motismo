import { ApiTags, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from "@nestjs/swagger";
import { BadRequestException, Body, Controller, Param, Post } from "@nestjs/common";
import { GameService } from "../service/game.service";
import { TranslationService } from "@/translation/translation.service";
import { CreateGameUserDto } from "../dto/createGameUser.dto";

@ApiTags("game")
@Controller("game")
export class GameByCodeController {
  constructor(
    private gameService: GameService,
    private readonly translationService: TranslationService,
  ) {}

  @Post(":code/gameUser")
  @ApiOkResponse({ description: "GameUser created successfully" })
  @ApiNotFoundResponse({ description: "Game not found" })
  @ApiBadRequestResponse({ description: "Invalid data" })
  async createGameUser(@Param("code") code: string, @Body() createGameUserDto: CreateGameUserDto) {
    if (!code) {
      throw new BadRequestException(await this.translationService.translate("error.GAME_CODE_REQUIRED"));
    }

    return this.gameService.createGameUser(code, createGameUserDto);
  }
}