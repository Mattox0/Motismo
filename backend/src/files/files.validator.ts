import { HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { extname } from "node:path";

import { TranslationService } from "@/translation/translation.service";
import { imageRegex } from "@/utils/regex.variable";

type FileFields = {
  [key: string]: Express.Multer.File[];
};

@Injectable()
export class ParseFilesPipe implements PipeTransform {
  constructor(private readonly translationService: TranslationService) {}

  private async validateFile(file: Express.Multer.File): Promise<void> {
    const extension = extname(file.originalname).toLowerCase();

    if (!imageRegex.test(extension)) {
      throw new HttpException(
        await this.translationService.translate("error.EXTENSION_NOT_ALLOWED"),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async transform(
    value: FileFields | Express.Multer.File | undefined,
  ): Promise<FileFields | Express.Multer.File | undefined> {
    if (!value) {
      return;
    }

    if ("originalname" in value && typeof value.originalname === "string") {
      await this.validateFile(value as Express.Multer.File);

      return value;
    }

    if (typeof value === "object") {
      for (const files of Object.values(value)) {
        if (Array.isArray(files) && files[0] && this.isValidFile(files[0])) {
          await this.validateFile(files[0]);
        }
      }
    }

    return value;
  }

  private isValidFile(file: unknown): file is Express.Multer.File {
    return (
      typeof file === "object" &&
      file !== null &&
      "originalname" in file &&
      typeof (file as Express.Multer.File).originalname === "string"
    );
  }
}
