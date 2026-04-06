import { ParsedLogFile } from '../../domain/entities';
import { ILogRepository } from '../../domain/interfaces';

export class InMemoryLogRepository implements ILogRepository {
  private logs: Map<string, ParsedLogFile> = new Map();

  async save(file: ParsedLogFile): Promise<ParsedLogFile> {
    this.logs.set(file.id, file);
    return file;
  }

  async findById(id: string): Promise<ParsedLogFile | null> {
    return this.logs.get(id) || null;
  }

  async findAll(): Promise<ParsedLogFile[]> {
    return Array.from(this.logs.values());
  }

  async delete(id: string): Promise<void> {
    this.logs.delete(id);
  }
}
