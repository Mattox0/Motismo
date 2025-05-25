import { IQuizzType } from "../types/IQuizzType";
import { IsEnum, IsNotEmpty, MinLength } from "@/utils/validation.decorators";
import { IsEmpty, IsOptional, IsString } from "class-validator";

export class CreateQuizzDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(IQuizzType)
  quizzType: IQuizzType;

  @IsOptional()
  @IsEmpty()
  image?: string;
}
