import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { QuestionService } from "../service/question.service";
import { CreateChoiceQuestionDto } from "../dto/createChoiceQuestion.dto";
import { Question } from "../question.entity";
import { QuizzGuard } from "@/quizz/guards/quizz.guard";
import { QuizzRequest } from "@/quizz/decorator/quizz.decorator";
import { Quizz } from "@/quizz/quizz.entity";

@UseGuards(UserAuthGuard)
@ApiTags("questions")
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller("quizz/:quizzId/questions")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post("choice")
  @UseGuards(QuizzGuard)
  createChoiceQuestion(
    @QuizzRequest() quizz: Quizz,
    @Body() createChoiceQuestionDto: CreateChoiceQuestionDto,
  ): Promise<Question> {
    return this.questionService.createChoiceQuestion(
      quizz,
      createChoiceQuestionDto,
    );
  }

  // @Post("matching")
  // @UseGuards(QuizzGuard)
  // createMatchingQuestion(
  //   @QuizzRequest() quizz: Quizz,
  //   @Body() createMatchingQuestionDto: CreateMatchingQuestionDto,
  // ): Promise<Question> {
  //   return this.questionService.createMatchingQuestion(
  //     createMatchingQuestionDto,
  //   );
  // }

  // @Post("word-cloud")
  // @UseGuards(QuizzGuard)
  // createWordCloudQuestion(
  //   @QuizzRequest() quizz: Quizz,
  //   @Body() createWordCloudQuestionDto: CreateWordCloudQuestionDto,
  // ): Promise<Question> {
  //   return this.questionService.createWordCloudQuestion(
  //     createWordCloudQuestionDto,
  //   );
  // }
}
