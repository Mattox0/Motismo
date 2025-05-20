import { IsString, IsBoolean, IsNotEmpty } from "@/utils/validation.decorators";

export class CreateChoiceDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}
