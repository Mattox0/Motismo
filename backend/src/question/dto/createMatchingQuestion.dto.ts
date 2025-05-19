import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  ValidateNested,
} from "@/utils/validation.decorators";
import { Type } from "class-transformer";
import { CreateQuestionDto } from "./createQuestion.dto";

class MatchingPair {
  @IsNotEmpty()
  left: string;

  @IsNotEmpty()
  right: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateMatchingQuestionDto extends CreateQuestionDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchingPair)
  pairs: MatchingPair[];

  @IsNotEmpty()
  @IsBoolean()
  allowPartialMatching: boolean;
}
