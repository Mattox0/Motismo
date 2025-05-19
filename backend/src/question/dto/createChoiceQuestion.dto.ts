import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "@/utils/validation.decorators";
import { Type } from "class-transformer";
import { QuestionType } from "@/question/types/questionType";
import { CreateQuestionDto } from "@/question/dto/createQuestion.dto";

class ChoiceOption {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateChoiceQuestionDto extends CreateQuestionDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceOption)
  options: ChoiceOption[];

  @IsNotEmpty()
  @IsBoolean()
  allowMultipleSelections: boolean;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  questionType: QuestionType;
}
