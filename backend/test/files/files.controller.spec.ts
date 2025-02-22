import { Test, TestingModule } from "@nestjs/testing";
import { FileUploadController } from "@/files/files.controller";
import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { Response } from "express";
import { Readable } from "stream";

describe("FileUploadController", () => {
  let controller: FileUploadController;
  let mockFileUploadService: Partial<FileUploadService>;
  let mockTranslationService: Partial<TranslationService>;

  beforeEach(async () => {
    mockFileUploadService = {
      uploadFile: jest.fn(),
      getFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      const mockFile = {
        originalname: "test.jpg",
        buffer: Buffer.from("test"),
      } as Express.Multer.File;

      const mockKey = "uploaded-file-key";

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockResolvedValue(mockKey);

      const result = await controller.uploadFile(mockFile);

      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "files.FILE_UPLOAD",
      );
      expect(result).toEqual({
        message: "Translated message",
        key: mockKey,
      });
    });

    it("should handle upload failure", async () => {
      const mockFile = {
        originalname: "test.jpg",
        buffer: Buffer.from("test"),
      } as Express.Multer.File;

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockRejectedValue(new Error("Upload failed"));

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        "Upload failed",
      );
    });
  });

  describe("getFile", () => {
    it("should stream file successfully", async () => {
      const mockKey = "test-file-key";

      const mockStream = {
        pipe: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
      };

      const mockResponse = {
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        pipe: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      } as unknown as Response;

      jest
        .spyOn(mockFileUploadService, "getFile")
        .mockResolvedValue(mockStream as unknown as Readable);

      await controller.getFile(mockKey, mockResponse);

      expect(mockFileUploadService.getFile).toHaveBeenCalledWith(mockKey);
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle file retrieval failure", async () => {
      const mockKey = "non-existent-key";
      const mockResponse = {
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      } as unknown as Response;

      jest
        .spyOn(mockFileUploadService, "getFile")
        .mockRejectedValue(new Error("File not found"));

      await expect(controller.getFile(mockKey, mockResponse)).rejects.toThrow(
        "File not found",
      );
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      const mockKey = "file-to-delete";

      jest
        .spyOn(mockFileUploadService, "deleteFile")
        .mockResolvedValue(undefined);

      const result = await controller.deleteFile(mockKey);

      expect(mockFileUploadService.deleteFile).toHaveBeenCalledWith(mockKey);
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "files.FILE_UPLOAD",
      );
      expect(result).toBe("Translated message");
    });

    it("should handle delete failure", async () => {
      const mockKey = "non-existent-file";

      jest
        .spyOn(mockFileUploadService, "deleteFile")
        .mockRejectedValue(new Error("Delete failed"));

      await expect(controller.deleteFile(mockKey)).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  describe("error handling", () => {
    it("should handle translation service failures", async () => {
      const mockKey = "test-key";

      jest
        .spyOn(mockFileUploadService, "deleteFile")
        .mockResolvedValue(undefined);
      jest
        .spyOn(mockTranslationService, "translate")
        .mockRejectedValue(new Error("Translation failed"));

      await expect(controller.deleteFile(mockKey)).rejects.toThrow(
        "Translation failed",
      );
    });
  });

  describe("input validation", () => {
    it("should reject null file", async () => {
      const nullFile = null as unknown as Express.Multer.File;

      await expect(controller.uploadFile(nullFile)).rejects.toThrow(
        "File is missing",
      );
    });

    it("should reject undefined file", async () => {
      const undefinedFile = undefined as unknown as Express.Multer.File;

      await expect(controller.uploadFile(undefinedFile)).rejects.toThrow(
        "File is missing",
      );
    });

    it("should handle wrong type file", async () => {
      const emptyFile = {
        originalname: "empty.txt",
        buffer: Buffer.from(""),
        mimetype: "text/plain",
      } as Express.Multer.File;

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockRejectedValue(new Error("Invalid file type"));

      await expect(controller.uploadFile(emptyFile)).rejects.toThrow(
        "Invalid file type",
      );
    });

    it("should handle empty file buffer", async () => {
      const emptyFile = {
        originalname: "empty.png",
        buffer: Buffer.from(""),
        mimetype: "text/plain",
      } as Express.Multer.File;

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockRejectedValue(new Error("Empty file not allowed"));

      await expect(controller.uploadFile(emptyFile)).rejects.toThrow(
        "Empty file not allowed",
      );
    });

    it("should reject file without buffer", async () => {
      const invalidFile = {
        originalname: "test.txt",
        mimetype: "text/plain",
      } as Express.Multer.File;

      await expect(controller.uploadFile(invalidFile)).rejects.toThrow(
        "File buffer is required",
      );
    });
  });
});
