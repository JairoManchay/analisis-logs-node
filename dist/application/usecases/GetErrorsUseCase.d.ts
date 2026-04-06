import { ErrorGroup } from '../../domain/entities';
import { ILogRepository } from '../../domain/interfaces';
import { LogAnalyzerService } from '../services';
export interface FilterLogsDTO {
    logId?: string;
    dni?: string;
    service?: string;
    endpoint?: string;
    environment?: string;
    requestId?: string;
}
export declare class GetErrorsUseCase {
    private readonly repository;
    private readonly analyzerService;
    constructor(repository: ILogRepository, analyzerService: LogAnalyzerService);
    execute(dto: FilterLogsDTO): Promise<{
        mostFrequentError: ErrorGroup;
        errors: ErrorGroup[];
    }>;
    private getLogById;
    private createEmptyErrorGroup;
}
//# sourceMappingURL=GetErrorsUseCase.d.ts.map