import { IsNotEmpty, IsString, IsUUID } from "@/utils/validation.decorators";

export class AddStudentDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  studentId: string;
}
