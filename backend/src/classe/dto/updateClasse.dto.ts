import { PartialType } from "@nestjs/swagger";

import { CreateClasseDto } from "./createClasse.dto";

export class UpdateClasseDto extends PartialType(CreateClasseDto) {}
