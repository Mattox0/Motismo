import { PartialType } from "@nestjs/swagger";
import { CreateChoiceQuestionDto } from "@/question/dto/createChoiceQuestion.dto";

export class UpdateChoiceQuestionDto extends PartialType(
  CreateChoiceQuestionDto,
) {}
