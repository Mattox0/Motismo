import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "@/quizz/quizz.entity";
import { QuizzService } from "@/quizz/service/quizz.service";

@UseGuards(UserAuthGuard)
@ApiTags("quizz")
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller("quizz")
export class QuizzController {
  constructor(
    private quizzService: QuizzService,
    private readonly translationService: TranslationService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get("")
  @ApiOperation({ summary: "Returns all quizzies" })
  @ApiOkResponse({
    description: "Quizzies found successfully",
    type: Quizz,
    isArray: true,
  })
  getAll(): Promise<Quizz[]> {
    return this.quizzService.getAll();
  }
}
