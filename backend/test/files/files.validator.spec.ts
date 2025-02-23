import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ParseFilePipeDocument } from "@/files/files.validator";
import { TranslationService } from "@/translation/translation.service";

jest.mock("@/utils/regex.variable", () => ({
  imageRegex: /\.(jpg|jpeg|png|gif)$/i,
}));

describe("ParseFilePipeDocument", () => {
  let pipe: ParseFilePipeDocument;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(async () => {
    mockTranslationService = {
      translate: jest.fn().mockImplementation(() => "Translated error message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParseFilePipeDocument,
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    pipe = module.get<ParseFilePipeDocument>(ParseFilePipeDocument);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(pipe).toBeDefined();
  });

  it("should return undefined when no file is provided", async () => {
    const result = await pipe.transform(undefined);

    expect(result).toBeUndefined();
  });

  it("should accept valid image extensions", async () => {
    const mockFile: Express.Multer.File = {
      originalname: "test.jpg",
      buffer: Buffer.from("test"),
      mimetype: "image/jpeg",
    } as Express.Multer.File;

    const result = await pipe.transform(mockFile);

    expect(result).toBe(mockFile);
  });

  it("should accept multiple valid image extensions", async () => {
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];

    for (const ext of validExtensions) {
      const mockFile: Express.Multer.File = {
        originalname: `test${ext}`,
        buffer: Buffer.from("test"),
        mimetype: `image/${ext.slice(1)}`,
      } as Express.Multer.File;

      const result = await pipe.transform(mockFile);

      expect(result).toBe(mockFile);
    }
  });

  it("should reject invalid file extensions", async () => {
    const mockFile: Express.Multer.File = {
      originalname: "test.pdf",
      buffer: Buffer.from("test"),
      mimetype: "application/pdf",
    } as Express.Multer.File;

    await expect(pipe.transform(mockFile)).rejects.toThrow(HttpException);
    expect(mockTranslationService.translate).toHaveBeenCalledWith(
      "error.EXTENSION_NOT_ALLOWED",
    );
  });

  it("should handle uppercase extensions", async () => {
    const mockFile: Express.Multer.File = {
      originalname: "test.JPG",
      buffer: Buffer.from("test"),
      mimetype: "image/jpeg",
    } as Express.Multer.File;

    const result = await pipe.transform(mockFile);

    expect(result).toBe(mockFile);
  });

  it("should reject files with no extension", async () => {
    const mockFile: Express.Multer.File = {
      originalname: "test",
      buffer: Buffer.from("test"),
      mimetype: "application/octet-stream",
    } as Express.Multer.File;

    await expect(pipe.transform(mockFile)).rejects.toThrow(HttpException);
    expect(mockTranslationService.translate).toHaveBeenCalledWith(
      "error.EXTENSION_NOT_ALLOWED",
    );
  });
});
