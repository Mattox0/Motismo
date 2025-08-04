import { IsString, IsNumber, IsOptional } from "@/utils/validation.decorators";
import { Transform, TransformFnParams } from "class-transformer";

export class CreateCardDto {
  @IsOptional()
  @IsString()
  rectoText?: string;

  @IsOptional()
  @IsString()
  versoText?: string;

  @IsOptional()
  @IsString()
  rectoImage?: string;

  @IsOptional()
  @IsString()
  versoImage?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) => (value ? parseInt(value as string, 10) : undefined))
  order?: number;
}
