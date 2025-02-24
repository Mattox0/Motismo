import { PartialType } from "@nestjs/swagger";
import { CreateQuizzDto } from "@/quizz/dto/createQuizzDto";

export class UpdatedQuizzDto extends PartialType(CreateQuizzDto) {}
