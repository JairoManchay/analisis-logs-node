import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { ILogAnalyzer } from '../../domain/interfaces/ILogAnalyzer';
import { ErrorPattern } from '../../domain';
import { ILogger } from '../../shared/logger/ILogger';

export interface TopErrorsResult {
  batchId: string;
  errors: ErrorPattern[];
  totalErrors: number;
}

export class GetTopErrorsUseCase {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly logAnalyzer: ILogAnalyzer,
    private readonly logger: ILogger
  ) {}

  async execute(batchId: string, n: number = 10, category?: string): Promise<TopErrorsResult> {
    this.logger.info(`Getting top ${n} errors for batch: ${batchId}`);

    const entries = await this.logRepository.getEntriesByBatchId(batchId);
    
    let filteredEntries = entries;
    if (category) {
      filteredEntries = entries.filter(e => e.errorCategory === category);
    }

    const errorEntries = filteredEntries.filter(e => 
      e.level && ['ERROR', 'ERR', 'FATAL', 'CRITICAL'].includes(e.level.toUpperCase())
    );

    const patterns = this.logAnalyzer.detectPatterns(errorEntries);
    const topErrors = this.logAnalyzer.getTopErrors(errorEntries, n);

    return {
      batchId,
      errors: topErrors,
      totalErrors: patterns.reduce((sum, p) => sum + p.occurrences, 0),
    };
  }
}
