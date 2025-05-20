import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Choice } from "./choice.entity";
import { ChoiceService } from "./service/choice.service";
import { TranslationService } from "@/translation/translation.service";

@Module({
  imports: [TypeOrmModule.forFeature([Choice])],
  providers: [ChoiceService, TranslationService],
  exports: [ChoiceService],
})
export class ChoiceModule {}
