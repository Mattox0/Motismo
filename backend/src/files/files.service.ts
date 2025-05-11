import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { Readable } from "node:stream";

import { s3Client } from "@/s3.config";

@Injectable()
export class FileUploadService {
  private readonly bucketName = process.env.AWS_BUCKET || "data";

  private extractFileKey(url: string): string {
    const urlParts = url.split("/");

    return urlParts[urlParts.length - 1];
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${Date.now().toString()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return key;
  }

  async getFile(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const { Body } = await s3Client.send(command);

    return Body as Readable;
  }

  async deleteFile(url: string): Promise<void> {
    const key = this.extractFileKey(url);
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await s3Client.send(command);
  }

  getFileUrl(key: string): string {
    return `${process.env.VITE_API_BASE_URL ?? ""}/files/${key}`;
  }
}
