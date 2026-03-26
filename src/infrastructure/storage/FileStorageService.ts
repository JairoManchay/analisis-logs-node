import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

export interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  size: number;
  uploadedAt: Date;
}

export class FileStorageService {
  private readonly uploadDir: string;

  constructor(uploadDir: string = './uploads') {
    this.uploadDir = uploadDir;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, originalName: string): Promise<StoredFile> {
    const fileId = uuidv4();
    const extension = path.extname(originalName);
    const storedName = `${fileId}${extension}`;
    const storedPath = path.join(this.uploadDir, storedName);

    await fs.promises.writeFile(storedPath, buffer);

    return {
      id: fileId,
      originalName,
      storedPath,
      size: buffer.length,
      uploadedAt: new Date(),
    };
  }

  async getFileStream(fileId: string): Promise<Readable | null> {
    const files = await fs.promises.readdir(this.uploadDir);
    const file = files.find(f => f.startsWith(fileId));

    if (!file) return null;

    const filePath = path.join(this.uploadDir, file);
    return fs.createReadStream(filePath);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const files = await fs.promises.readdir(this.uploadDir);
    const file = files.find(f => f.startsWith(fileId));

    if (!file) return false;

    const filePath = path.join(this.uploadDir, file);
    await fs.promises.unlink(filePath);
    return true;
  }

  async cleanup(olderThan: Date): Promise<number> {
    const files = await fs.promises.readdir(this.uploadDir);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(this.uploadDir, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.mtime < olderThan) {
        await fs.promises.unlink(filePath);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}
