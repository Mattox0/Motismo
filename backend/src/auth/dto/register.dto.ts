import { Role } from "@/user/role.enum";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "@/utils/validation.decorators";
import { IsEmpty } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEmpty()
  image?: string;

  @IsOptional()
  @IsString()
  classCode?: string;
}
