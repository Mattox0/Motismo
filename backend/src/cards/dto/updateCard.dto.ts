import { PartialType } from "@nestjs/mapped-types";
import { CreateCardDto } from "./createCard.dto";

export class UpdateCardDto extends PartialType(CreateCardDto) {}
