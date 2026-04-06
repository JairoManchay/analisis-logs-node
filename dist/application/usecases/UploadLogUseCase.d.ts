import { ParsedLogFile } from '../../domain/entities';
import { ILogRepository } from '../../domain/interfaces';
import { LogParserFactory, LogAnalyzerService } from '../services';
export interface UploadLogDTO {
    filename: string;
    buffer: Buffer;
}
export declare class UploadLogUseCase {
    private readonly repository;
    private readonly parserFactory;
    private readonly analyzerService;
    private logger;
    constructor(repository: ILogRepository, parserFactory: typeof LogParserFactory, analyzerService: LogAnalyzerService);
    execute(dto: UploadLogDTO): Promise<ParsedLogFile>;
}
//# sourceMappingURL=UploadLogUseCase.d.ts.map