export const mockSend = jest.fn();

export const mockS3Config = {
  s3Client: {
    send: mockSend,
  },
};

import { Test, TestingModule } from "@nestjs/testing";
import { FileUploadService } from "@/files/files.service";
import { Readable } from "stream";

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock("@/s3.config", () => mockS3Config);

describe("FileUploadService", () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("uploadFile", () => {
    it("should upload a file and return the key", async () => {
      const mockFile: Express.Multer.File = {
        originalname: "test.jpg",
        buffer: Buffer.from("test"),
        mimetype: "image/jpeg",
      } as Express.Multer.File;

      mockSend.mockResolvedValueOnce({});

      const result = await service.uploadFile(mockFile);

      expect(mockSend).toHaveBeenCalled();
      expect(result).toMatch(/^\d+-test\.jpg$/);
    });

    it("should throw an error if upload fails", async () => {
      const mockFile: Express.Multer.File = {
        originalname: "test.jpg",
        buffer: Buffer.from("test"),
        mimetype: "image/jpeg",
      } as Express.Multer.File;

      mockSend.mockRejectedValueOnce(new Error("Upload failed"));

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        "Upload failed",
      );
    });
  });

  describe("getFile", () => {
    it("should get a file and return a readable stream", async () => {
      const mockStream = new Readable();

      mockSend.mockResolvedValueOnce({ Body: mockStream });

      const result = await service.getFile("test-key");

      expect(mockSend).toHaveBeenCalled();
      expect(result).toBe(mockStream);
    });

    it("should throw an error if get fails", async () => {
      mockSend.mockRejectedValueOnce(new Error("Get failed"));

      await expect(service.getFile("test-key")).rejects.toThrow("Get failed");
    });
  });

  describe("deleteFile", () => {
    it("should delete a file successfully", async () => {
      mockSend.mockResolvedValueOnce({});

      await service.deleteFile("test-key");

      expect(mockSend).toHaveBeenCalled();
    });

    it("should throw an error if delete fails", async () => {
      mockSend.mockRejectedValueOnce(new Error("Delete failed"));

      await expect(service.deleteFile("test-key")).rejects.toThrow(
        "Delete failed",
      );
    });
  });
});
