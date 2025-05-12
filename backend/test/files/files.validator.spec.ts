import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ParseFilesPipe } from "@/files/files.validator";
import { TranslationService } from "@/translation/translation.service";

jest.mock("@/utils/regex.variable", () => ({
  imageRegex: /\.(jpg|jpeg|png|gif)$/i,
}));

describe("ParseFilesPipe", () => {
  let pipe: ParseFilesPipe;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(async () => {
    mockTranslationService = {
      translate: jest.fn().mockImplementation(() => "Translated error message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParseFilesPipe,
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    pipe = module.get<ParseFilesPipe>(ParseFilesPipe);
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

  it("should validate single file upload", async () => {
    const mockFile: Express.Multer.File = {
      fieldname: "image",
      originalname: "test.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      buffer: Buffer.from("test"),
      size: 4,
    } as Express.Multer.File;

    const result = await pipe.transform(mockFile);

    expect(result).toBe(mockFile);
  });

  it("should validate multiple files upload", async () => {
    const mockFiles = {
      image: [
        {
          fieldname: "image",
          originalname: "test.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          buffer: Buffer.from("test"),
          size: 4,
        } as Express.Multer.File,
      ],
      document: [
        {
          fieldname: "document",
          originalname: "test.png",
          encoding: "7bit",
          mimetype: "image/png",
          buffer: Buffer.from("test"),
          size: 4,
        } as Express.Multer.File,
      ],
    };

    const result = await pipe.transform(mockFiles);

    expect(result).toEqual(mockFiles);
  });

  it("should reject invalid file extensions", async () => {
    const mockFile: Express.Multer.File = {
      fieldname: "image",
      originalname: "test.pdf",
      encoding: "7bit",
      mimetype: "application/pdf",
      buffer: Buffer.from("test"),
      size: 4,
    } as Express.Multer.File;

    await expect(pipe.transform(mockFile)).rejects.toThrow(HttpException);
    expect(mockTranslationService.translate).toHaveBeenCalledWith(
      "error.EXTENSION_NOT_ALLOWED",
    );
  });

  it("should handle uppercase extensions", async () => {
    const mockFile: Express.Multer.File = {
      fieldname: "image",
      originalname: "test.JPG",
      encoding: "7bit",
      mimetype: "image/jpeg",
      buffer: Buffer.from("test"),
      size: 4,
    } as Express.Multer.File;

    const result = await pipe.transform(mockFile);

    expect(result).toBe(mockFile);
  });

  it("should reject files with no extension", async () => {
    const mockFile: Express.Multer.File = {
      fieldname: "image",
      originalname: "test",
      encoding: "7bit",
      mimetype: "application/octet-stream",
      buffer: Buffer.from("test"),
      size: 4,
    } as Express.Multer.File;

    await expect(pipe.transform(mockFile)).rejects.toThrow(HttpException);
    expect(mockTranslationService.translate).toHaveBeenCalledWith(
      "error.EXTENSION_NOT_ALLOWED",
    );
  });
});
