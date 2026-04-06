import { ParsedLogFile } from '../../domain/entities';
import { ILogRepository } from '../../domain/interfaces';
export declare class InMemoryLogRepository implements ILogRepository {
    private logs;
    save(file: ParsedLogFile): Promise<ParsedLogFile>;
    findById(id: string): Promise<ParsedLogFile | null>;
    findAll(): Promise<ParsedLogFile[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=InMemoryLogRepository.d.ts.map