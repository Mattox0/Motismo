import { PartialType } from "@nestjs/swagger";
import { CreateChoiceQuestionDto } from "@/question/dto/createChoiceQuestion.dto";
import { CreateQuestionDto } from "@/question/dto/createQuestion.dto";

export class UpdateChoiceQuestionDto extends PartialType(CreateChoiceQuestionDto) {}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
