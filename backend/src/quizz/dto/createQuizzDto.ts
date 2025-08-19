import { IQuizzType } from "../types/IQuizzType";
import { IsEnum, IsNotEmpty, MinLength, IsString } from "@/utils/validation.decorators";
import { IsEmpty, IsOptional } from "class-validator";

export class CreateQuizzDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsEnum(IQuizzType)
  quizzType: IQuizzType;

  @IsOptional()
  @IsEmpty()
  image?: string;

  @IsOptional()
  @IsString()
  classIds?: string;
}
