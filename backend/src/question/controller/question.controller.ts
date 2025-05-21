import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { QuestionService } from "@/question/service/question.service";
import { CreateChoiceQuestionDto } from "@/question/dto/createChoiceQuestion.dto";
import { Question } from "@/question/question.entity";
import { QuizzGuard } from "@/quizz/guards/quizz.guard";
import { QuizzRequest } from "@/quizz/decorator/quizz.decorator";
import { Quizz } from "@/quizz/quizz.entity";
import { QuestionGuard } from "@/question/guards/question.guard";
import { QuestionRequest } from "@/question/decorator/question.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { ParseFilesPipe } from "@/files/files.validator";
import { FileUploadService } from "@/files/files.service";
import {
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AllQuestion } from "../types/AllQuestion";
@UseGuards(UserAuthGuard)
@ApiTags("questions")
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller("quizz/:quizzId/questions")
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @UseGuards(QuizzGuard)
  getQuestions(@QuizzRequest() quizz: Quizz): Promise<Question[]> {
    return this.questionService.getQuestions(quizz);
  }

  @Get(":questionId")
  @UseGuards(QuizzGuard, QuestionGuard)
  getQuestion(@QuestionRequest() question: Question): Question {
    return question;
  }

  @Post("choice")
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  @UseGuards(QuizzGuard)
  async createChoiceQuestion(
    @QuizzRequest() quizz: Quizz,
    @Body() createChoiceQuestionDto: CreateChoiceQuestionDto,
    @UploadedFile(ParseFilesPipe) file?: Express.Multer.File,
  ): Promise<void> {
    if (file) {
      const fileName = await this.fileUploadService.uploadFile(file);

      createChoiceQuestionDto.image =
        this.fileUploadService.getFileUrl(fileName);
    }

    await this.questionService.createChoiceQuestion(
      quizz,
      createChoiceQuestionDto,
    );
  }

  @Delete(":questionId")
  @UseGuards(QuizzGuard, QuestionGuard)
  @ApiOperation({ summary: "Delete a question" })
  deleteQuestion(@QuestionRequest() question: AllQuestion): Promise<void> {
    return this.questionService.deleteQuestion(question);
    // TODO: A tester si les choices supprimées supprime pas la question
  }
}
