import { Module } from "@nestjs/common";

import { FileUploadController } from "@/files/files.controller";
import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { ParseFilesPipe } from "@/files/files.validator";

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, TranslationService, ParseFilesPipe],
  exports: [FileUploadService, ParseFilesPipe],
})
export class FileUploadModule {}
