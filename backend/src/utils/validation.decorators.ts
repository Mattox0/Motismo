import {
  IsString as OriginalIsString,
  IsNumber as OriginalIsNumber,
  IsOptional as OriginalIsOptional,
  IsNotEmpty as OriginalIsNotEmpty,
  IsEnum as OriginalIsEnum,
  MinLength as OriginalMinLength,
  IsArray as OriginalIsArray,
  IsBoolean as OriginalIsBoolean,
  ValidateNested as OriginalValidateNested,
  ValidationOptions,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";

export const IsString = () =>
  OriginalIsString({
    message: i18nValidationMessage<I18nTranslations>("validation.NOT_STRING"),
  });

export const IsNumber = () =>
  OriginalIsNumber(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>("validation.NOT_NUMBER"),
    },
  );

export const IsOptional = () => OriginalIsOptional();

export const IsNotEmpty = () =>
  OriginalIsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>("validation.NOT_EMPTY"),
  });

export const IsEnum = (enumType: object) =>
  OriginalIsEnum(enumType, {
    message: i18nValidationMessage<I18nTranslations>("validation.NOT_ENUM", {
      enum: enumType,
    }),
  });

export const MinLength = (length: number) =>
  OriginalMinLength(length, {
    message: i18nValidationMessage<I18nTranslations>("validation.MIN_NUMBER", {
      length,
    }),
  });

export const IsArray = () =>
  OriginalIsArray({
    message: i18nValidationMessage<I18nTranslations>("validation.NOT_ARRAY"),
  });

export const IsBoolean = () =>
  OriginalIsBoolean({
    message: i18nValidationMessage<I18nTranslations>("validation.NOT_BOOLEAN"),
  });

export const ValidateNested = (options?: ValidationOptions) =>
  OriginalValidateNested({
    ...options,
    message: i18nValidationMessage<I18nTranslations>("validation.NOT_VALIDATE_NESTED"),
  });
