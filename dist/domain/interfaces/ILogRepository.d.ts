import { ParsedLogFile } from '../entities';
export interface ILogRepository {
    save(file: ParsedLogFile): Promise<ParsedLogFile>;
    findById(id: string): Promise<ParsedLogFile | null>;
    findAll(): Promise<ParsedLogFile[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=ILogRepository.d.ts.map