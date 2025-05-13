import { Test, TestingModule } from "@nestjs/testing";
import { TranslationService } from "@/translation/translation.service";
import { I18nService } from "nestjs-i18n";

describe("TranslationService", () => {
  let service: TranslationService;

  const mockI18nService = {
    translate: jest.fn(),
  };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("translate", () => {
    it("should successfully translate a key", async () => {
      const key = "test.key";
      const translatedValue = "Translated Value";
      const options = { lang: "fr" };

      mockI18nService.translate.mockResolvedValue(translatedValue);

      const result = await service.translate(key, options);

      expect(result).toBe(translatedValue);
      expect(mockI18nService.translate).toHaveBeenCalledWith(key, options);
    });

    it("should throw an error when translation fails", async () => {
      const key = "test.key";
      const options = { lang: "fr" };

      mockI18nService.translate.mockRejectedValue(
        new Error("Translation failed"),
      );

      await expect(service.translate(key, options)).rejects.toThrow(
        "Erreur de traduction",
      );
      expect(mockI18nService.translate).toHaveBeenCalledWith(key, options);
    });

    it("should call translate without options", async () => {
      const key = "test.key";
      const translatedValue = "Translated Value";

      mockI18nService.translate.mockResolvedValue(translatedValue);

      const result = await service.translate(key);

      expect(result).toBe(translatedValue);
      expect(mockI18nService.translate).toHaveBeenCalledWith(key, undefined);
    });

    it("should handle translation with interpolation", async () => {
      const key = "test.key";
      const translatedValue = "Hello John";
      const options = { lang: "en", args: { name: "John" } };

      mockI18nService.translate.mockResolvedValue(translatedValue);

      const result = await service.translate(key, options);

      expect(result).toBe(translatedValue);
      expect(mockI18nService.translate).toHaveBeenCalledWith(key, options);
    });

    it("should handle translation with default value", async () => {
      const key = "test.key";
      const translatedValue = "Default Value";
      const options = { lang: "en", defaultValue: "Default Value" };

      mockI18nService.translate.mockResolvedValue(translatedValue);

      const result = await service.translate(key, options);

      expect(result).toBe(translatedValue);
      expect(mockI18nService.translate).toHaveBeenCalledWith(key, options);
    });

    it("should handle translation with namespace", async () => {
      const key = "test.key";
      const translatedValue = "Namespaced Value";
      const options = { lang: "en", namespace: "custom" };

      mockI18nService.translate.mockResolvedValue(translatedValue);

      const result = await service.translate(key, options);

      expect(result).toBe(translatedValue);
      expect(mockI18nService.translate).toHaveBeenCalledWith(key, options);
    });
  });
});
