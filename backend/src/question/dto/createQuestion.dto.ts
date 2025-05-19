import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from "@/utils/validation.decorators";

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  order: number;
}
