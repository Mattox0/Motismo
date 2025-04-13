import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { QuizzService } from "@/quizz/service/quizz.service";

@UseGuards(UserAuthGuard)
@ApiTags("questions")
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller("questions")
export class QuestionController {
  constructor(
    private readonly quizzService: QuizzService,
    private readonly translationService: TranslationService,
    private readonly fileUploadService: FileUploadService,
  ) {}
}
