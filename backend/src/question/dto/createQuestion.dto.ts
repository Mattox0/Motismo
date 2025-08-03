import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  ValidateNested,
} from "@/utils/validation.decorators";
import { Transform, Type } from "class-transformer";
import { QuestionType } from "../types/questionType";

class ChoiceOption {
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}

interface IRawChoice {
  text: unknown;
  isCorrect: unknown;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceOption)
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value) as IRawChoice[];

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed.map((option) => {
          const choice = new ChoiceOption();

          choice.text = typeof option.text === "string" ? option.text : "";
          choice.isCorrect = Boolean(option.isCorrect);

          return choice;
        });
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) {
      return (value as IRawChoice[]).map((option) => {
        const choice = new ChoiceOption();

        choice.text = typeof option.text === "string" ? option.text : "";
        choice.isCorrect = Boolean(option.isCorrect);

        return choice;
      });
    }

    return [];
  })
  choices?: ChoiceOption[];
}
