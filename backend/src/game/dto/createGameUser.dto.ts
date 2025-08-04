import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateGameUserDto {
  @ApiProperty({ description: "Name of the player", example: "John" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Avatar URL of the player", example: "https://api.dicebear.com/..." })
  @IsNotEmpty()
  @IsString()
  avatar: string;

  @ApiProperty({
    description: "External user ID if authenticated",
    example: "user-uuid",
    required: false,
  })
  @IsOptional()
  @IsString()
  externalId?: string;
}
