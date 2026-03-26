import { ILogRepository } from '../../domain/interfaces/ILogRepository';
import { ILogAnalyzer, FilterCriteria } from '../../domain/interfaces/ILogAnalyzer';
import { LogEntry } from '../../domain';
import dayjs from 'dayjs';
import { ILogger } from '../../shared/logger/ILogger';

export interface ErrorsByDateResult {
  batchId: string;
  startDate: string | null;
  endDate: string | null;
  entries: LogEntry[];
  totalCount: number;
  errorsByDay: Record<string, number>;
}

export class GetErrorsByDateUseCase {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly logger: ILogger
  ) {}

  async execute(
    batchId: string,
    startDate?: string,
    endDate?: string,
    category?: string
  ): Promise<ErrorsByDateResult> {
    this.logger.info(`Getting errors by date for batch: ${batchId}`);

    const criteria: FilterCriteria = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      errorCategory: category,
    };

    const entries = await this.logRepository.filterEntries(criteria);

    const batchEntries = entries.filter(e => {
      const entryBatchId = (e.metadata as Record<string, unknown>)?.batchId as string;
      return !batchId || entryBatchId === batchId;
    });

    const errorEntries = batchEntries.filter(e => 
      e.level && ['ERROR', 'ERR', 'FATAL', 'CRITICAL'].includes(e.level.toUpperCase())
    );

    const errorsByDay: Record<string, number> = {};
    
    for (const entry of errorEntries) {
      if (entry.timestamp) {
        const dayKey = dayjs(entry.timestamp).format('YYYY-MM-DD');
        errorsByDay[dayKey] = (errorsByDay[dayKey] || 0) + 1;
      }
    }

    return {
      batchId,
      startDate: startDate || null,
      endDate: endDate || null,
      entries: errorEntries,
      totalCount: errorEntries.length,
      errorsByDay,
    };
  }
}
