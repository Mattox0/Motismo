import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsMin,
  IsMax,
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

class WordOption {
  @IsString()
  text: string;
}

interface IRawChoice {
  text: unknown;
  isCorrect: unknown;
}

interface IRawWord {
  text: unknown;
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordOption)
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value) as IRawWord[];

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed.map((option) => {
          const word = new WordOption();

          word.text = typeof option.text === "string" ? option.text : "";

          return word;
        });
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) {
      return (value as IRawWord[]).map((option) => {
        const word = new WordOption();

        word.text = typeof option.text === "string" ? option.text : "";

        return word;
      });
    }

    return [];
  })
  words?: WordOption[];

  @IsOptional()
  @IsNumber()
  @IsMin(1)
  @IsMax(20)
  maxWords?: number;
}
