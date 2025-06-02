import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "@/utils/validation.decorators";
import { Transform, Type } from "class-transformer";
import { CreateQuestionDto } from "@/question/dto/createQuestion.dto";

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

export class CreateChoiceQuestionDto extends CreateQuestionDto {
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
  choices: ChoiceOption[];
}
