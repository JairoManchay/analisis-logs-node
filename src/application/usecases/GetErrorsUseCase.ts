import { ParsedLogFile, ErrorGroup } from '../../domain/entities';
import { ILogRepository } from '../../domain/interfaces';
import { LogAnalyzerService } from '../services';
import { NotFoundError } from '../../shared/errors/AppError';

export interface FilterLogsDTO {
  logId?: string;
  dni?: string;
  service?: string;
  endpoint?: string;
  environment?: string;
  requestId?: string;
}

export class GetErrorsUseCase {
  constructor(
    private readonly repository: ILogRepository,
    private readonly analyzerService: LogAnalyzerService
  ) {}

  async execute(dto: FilterLogsDTO): Promise<{ mostFrequentError: ErrorGroup; errors: ErrorGroup[] }> {
    let logs: ParsedLogFile[];

    if (dto.logId) {
      const log = await this.getLogById(dto.logId);
      if (!log) {
        throw new NotFoundError(`Log with id ${dto.logId} not found`);
      }
      logs = [log];
    } else {
      logs = await this.repository.findAll();
    }

    const allErrors = logs.flatMap(log => {
      if (!log.analysis) return [];
      return log.analysis.errors;
    });

    let filteredErrors = allErrors;

    if (dto.dni) {
      filteredErrors = this.analyzerService.filterByDNI(filteredErrors, dto.dni);
    }

    if (dto.service) {
      filteredErrors = this.analyzerService.filterByService(filteredErrors, dto.service);
    }

    if (dto.endpoint) {
      filteredErrors = this.analyzerService.filterByEndpoint(filteredErrors, dto.endpoint);
    }

    if (dto.environment) {
      filteredErrors = this.analyzerService.filterByEnvironment(filteredErrors, dto.environment);
    }

    if (dto.requestId) {
      filteredErrors = this.analyzerService.filterByRequestId(filteredErrors, dto.requestId);
    }

    const sorted = filteredErrors.sort((a, b) => b.count - a.count);

    return {
      mostFrequentError: sorted[0] || this.createEmptyErrorGroup(),
      errors: sorted
    };
  }

  private async getLogById(id: string): Promise<ParsedLogFile | null> {
    return this.repository.findById(id);
  }

  private createEmptyErrorGroup(): ErrorGroup {
    return {
      message: 'N/A',
      service: 'N/A',
      line: 0,
      count: 0,
      dnIs: [],
      errorType: 'unknown',
      endpoint: undefined,
      environment: undefined,
      errorCode: undefined,
      requestId: undefined,
      relatedEntries: undefined
    };
  }
}
