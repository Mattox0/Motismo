import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from "@/utils/validation.decorators";
import { QuestionType } from "../types/questionType";

export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  order: number;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  questionType: QuestionType;
}
