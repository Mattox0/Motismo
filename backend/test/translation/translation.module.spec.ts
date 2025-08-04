import { Test, TestingModule } from "@nestjs/testing";
import { TranslationModule } from "@/translation/translation.module";
import { TranslationService } from "@/translation/translation.service";
import { I18nModule, I18nResolver } from "nestjs-i18n";
import { join } from "path";
import { Request } from "express";
import { ExecutionContext } from "@nestjs/common";

class AcceptLanguageResolver implements I18nResolver {
  resolve(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<Request>();
    const acceptLanguage = request.headers["accept-language"];

    return acceptLanguage || "fr";
  }
}

describe("TranslationModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: "fr",
          loaderOptions: {
            path: join(__dirname, "..", "i18n"),
            watch: false,
          },
          resolvers: [AcceptLanguageResolver],
        }),
        TranslationModule,
      ],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should export TranslationService", () => {
    const translationService = module.get<TranslationService>(TranslationService);

    expect(translationService).toBeDefined();
    expect(translationService).toBeInstanceOf(TranslationService);
  });

  it("should have TranslationService as a provider", () => {
    const providers = module.get(TranslationService);

    expect(providers).toBeDefined();
  });
});
