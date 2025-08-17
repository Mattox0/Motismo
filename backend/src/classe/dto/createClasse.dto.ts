import { IsNotEmpty, IsString, MinLength } from "@/utils/validation.decorators";

export class CreateClasseDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;
}
