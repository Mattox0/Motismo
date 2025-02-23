import { Test, TestingModule } from "@nestjs/testing";
import { TranslationService } from "@/translation/translation.service";
import { I18nService } from "nestjs-i18n";

const mockI18nService = {
  translate: jest.fn(),
};

describe("TranslationService", () => {
  let service: TranslationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationService,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<TranslationService>(TranslationService);

    jest.clearAllMocks();
  });

  describe("translate", () => {
    it("should successfully translate a key", async () => {
      const key = "test.key";
      const translatedValue = "Translated Value";
      const options = { lang: "fr" };
      const translateSpy = jest
        .spyOn(mockI18nService, "translate")
        .mockResolvedValue(translatedValue);

      const result = await service.translate(key, options);

      expect(result).toBe(translatedValue);
      expect(translateSpy).toHaveBeenCalledWith(key, options);
    });

    it("should throw an error when translation fails", async () => {
      const key = "test.key";
      const options = { lang: "fr" };
      const translateSpy = jest
        .spyOn(mockI18nService, "translate")
        .mockRejectedValue(new Error("Translation failed"));

      await expect(service.translate(key, options)).rejects.toThrow(
        "Erreur de traduction",
      );
      expect(translateSpy).toHaveBeenCalledWith(key, options);
    });

    it("should call translate without options", async () => {
      const key = "test.key";
      const translatedValue = "Translated Value";
      const translateSpy = jest
        .spyOn(mockI18nService, "translate")
        .mockResolvedValue(translatedValue);

      const result = await service.translate(key);

      expect(result).toBe(translatedValue);
      expect(translateSpy).toHaveBeenCalledWith(key, undefined);
    });
  });
});
